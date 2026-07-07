import { Skeleton } from '@/components/ui/skeleton';

/**
 * Typed placeholder shown while a rich fence is still streaming in (its JSON is
 * incomplete/unparseable). The shape hints at the block type so the layout
 * doesn't jump when the real component resolves.
 */
export function BlockSkeleton({ type }: { type: string }) {
  return (
    <div
      className="my-4 rounded-lg border border-dashed p-4"
      role="status"
      aria-label={`Rendering ${type} block`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60" />
        Rendering <code className="text-xs">{type}</code>…
      </div>
      {type === 'chart' ? (
        <div className="flex h-40 items-end gap-2">
          {[60, 85, 45, 70, 95, 55, 75].map((h, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : type === 'compare' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2 rounded-md border p-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : type === 'widget' ? (
        <Skeleton className="h-48 w-full" />
      ) : type === 'svg' || type === 'mermaid' ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-px grow-0" style={{ height: 16 }} />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ) : type === 'timeline' || type === 'steps' || type === 'stepper' ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : type === 'faq' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : type === 'accordion' ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : type === 'tracker' ? (
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 flex-1" />
          ))}
        </div>
      ) : type === 'json' ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      )}
    </div>
  );
}
