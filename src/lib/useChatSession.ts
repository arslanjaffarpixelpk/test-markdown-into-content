import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { ChatMessage } from '@/components/Message';
import { streamChat, type StreamEvent } from '@/api/chat';

/** Build {user, bot} history pairs from the visible transcript. */
function historyFrom(messages: ChatMessage[]): Array<{ user: string; bot: string }> {
  const pairs: Array<{ user: string; bot: string }> = [];
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
      pairs.push({ user: messages[i].content, bot: messages[i + 1].content });
    }
  }
  return pairs;
}

/** Coalesce rapid token/thought chunks into one state update per animation frame. */
function useRafBatchedAppend(setMessages: Dispatch<SetStateAction<ChatMessage[]>>) {
  const pendingRef = useRef(new Map<string, { content?: string; thought?: string }>());
  const rafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const pending = pendingRef.current;
    if (pending.size === 0) return;
    pendingRef.current = new Map();

    setMessages((prev) =>
      prev.map((m) => {
        const delta = pending.get(m.id);
        if (!delta) return m;
        return {
          ...m,
          ...(delta.content ? { content: m.content + delta.content } : {}),
          ...(delta.thought ? { thought: (m.thought ?? '') + delta.thought } : {}),
        };
      }),
    );
  }, [setMessages]);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  const append = useCallback(
    (id: string, field: 'content' | 'thought', chunk: string) => {
      const entry = pendingRef.current.get(id) ?? {};
      entry[field] = (entry[field] ?? '') + chunk;
      pendingRef.current.set(id, entry);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const flushNow = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    flush();
  }, [flush]);

  return { append, flushNow };
}

/**
 * The chat engine. `sendPrompt` appends a user turn + an assistant turn and
 * streams the reply from the AI backend (mock or real Flask SSE — see
 * `streamChat`). It is the single entry point used by BOTH the composer and
 * interactive blocks (Compare buttons, Widget iframes), so a widget can feed a
 * new prompt straight back into the conversation.
 */
export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const patch = useCallback((id: string, fn: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
  }, []);

  const { append, flushNow } = useRafBatchedAppend(setMessages);

  const sendPrompt = useCallback(
    (text: string) => {
      const query = text.trim();
      if (!query || abortRef.current) return; // ignore empty / re-entrant sends

      setSuggestions([]);
      const userMsg: ChatMessage = { id: `m${++idRef.current}`, role: 'user', content: query };
      const assistantId = `m${++idRef.current}`;
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' };

      let history: Array<{ user: string; bot: string }> = [];
      setMessages((prev) => {
        history = historyFrom(prev);
        return [...prev, userMsg, assistantMsg];
      });
      setStreamingId(assistantId);

      const controller = new AbortController();
      abortRef.current = controller;

      streamChat({
        query,
        history,
        signal: controller.signal,
        onToken: (chunk) => append(assistantId, 'content', chunk),
        onThought: (chunk) => append(assistantId, 'thought', chunk),
        onEvent: (evt: StreamEvent) => {
          if (evt.status === 'error') {
            patch(assistantId, (m) => ({ ...m, error: evt.message || 'The AI service returned an error.' }));
          }
          if (Array.isArray(evt.suggested_questions) && evt.suggested_questions.length) {
            setSuggestions(evt.suggested_questions.slice(0, 4));
          }
        },
      })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          console.error('streamChat failed', err);
          patch(assistantId, (m) => ({
            ...m,
            error: m.content ? undefined : 'Could not reach the AI backend. Try the Mock mode toggle in the header.',
          }));
        })
        .finally(() => {
          flushNow();
          abortRef.current = null;
          setStreamingId(null);
        });
    },
    [patch, append, flushNow],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    flushNow();
    setStreamingId(null);
  }, [flushNow]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamingId(null);
    setSuggestions([]);
    setMessages([]);
  }, []);

  return { messages, streamingId, suggestions, sendPrompt, stop, reset, isStreaming: streamingId !== null };
}
