import { getAiMode, AI_BASE, X_API_KEY, AI_MODEL } from '@/lib/config';
import { mockStreamChat } from './mockChat';

/**
 * The single integration point with the AI backend.
 *
 * `streamChat` powers the chat composer. It dispatches to either the mock
 * backend (simulated streaming of local fixtures, no server) or the real Flask
 * AI server over SSE, based on `AI_MODE` (VITE_AI_MODE). App code imports only
 * this function, so switching modes needs no changes elsewhere.
 *
 * The real SSE handling is ported from law-bot-frontend's ChatHandler.
 */

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
  message?: string;
}

export interface StreamChatArgs {
  /** The user's question. */
  query: string;
  /** LLM model id (defaults to VITE_AI_MODEL / "gemini"). */
  model?: string;
  /** Recent turns for context; the last few are sent as `previous_chat_history`. */
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

/** Dispatch to the mock or real backend based on the effective AI mode. */
export function streamChat(args: StreamChatArgs): Promise<void> {
  return getAiMode() === 'mock' ? mockStreamChat(args) : realStreamChat(args);
}

/**
 * Return a cached chat session token, or mint one from the Flask server.
 * On failure it falls back to a local token so the app never blocks.
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
 * Stream an assistant response from the Flask AI server (SSE).
 *
 * A POST returns `text/event-stream`, read incrementally, with each line
 * stripped of its `data:` prefix and JSON objects reassembled by brace-depth
 * balancing (a single event may span multiple lines).
 */
async function realStreamChat(args: StreamChatArgs): Promise<void> {
  const { query, model = AI_MODEL, history = [], onToken, onThought, onEvent, signal } = args;

  const session_token = await ensureSessionToken(signal);
  const userId = localStorage.getItem('userId') || '';

  const formData = new FormData();
  formData.append('session_token', session_token);
  formData.append('query', query);
  formData.append('llm_model', model);
  if (userId) formData.append('user_id', userId);
  formData.append('previous_chat_history', JSON.stringify(history.slice(-3)));

  const response = await fetch(`${AI_BASE}/api/chat_svg`, {
    method: 'POST',
    headers: { Accept: 'text/event-stream', 'X-API-Key': X_API_KEY },
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
  const countDelta = (s: string) => (s.match(/\{/g) || []).length - (s.match(/\}/g) || []).length;

  const feedLine = (rawLine: string) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    let line = trimmed;
    if (line.startsWith('data:')) line = line.slice(5).trim();
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
        /* ignore malformed keepalive */
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

  if (!completed && buffer.length > 0) feedLine(buffer);
}
