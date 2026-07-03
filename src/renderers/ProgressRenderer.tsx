import type { RichRendererProps } from './registry';
import type { ProgressSpec } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function ProgressRenderer({ data }: RichRendererProps) {
  const spec = data as ProgressSpec;

  return (
    <Card className="my-4">
      {spec.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{spec.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={spec.title ? 'space-y-4 pt-2' : 'space-y-4 pt-6'}>
        {spec.items.map((item, i) => {
          const max = item.max ?? 100;
          const pct = Math.max(0, Math.min(100, (item.value / max) * 100));
          return (
            <div key={i}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.value}
                  {item.max ? ` / ${item.max}` : '%'}
                </span>
              </div>
              <Progress value={pct} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
