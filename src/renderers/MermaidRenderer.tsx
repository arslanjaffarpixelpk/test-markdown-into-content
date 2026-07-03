import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { RichRendererProps } from './registry';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

function ensureInit(dark: boolean) {
  // Re-init before each render so the diagram matches the current light/dark theme.
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict', // no click-through JS from AI-authored diagrams
    theme: dark ? 'dark' : 'default',
    fontFamily: 'inherit',
  });
}

/**
 * Flow / sequence / gantt diagrams. The block body is raw Mermaid DSL, so the
 * registry entry parses with identity and we render `raw` directly.
 */
export function MermaidRenderer({ raw }: RichRendererProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const dark = document.documentElement.classList.contains('dark');
    ensureInit(dark);
    mermaid
      .render(`mermaid-${rawId}`, raw.trim())
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [raw, rawId]);

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Diagram error</AlertTitle>
        <AlertDescription>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{raw}</pre>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="my-4">
      <CardContent className="rich-mermaid flex justify-center overflow-x-auto pt-6">
        <div ref={containerRef} />
      </CardContent>
    </Card>
  );
}
