import { useMemo } from 'react';
import { RotateCcw, Square } from 'lucide-react';
import { Message } from './Message';
import { Composer } from './Composer';
import { Button } from '@/components/ui/button';
import { useChatSession } from '@/lib/useChatSession';

export function ChatView() {
  const { messages, streamingId, suggestions, sendPrompt, stop, reset, isStreaming } = useChatSession();

  // The chat bridge handed to every rendered message. Interactive blocks call
  // `sendPrompt`, which appends a new user turn + streams a reply — same path as
  // the composer.
  const chat = useMemo(() => ({ sendPrompt }), [sendPrompt]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Ask a question to stream a response from the AI. Rich blocks (callout, compare,
              chart, widget) render inline — then click a <strong>Compare</strong> option or a{' '}
              <strong>Widget</strong> button to feed a new prompt back into the chat.
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} message={m} streaming={m.id === streamingId} chat={chat} />
          ))}

          {!isStreaming && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendPrompt(s)}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-2 pt-2">
            {isStreaming && (
              <Button variant="ghost" size="sm" onClick={stop}>
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
            )}
            {messages.length > 0 && !isStreaming && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" /> Clear conversation
              </Button>
            )}
          </div>
        </div>
      </div>
      <Composer onSend={sendPrompt} disabled={isStreaming} />
    </div>
  );
}
