import type { RichRendererProps } from './registry';
import type { TimelineSpec } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DOT: Record<string, string> = {
  done: 'bg-success border-success',
  active: 'bg-primary border-primary ring-4 ring-primary/20',
  upcoming: 'bg-background border-muted-foreground/40',
  default: 'bg-background border-muted-foreground/40',
};

export function TimelineRenderer({ data }: RichRendererProps) {
  const spec = data as TimelineSpec;

  return (
    <Card className="my-4">
      {spec.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{spec.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={spec.title ? 'pt-2' : 'pt-6'}>
        <ol className="relative">
          {spec.events.map((ev, i) => {
            const last = i === spec.events.length - 1;
            return (
              <li key={i} className={cn('relative pl-8', !last && 'pb-6')}>
                {!last && (
                  <span className="absolute left-[5px] top-3 h-full w-px bg-border" aria-hidden />
                )}
                <span
                  className={cn(
                    'absolute left-0 top-1.5 h-3 w-3 rounded-full border-2',
                    DOT[ev.status ?? 'default'],
                  )}
                  aria-hidden
                />
                <div className="text-xs font-medium text-muted-foreground">{ev.date}</div>
                <div className="text-[15px] font-semibold leading-snug">{ev.title}</div>
                {ev.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{ev.description}</p>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
