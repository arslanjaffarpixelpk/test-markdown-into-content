import { useMemo } from 'react';
import { FileWarning } from 'lucide-react';
import { getRenderer } from '../renderers/registry';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RichBlockProps {
  /** Block type — the fence language (```chart) or directive name (:::chart). */
  type: string;
  /** Raw block body text. */
  raw: string;
  /** Directive attributes, if any. */
  attributes?: Record<string, string>;
}

/** Shown when a type is unknown or its body fails to parse. Never crashes. */
function Fallback({ label, type, raw }: { label: string; type: string; raw: string }) {
  return (
    <Alert className="my-4 border-warning/50 [&>svg]:text-warning">
      <FileWarning className="h-4 w-4" />
      <AlertTitle>
        {label} <code className="ml-1 text-xs font-normal text-muted-foreground">{type}</code>
      </AlertTitle>
      <AlertDescription>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-muted/50 p-2 text-xs">
          {raw}
        </pre>
      </AlertDescription>
    </Alert>
  );
}

/**
 * The single dispatcher for every rich block, regardless of whether it arrived
 * as a fenced code block or a remark directive. Looks the type up in the
 * registry, parses the body, and renders inside an ErrorBoundary.
 */
export function RichBlock({ type, raw, attributes }: RichBlockProps) {
  const entry = getRenderer(type);

  const parsed = useMemo(() => {
    if (!entry) return { ok: false as const };
    try {
      const parse = entry.parse ?? JSON.parse;
      return { ok: true as const, data: parse(raw) };
    } catch (err) {
      return { ok: false as const, error: err as Error };
    }
  }, [entry, raw]);

  if (!entry) {
    return <Fallback label="Unknown block type" type={type} raw={raw} />;
  }

  if (!parsed.ok) {
    return <Fallback label="Could not parse block" type={type} raw={raw} />;
  }

  const Renderer = entry.render;
  return (
    <ErrorBoundary fallback={() => <Fallback label="Renderer error" type={type} raw={raw} />}>
      <Renderer data={parsed.data} raw={raw} attributes={attributes} />
    </ErrorBoundary>
  );
}
