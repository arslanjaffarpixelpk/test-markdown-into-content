import { useState } from 'react';
import { Check, Code2, Copy, Eye, Sparkles, User } from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { ThoughtSection } from './ThoughtSection';
import { References } from './ReferenceCards';
import { SuggestedQuestions } from './SuggestedQuestions';
import { Button } from '@/components/ui/button';
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

function AssistantBody({ message, onAsk }: { message: ChatMessage; onAsk: SendFn }) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const awaitingFirstToken = message.streaming && !message.content && !message.thought;
  const showTools = !message.streaming && !!message.content;

  const copy = () => {
    void navigator.clipboard?.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {message.thought && <ThoughtSection thought={message.thought} streaming={message.streaming} />}
      {awaitingFirstToken ? (
        <TypingDots />
      ) : showRaw ? (
        <pre className="my-1 overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
          <code>{message.content}</code>
        </pre>
      ) : (
        <MarkdownRenderer content={message.content} streaming={message.streaming} />
      )}

      {showTools && (
        <div className="mt-2 flex items-center gap-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => setShowRaw((v) => !v)}
          >
            {showRaw ? <Eye className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
            {showRaw ? 'Rendered' : 'View raw'}
          </Button>
        </div>
      )}

      <References laws={message.relevantLaws} judgments={message.relevantJudgments} />
      <SuggestedQuestions questions={message.suggestedQuestions} onAsk={onAsk} />
    </>
  );
}

export function Message({ message, onAsk }: { message: ChatMessage; onAsk: SendFn }) {
  const isUser = message.role === 'user';

  return (
    <div className="group mx-auto mb-7 flex max-w-4xl gap-3.5">
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
          <AssistantBody message={message} onAsk={onAsk} />
        )}
      </div>
    </div>
  );
}
