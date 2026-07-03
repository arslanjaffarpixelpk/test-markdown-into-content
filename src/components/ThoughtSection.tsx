import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThoughtSectionProps {
  thought: string;
  streaming?: boolean;
}

/**
 * Collapsible "AI Thinking" panel for the streamed thought text. Auto-expands
 * while streaming and collapses once the answer is complete. A lightweight
 * take on law-bot's ThoughtSection (no typing effect / HTML branch).
 */
export function ThoughtSection({ thought, streaming }: ThoughtSectionProps) {
  const [expanded, setExpanded] = useState<boolean>(!!streaming);

  // Follow the stream: open while thinking, collapse when it finishes.
  useEffect(() => {
    setExpanded(!!streaming);
  }, [streaming]);

  if (!thought.trim()) return null;

  const preview = thought
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\*\*/g, '');

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/10"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Wand2 className={cn('h-4 w-4 shrink-0 text-primary', streaming && 'animate-pulse')} />
          <span className="text-sm font-semibold text-primary">AI Thinking</span>
          {!expanded && (
            <span className="ml-1 line-clamp-1 text-xs italic text-muted-foreground">
              {preview || 'Reasoning…'}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-primary transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="markdown-body border-t border-primary/15 px-4 py-3 text-sm text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{thought}</ReactMarkdown>
            {streaming && (
              <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary/60 align-middle" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
