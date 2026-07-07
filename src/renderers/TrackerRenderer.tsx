import type { RichRendererProps } from './registry';
import type { TrackerPayload } from './schemas';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EmptyBlock } from './EmptyBlock';

export function TrackerRenderer({ data }: RichRendererProps) {
  const spec = data as TrackerPayload;
  if (spec.stages.length === 0) return <EmptyBlock type="tracker" />;

  return (
    <Card className="my-4">
      <CardContent className="p-4">
        {spec.title && <p className="mb-4 font-medium">{spec.title}</p>}
        <div className="flex items-center gap-1">
          {spec.stages.map((stage, i) => {
            const done = i < spec.current;
            const active = i === spec.current;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div className={cn('h-0.5 flex-1', done || active ? 'bg-primary' : 'bg-border')} />
                  )}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      done && 'bg-primary text-primary-foreground',
                      active && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      !done && !active && 'border bg-muted text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </div>
                  {i < spec.stages.length - 1 && (
                    <div className={cn('h-0.5 flex-1', done ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
                <p
                  className={cn(
                    'max-w-full truncate text-center text-xs',
                    active ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {stage}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
