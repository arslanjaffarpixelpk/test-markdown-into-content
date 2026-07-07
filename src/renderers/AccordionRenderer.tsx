import type { RichRendererProps } from './registry';
import type { AccordionPayload } from './schemas';
import { EmptyBlock } from './EmptyBlock';

export function AccordionRenderer({ data }: RichRendererProps) {
  const { items } = data as AccordionPayload;
  if (items.length === 0) return <EmptyBlock type="accordion" />;

  return (
    <div className="my-4 space-y-2">
      {items.map((item, i) => (
        <details
          key={i}
          className="rounded-lg border bg-card px-4 py-2"
          open={i === 0}
        >
          <summary className="cursor-pointer select-none py-1 font-medium">{item.title}</summary>
          <p className="mt-2 pb-2 text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
