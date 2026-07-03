import type { RichRendererProps } from './registry';
import type { CardsSpec } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CardsRenderer({ data }: RichRendererProps) {
  const spec = data as CardsSpec;
  const cols = spec.columns ?? 2;

  return (
    <div
      className="my-4 grid gap-3"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${cols >= 3 ? 180 : 240}px, 1fr))` }}
    >
      {spec.cards.map((c, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{c.title}</CardTitle>
              {c.badge && <Badge variant="secondary">{c.badge}</Badge>}
            </div>
            {c.description && <CardDescription>{c.description}</CardDescription>}
          </CardHeader>
          {c.body && <CardContent className="pt-0 text-sm text-muted-foreground">{c.body}</CardContent>}
          {c.footer && (
            <CardFooter className="mt-auto pt-0 text-xs text-muted-foreground">{c.footer}</CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
