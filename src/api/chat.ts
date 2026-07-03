import type { SampleMeta } from '../types';

/**
 * The integration point with the "AI backend".
 *
 * - `fetchSamples` / `fetchChat` drive the MSW-mocked sample sidebar (static
 *   markdown fixtures). Left untouched.
 * - `streamChat` / `ensureSessionToken` talk to the real (local) Flask AI server
 *   over Server-Sent Events, ported from law-bot-frontend's ChatHandler. This is
 *   what powers the live chat composer.
 *
 * The AI base URL comes from `VITE_AI_SERVER_URL`. Set it to `/ai` (default) to
 * route through the Vite dev proxy at `http://localhost:5000` and avoid CORS.
 */

// Accept either a server origin ("https://host", "http://localhost:5000", or the
// "/ai" proxy path) OR the full chat endpoint ("https://host/api/chat") — normalize
// to the base so `${AI_BASE}/api/chat` and `${AI_BASE}/api/create_chat_session`
// resolve correctly in both cases.
const AI_BASE = (import.meta.env.VITE_AI_SERVER_URL ?? '')
  .replace(/\/+$/, '')
  .replace(/\/api\/chat$/, '');
const X_API_KEY = import.meta.env.VITE_XAPIKey ?? '';

// ---------------------------------------------------------------------------
// Mock sample playback (unchanged) — served by MSW at relative /api/* paths.
// ---------------------------------------------------------------------------

/** List the available sample responses (drives the sidebar). */
export async function fetchSamples(): Promise<SampleMeta[]> {
  const res = await fetch('/api/samples');
  if (!res.ok) throw new Error(`fetchSamples failed: ${res.status}`);
  return res.json();
}

/** Request a sample assistant response; returns markdown. */
export async function fetchChat(sampleId: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sampleId }),
  });
  if (!res.ok) throw new Error(`fetchChat failed: ${res.status}`);
  const data = (await res.json()) as { content: string };
  return data.content;
}

// ---------------------------------------------------------------------------
// Live streaming chat against the Flask AI server (SSE).
// ---------------------------------------------------------------------------

/** A single Server-Sent-Event payload from the Flask stream (heuristic shape). */
export interface StreamEvent {
  status?: string;
  type?: string;
  step?: string;
  data?: unknown;
  content_type?: string;
  is_thought?: boolean;
  streaming?: boolean;
  thinking?: string;
  relevant_laws?: unknown[];
  relevant_judgments?: unknown[];
  suggested_questions?: string[];
  language?: string;
  message?: string;
}

export interface StreamChatArgs {
  /** The user's question. */
  query: string;
  /** LLM model id (e.g. "gemini"). */
  model?: string;
  /** Recent turns for context; last few are sent as `previous_chat_history`. */
  history?: Array<{ user: string; bot: string }>;
  /** Called with each answer delta (append to the assistant message). */
  onToken: (chunk: string) => void;
  /** Called with each "thinking" delta. */
  onThought?: (chunk: string) => void;
  /** Called with status / completion / error events (carries refs + suggestions). */
  onEvent?: (evt: StreamEvent) => void;
  /** Abort signal to cancel an in-flight stream. */
  signal?: AbortSignal;
}

/**
 * Return a cached chat session token, or mint one from the Flask server.
 * Mirrors law-bot's `generateSessionToken`: on failure it falls back to a local
 * token so the app never blocks (the server may still reject it — see plan).
 */
