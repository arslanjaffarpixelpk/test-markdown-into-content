import type { RichRendererProps } from './registry';
import type { TimelinePayload } from './schemas';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STATUS_DOT = {
  done: 'bg-primary border-primary',
  current: 'bg-accent-foreground border-accent-foreground ring-4 ring-primary/20',
  upcoming: 'bg-muted border-border',
} as const;

export function TimelineRenderer({ data }: RichRendererProps) {
  const { events } = data as TimelinePayload;

  return (
    <div className="my-4 space-y-0">
      {events.map((event, i) => {
        const status = event.status ?? (i < events.length - 1 ? 'done' : 'current');
        const isLast = i === events.length - 1;

        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'mt-1 h-3 w-3 shrink-0 rounded-full border-2',
                  STATUS_DOT[status] ?? STATUS_DOT.upcoming,
                )}
              />
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>
            <Card className={cn('mb-4 flex-1', status === 'current' && 'border-primary/40')}>
              <CardContent className="p-4">
                {event.date && (
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{event.date}</p>
                )}
                <p className="font-medium">{event.title}</p>
                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
