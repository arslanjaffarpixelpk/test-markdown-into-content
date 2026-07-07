import { useEffect, useId, useRef, useState } from 'react';
import type { RichRendererProps } from './registry';
import type { MermaidPayload } from './schemas';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/useTheme';

export function MermaidRenderer({ data }: RichRendererProps) {
  const code = data as MermaidPayload;
  const { theme } = useTheme();
  const id = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setError(null);
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
        });
        const { svg } = await mermaid.render(`mermaid-${id}`, code.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [code, theme, id]);

  if (error) {
    return (
      <Card className="my-4 border-destructive/50">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">Could not render Mermaid diagram: {error}</p>
          <pre className="mt-2 overflow-x-auto rounded bg-muted/50 p-2 text-xs">{code}</pre>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-4 overflow-hidden">
      <CardContent className="overflow-x-auto p-4">
        <div ref={containerRef} className="mermaid-diagram flex justify-center [&_svg]:max-w-full" />
      </CardContent>
    </Card>
  );
}
