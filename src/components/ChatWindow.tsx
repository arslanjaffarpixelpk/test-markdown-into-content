import { useEffect, useRef } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { Message } from './Message';
import { Composer, type SendFn } from './Composer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  loading: boolean;
  streaming: boolean;
  onSend: SendFn;
  onStop?: () => void;
  onInsertExample?: (markdown: string) => void;
  onClear?: () => void;
}

export function ChatWindow({
  messages,
  loading,
  streaming,
  onSend,
  onStop,
  onInsertExample,
  onClear,
}: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, streaming]);

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4 sm:px-8">
        <div className="text-sm font-medium text-muted-foreground">
          {streaming ? 'Streaming…' : 'Conversation'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={onClear}
          disabled={messages.length === 0 || streaming}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <div className="px-4 py-7 sm:px-8">
          {messages.length === 0 && !loading && (
            <div className="mx-auto mt-[12vh] max-w-md text-center text-muted-foreground">
              <Sparkles className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-foreground">Rich Content Rendering</h2>
              <p className="mt-1.5">
                Ask the AI below to stream a live response, pick a sample from the left, or use{' '}
                <span className="font-medium">Insert example</span> to render any rich block.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} message={m} onAsk={onSend} />
          ))}

          {loading && (
            <div className="mx-auto mb-7 flex max-w-4xl gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 pt-2.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <Composer
        onSend={onSend}
        onStop={onStop}
        onInsertExample={onInsertExample}
        disabled={streaming}
      />
    </main>
  );
}
