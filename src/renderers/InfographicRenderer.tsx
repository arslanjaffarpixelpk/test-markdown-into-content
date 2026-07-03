import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { RichRendererProps } from './registry';
import type { InfographicSpec } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const;

const TREND_COLOR: Record<string, string> = {
  up: 'text-success',
  down: 'text-destructive',
  flat: 'text-muted-foreground',
};

export function InfographicRenderer({ data }: RichRendererProps) {
  const spec = data as InfographicSpec;

  return (
    <section className="my-4">
      {spec.title && <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{spec.title}</h3>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {spec.stats.map((s, i) => {
          const trend = s.trend ?? 'flat';
          const Icon = TREND_ICON[trend];
          return (
            <Card key={i}>
              <CardContent className="p-4">
                {s.icon && <div className="text-xl">{s.icon}</div>}
                <div className="mt-1.5 text-2xl font-bold leading-none">
                  {s.value}
                  {s.unit && <span className="ml-0.5 text-sm font-semibold text-muted-foreground">{s.unit}</span>}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                {s.delta && (
                  <div className={cn('mt-2 flex items-center gap-1 text-xs font-semibold', TREND_COLOR[trend])}>
                    <Icon className="h-3.5 w-3.5" />
                    {s.delta}
                  </div>
                )}
                {s.description && <p className="mt-1.5 text-xs text-muted-foreground">{s.description}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
