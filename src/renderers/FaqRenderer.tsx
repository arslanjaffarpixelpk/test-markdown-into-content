import type { RichRendererProps } from './registry';
import type { FaqPayload } from './schemas';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyBlock } from './EmptyBlock';

export function FaqRenderer({ data }: RichRendererProps) {
  const items = data as FaqPayload;
  if (items.length === 0) return <EmptyBlock type="faq" />;

  return (
    <div className="my-4 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <p className="font-medium">{item.question}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
