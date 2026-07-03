import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Message } from './Message';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage } from '@/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  loading: boolean;
}

export function ChatWindow({ messages, loading }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <main className="min-w-0 flex-1">
      <ScrollArea className="h-full">
        <div className="px-4 py-7 sm:px-8">
          {messages.length === 0 && !loading && (
            <div className="mx-auto mt-[14vh] max-w-md text-center text-muted-foreground">
              <Sparkles className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-foreground">Rich Content Rendering</h2>
              <p className="mt-1.5">Pick a sample AI response from the left to see it rendered.</p>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}

          {loading && (
            <div className="mx-auto mb-7 flex max-w-3xl gap-3.5">
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
    </main>
  );
}
