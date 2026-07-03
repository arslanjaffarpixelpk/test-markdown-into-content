import { useState } from 'react';
import { Check } from 'lucide-react';
import type { RichRendererProps } from './registry';
import type { StepsSpec } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Numbered step-by-step guide. When `interactive` is set, each step becomes a
 * checkable item (toggles a "done" state) — useful for onboarding checklists.
 */
export function StepsRenderer({ data }: RichRendererProps) {
  const spec = data as StepsSpec;
  const [done, setDone] = useState<Set<number>>(new Set());
  const interactive = spec.interactive === true;

  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <ol className="my-4 space-y-4" style={{ listStyle: 'none', paddingLeft: 0 }}>
      {spec.steps.map((step, i) => {
        const isDone = done.has(i);
        const Marker = interactive ? 'button' : 'div';
        return (
          <li key={i} className="relative flex gap-3">
            {i < spec.steps.length - 1 && (
              <span className="absolute left-3.5 top-8 h-[calc(100%-1rem)] w-px bg-border" aria-hidden />
            )}
            <Marker
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => toggle(i) : undefined}
              className={cn(
                'z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                isDone
                  ? 'border-success bg-success text-success-foreground'
                  : 'border-border bg-muted text-foreground',
                interactive && 'cursor-pointer',
              )}
              aria-pressed={interactive ? isDone : undefined}
            >
              {isDone ? <Check className="h-4 w-4" /> : i + 1}
            </Marker>
            <div className="pt-0.5">
              <div className={cn('text-[15px] font-semibold', isDone && 'text-muted-foreground line-through')}>
                {step.title}
              </div>
              {step.body && <p className="mt-0.5 text-sm text-muted-foreground">{step.body}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
