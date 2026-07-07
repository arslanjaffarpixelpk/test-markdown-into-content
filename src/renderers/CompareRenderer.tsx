import { Check, Sparkles, ArrowRight } from 'lucide-react';
import type { RichRendererProps } from './registry';
import type { ComparePayload } from './schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChat } from '@/markdown/ChatContext';
import { cn } from '@/lib/utils';

/**
 * Interactive comparison cards. Each option shows its bullet points; the
 * "Recommended" one is highlighted. Clicking an option's button sends a prompt
 * back into the chat (option.prompt, falling back to its title) — demonstrating
 * the sendPrompt bridge.
 */
export function CompareRenderer({ data }: RichRendererProps) {
  const spec = data as ComparePayload;
  const { sendPrompt } = useChat();

  return (
    <div className="my-4">
      {spec.title && <h4 className="mb-3 text-sm font-semibold">{spec.title}</h4>}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))` }}
      >
        {spec.options.map((opt, i) => (
          <Card
            key={i}
            className={cn(
              'flex flex-col',
              opt.recommended && 'border-primary ring-1 ring-primary/40',
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{opt.title}</CardTitle>
                {opt.recommended && (
                  <Badge variant="success" className="gap-1">
                    <Sparkles className="h-3 w-3" /> Recommended
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {opt.points.map((p, j) => (
                  <li key={j} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant={opt.recommended ? 'default' : 'outline'}
                disabled={!sendPrompt}
                onClick={() => sendPrompt?.(opt.prompt ?? `Tell me more about "${opt.title}".`)}
              >
                Choose {opt.title}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
