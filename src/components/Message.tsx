import { memo } from 'react';
import { CopyMarkdownButton } from '@/components/CopyMarkdownButton';
import { MarkdownRenderer } from '@/markdown/MarkdownRenderer';
import type { ChatContextValue } from '@/markdown/ChatContext';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Assistant "thinking" stream (shown collapsibly), if the backend sends one. */
  thought?: string;
  /** Set when the turn failed, so the bubble can show an error instead. */
  error?: string;
}

interface MessageProps {
  message: ChatMessage;
  /** True while this specific assistant message is still streaming. */
  streaming?: boolean;
  chat?: ChatContextValue;
}

export const Message = memo(function Message({ message, streaming = false, chat }: MessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  const showCopy = !streaming && !!message.content && !message.error;

  return (
    <div className="flex justify-start">
      <div className={cn('w-full max-w-full rounded-2xl rounded-bl-sm border bg-card px-4 py-3')}>
        <div className="relative">
          {showCopy && (
            <div className="absolute right-0 top-0">
              <CopyMarkdownButton content={message.content} />
            </div>
          )}
          <div className={cn(showCopy && 'pr-8')}>
            {message.thought && (
              <details className="mb-2 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none font-medium">Thinking</summary>
                <p className="mt-1 whitespace-pre-wrap">{message.thought}</p>
              </details>
            )}
            {message.error ? (
              <p className="text-sm text-destructive">⚠ {message.error}</p>
            ) : message.content ? (
              <MarkdownRenderer content={message.content} streaming={streaming} chat={chat} />
            ) : (
              <span className="inline-flex gap-1 py-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
