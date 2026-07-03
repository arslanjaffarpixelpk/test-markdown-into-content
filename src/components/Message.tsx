import { Sparkles, User } from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { ThoughtSection } from './ThoughtSection';
import { References } from './ReferenceCards';
import { SuggestedQuestions } from './SuggestedQuestions';
import type { SendFn } from './Composer';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 pt-2.5">
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  );
}

export function Message({ message, onAsk }: { message: ChatMessage; onAsk: SendFn }) {
  const isUser = message.role === 'user';
  // Waiting for the first answer token (and nothing to show yet).
  const awaitingFirstToken = message.streaming && !message.content && !message.thought;

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
          <p className="m-0 whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            {message.thought && (
              <ThoughtSection thought={message.thought} streaming={message.streaming} />
            )}
            {awaitingFirstToken ? (
              <TypingDots />
            ) : (
              <MarkdownRenderer content={message.content} streaming={message.streaming} />
            )}
            <References laws={message.relevantLaws} judgments={message.relevantJudgments} />
            <SuggestedQuestions questions={message.suggestedQuestions} onAsk={onAsk} />
          </>
        )}
      </div>
    </div>
  );
}