export async function ensureSessionToken(signal?: AbortSignal): Promise<string> {
  const cached = localStorage.getItem('session_token');
  if (cached) return cached;

  try {
    const res = await fetch(`${AI_BASE}/api/create_chat_session`, {
      method: 'GET',
      headers: { 'X-API-Key': X_API_KEY },
      signal,
    });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { session_token?: string };
      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
        return data.session_token;
      }
    }
  } catch (err) {
    console.warn('create_chat_session failed, using fallback token', err);
  }

  const fallback = `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  localStorage.setItem('session_token', fallback);
  return fallback;
}

/**
 * Stream an assistant response from the Flask AI server.
 *
 * Ports the SSE handling from law-bot-frontend/src/components/home/ChatHandler.tsx:
 * a POST that returns `text/event-stream`, read incrementally, with each line
 * stripped of its `data:` prefix and JSON objects reassembled by brace-depth
 * balancing (they may span multiple lines). Events are dispatched to the
 * callbacks. Resolves when the stream ends or completes.
 */
export async function streamChat(args: StreamChatArgs): Promise<void> {
  const { query, model = 'gemini', history = [], onToken, onThought, onEvent, signal } = args;

  const session_token = await ensureSessionToken(signal);
  const userId = localStorage.getItem('userId') || '';

  const formData = new FormData();
  formData.append('session_token', session_token);
  formData.append('query', query);
  formData.append('llm_model', model);
  if (userId) formData.append('user_id', userId);
  formData.append('previous_chat_history', JSON.stringify(history.slice(-3)));

  const response = await fetch(`${AI_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'X-API-Key': X_API_KEY,
    },
    body: formData,
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`chat request failed: ${response.status} ${response.statusText}`);
  }

  // --- Event dispatch. Branch order is load-bearing: `thinking` is tested
  // before `content`, and `typeof data === 'string'` is the answer catch-all. ---
  let completed = false;
  const handleEvent = (evt: StreamEvent) => {
    if (!evt || typeof evt !== 'object') return;

    if (evt.status === 'error') {
      onEvent?.(evt);
      completed = true;
      return;
    }

    if (evt.type === 'status' && evt.step) {
      onEvent?.(evt);
      return;
    }

    if (evt.type === 'thinking' || evt.content_type === 'thinking' || evt.is_thought) {
      const chunk = typeof evt.data === 'string' ? evt.data : '';
      if (chunk) onThought?.(chunk);
      return;
    }

    if (
      evt.type === 'content' ||
      evt.content_type === 'response' ||
      evt.streaming === true ||
      typeof evt.data === 'string'
    ) {
      const chunk = typeof evt.data === 'string' ? evt.data : '';
      if (chunk) onToken(chunk);
      return;
    }

    if (
      evt.type === 'completion' ||
      evt.status === 'completed' ||
      evt.status === 'complete' ||
      evt.streaming === false
    ) {
      if (typeof evt.thinking === 'string' && evt.thinking) onThought?.(evt.thinking);
      onEvent?.(evt);
      completed = true;
      return;
    }
  };

  // --- Brace-balanced reassembly of JSON events split across lines. ---
  let eventBuffer = '';
  let braceDepth = 0;
  const countDelta = (s: string) =>
    (s.match(/\{/g) || []).length - (s.match(/\}/g) || []).length;

  const feedLine = (rawLine: string) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    let line = trimmed;
    if (line.startsWith('data:')) line = line.slice(5).trim();
    // Ignore keepalive tokens (anything before the first `{`).
    if (!line.startsWith('{') && eventBuffer === '') return;

    if (eventBuffer === '') {
      eventBuffer = line;
      braceDepth = countDelta(line);
    } else {
      eventBuffer += line;
      braceDepth += countDelta(line);
    }

    if (braceDepth === 0 && eventBuffer.startsWith('{')) {
      try {
        handleEvent(JSON.parse(eventBuffer) as StreamEvent);
      } catch {
        // ignore malformed keepalive
      }
      eventBuffer = '';
      braceDepth = 0;
    }
  };

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  // Inactivity watchdog: stop if no chunk arrives for 20s after the stream started.
  let lastChunkAt = Date.now();
  const watchdogMs = 20000;
  let started = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      lastChunkAt = Date.now();
      started = true;

      let idx = buffer.indexOf('\n');
      while (idx >= 0) {
        const rawLine = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        feedLine(rawLine);
        if (completed) break;
        idx = buffer.indexOf('\n');
      }
    }
    if (completed) break;
    if (started && Date.now() - lastChunkAt > watchdogMs) break;
  }

  // Flush any trailing partial line.
  if (!completed && buffer.length > 0) feedLine(buffer);
}
