import type { RichRendererProps } from './registry';
import type { AccordionSpec } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function AccordionRenderer({ data }: RichRendererProps) {
  const spec = data as AccordionSpec;

  return (
    <div className="my-4 rounded-lg border px-4">
      <Accordion type="single" collapsible>
        {spec.items.map((item, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger className="text-left text-sm font-medium">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {item.body}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
