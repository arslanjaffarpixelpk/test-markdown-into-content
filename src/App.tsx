import { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import type { SendFn } from './components/Composer';
import { fetchSamples, fetchChat, streamChat } from './api/chat';
import type { ChatMessage, SampleMeta } from '@/types';

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

/** Build the last few {user, bot} turns for `previous_chat_history`. */
function toHistory(msgs: ChatMessage[]): Array<{ user: string; bot: string }> {
  const pairs: Array<{ user: string; bot: string }> = [];
  for (let i = 0; i < msgs.length; i++) {
    if (msgs[i].role === 'user') {
      const next = msgs[i + 1];
      pairs.push({
        user: msgs[i].content,
        bot: next && next.role === 'assistant' ? next.content : '',
      });
    }
  }
  return pairs.slice(-3);
}

export default function App() {
  const [samples, setSamples] = useState<SampleMeta[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  // Fresh mirror of `messages` so send handlers read current state without
  // stale closures, and an AbortController for the in-flight stream.
  const messagesRef = useRef<ChatMessage[]>(messages);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    fetchSamples()
      .then(setSamples)
      .catch((err) => console.error('Failed to load samples', err));
  }, []);

  // Cancel any in-flight stream on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Sample playback (MSW mock) — unchanged behavior.
  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', content: `Show me the "${id}" example.` },
    ]);
    fetchChat(id)
      .then((content) => {
        setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content }]);
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: `**Error loading response:** ${String(err)}` },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Live streaming chat against the Flask AI server.
  const handleSend = useCallback<SendFn>((text, model = 'gemini') => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const history = toHistory(messagesRef.current);
    const assistantId = nextId();
    setActiveId(null);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', content: trimmed },
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ]);
    setStreaming(true);

    // Supersede any in-flight stream.
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Accumulate deltas locally; flush to React on an animation frame so the
    // full markdown pipeline doesn't re-run on every token.
    let acc = '';
    let thoughtAcc = '';
    let raf = 0;
    const flush = () => {
      raf = 0;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: acc, thought: thoughtAcc } : m,
        ),
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };

    void (async () => {
      try {
        await streamChat({
          query: trimmed,
          model,
          history,
          signal: ctrl.signal,
          onToken: (c) => {
            acc += c;
            schedule();
          },
          onThought: (c) => {
            thoughtAcc += c;
            schedule();
          },
          onEvent: (e) => {
            if (e.status === 'error') {
              acc += `\n\n**Error:** ${e.message ?? 'stream error'}`;
              schedule();
              return;
            }
            const laws = Array.isArray(e.relevant_laws) ? e.relevant_laws : undefined;
            const judgments = Array.isArray(e.relevant_judgments)
              ? e.relevant_judgments
              : undefined;
            const suggestions = Array.isArray(e.suggested_questions)
              ? e.suggested_questions
              : undefined;
            if (laws || judgments || suggestions) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        relevantLaws: laws ?? m.relevantLaws,
                        relevantJudgments: judgments ?? m.relevantJudgments,
                        suggestedQuestions: suggestions ?? m.suggestedQuestions,
                      }
                    : m,
                ),
              );
            }
          },
        });
      } catch (err) {
        if (!ctrl.signal.aborted) {
          acc += `\n\n**Error:** ${String(err)}`;
        }
      } finally {
        if (raf) cancelAnimationFrame(raf);
        // Final flush + clear this message's streaming flag.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: acc, thought: thoughtAcc, streaming: false }
              : m,
          ),
        );
        // Only clear global streaming if this is still the active stream.
        if (abortRef.current === ctrl) {
          setStreaming(false);
          abortRef.current = null;
        }
      }
    })();
  }, []);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
  }, []);

  // Reset the conversation (aborting any in-flight stream first).
  const handleClear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setActiveId(null);
    setMessages([]);
  }, []);

  // Append a rendered assistant message from an example snippet (no AI call).
  // Exercises the same render path a live AI response uses.
  const handleInsertExample = useCallback((markdown: string) => {
    setActiveId(null);
    setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: markdown }]);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar samples={samples} activeId={activeId} onSelect={handleSelect} />
      <ChatWindow
        messages={messages}
        loading={loading}
        streaming={streaming}
        onSend={handleSend}
        onStop={handleStop}
        onInsertExample={handleInsertExample}
        onClear={handleClear}
      />
    </div>
  );
}
