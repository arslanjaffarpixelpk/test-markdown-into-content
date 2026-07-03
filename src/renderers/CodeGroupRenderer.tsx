import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { RichRendererProps } from './registry';
import type { CodeGroupSpec } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

/** Multi-file / multi-language code blocks in tabs (e.g. npm / pnpm / yarn). */
export function CodeGroupRenderer({ data }: RichRendererProps) {
  const spec = data as CodeGroupSpec;
  const [copied, setCopied] = useState<number | null>(null);

  const copy = (i: number, code: string) => {
    void navigator.clipboard?.writeText(code);
    setCopied(i);
    window.setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border">
      <Tabs defaultValue="0">
        <div className="flex items-center justify-between border-b bg-muted/40 pr-2">
          <TabsList className="h-9 rounded-none border-0 bg-transparent p-0">
            {spec.tabs.map((t, i) => (
              <TabsTrigger
                key={i}
                value={String(i)}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {spec.tabs.map((t, i) => (
          <TabsContent key={i} value={String(i)} className="relative m-0">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              aria-label="Copy code"
              onClick={() => copy(i, t.code)}
            >
              {copied === i ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <pre className="overflow-x-auto p-4 text-sm">
              <code>{t.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
