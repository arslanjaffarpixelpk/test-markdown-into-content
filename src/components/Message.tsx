import { Sparkles, User } from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

export function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className="mx-auto mb-7 flex max-w-3xl gap-3.5">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
          isUser ? 'bg-muted' : 'border-transparent bg-primary text-primary-foreground',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {isUser ? (
          <p className="m-0">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
}
