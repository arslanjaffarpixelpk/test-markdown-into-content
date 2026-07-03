import type { RichRendererProps } from './registry';
import type { BadgesSpec } from '@/types';
import { Badge } from '@/components/ui/badge';

export function BadgesRenderer({ data }: RichRendererProps) {
  const spec = data as BadgesSpec;

  return (
    <div className="my-4 flex flex-wrap items-center gap-2">
      {spec.title && <span className="mr-1 text-sm font-medium text-muted-foreground">{spec.title}</span>}
      {spec.badges.map((b, i) => (
        <Badge key={i} variant={b.variant ?? 'default'}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}
