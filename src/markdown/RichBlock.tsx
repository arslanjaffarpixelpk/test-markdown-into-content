import { useContext, useMemo, useRef } from 'react';
import { FileWarning } from 'lucide-react';
import { getRenderer } from '@/renderers/registry';
import { StreamingContext } from './StreamingContext';
import { BlockSkeleton } from './BlockSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RichBlockProps {
  /** Block type — the fence language (```chart). */
  type: string;
  /** Raw block body text. */
  raw: string;
}

/** Shown when a type is unknown or its body fails to parse/validate. Never crashes. */
function Fallback({ label, type, raw, detail }: { label: string; type: string; raw: string; detail?: string }) {
  return (
    <Alert className="my-4 border-warning/50 [&>svg]:text-warning">
      <FileWarning className="h-4 w-4" />
      <AlertTitle>
        {label} <code className="ml-1 text-xs font-normal text-muted-foreground">{type}</code>
      </AlertTitle>
      <AlertDescription>
        {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-muted/50 p-2 text-xs">{raw}</pre>
      </AlertDescription>
    </Alert>
  );
}

/**
 * The single dispatcher for every rich block. Looks the type up in the
 * registry, parses + Zod-validates the body, and renders inside an
 * ErrorBoundary. Degrades gracefully at every step:
 *   unknown type   -> "Unknown block type" alert
 *   bad JSON        -> streaming ? typed skeleton : "Could not parse" alert
 *   schema mismatch -> "Invalid block" alert (with the first Zod issue)
 *   renderer throws -> caught by ErrorBoundary
 */
export function RichBlock({ type, raw }: RichBlockProps) {
  const entry = getRenderer(type);
  const streaming = useContext(StreamingContext);
  const prevRawRef = useRef('');
  const lastOkRef = useRef<{ data: unknown } | null>(null);

  if (!raw.trim()) {
    if (streaming) return <BlockSkeleton type={type} />;
    return (
      <Fallback
        label="Empty block"
        type={type}
        raw=""
        detail="The AI did not provide content for this block."
      />
    );
  }

  if (!raw.startsWith(prevRawRef.current)) {
    lastOkRef.current = null;
  }
  prevRawRef.current = raw;

  const result = useMemo(() => {
    if (!entry) return { state: 'unknown' as const };
    let parsed: unknown;
    try {
      parsed = (entry.parse ?? JSON.parse)(raw);
    } catch {
      return { state: 'parse-error' as const };
    }
    const check = entry.schema.safeParse(parsed);
    if (!check.success) {
      return { state: 'invalid' as const, detail: check.error.issues[0]?.message };
    }
    return { state: 'ok' as const, data: check.data };
  }, [entry, raw]);

  if (result.state === 'ok') {
    lastOkRef.current = { data: result.data };
  }

  const stableOk = result.state === 'ok' ? result : lastOkRef.current;

  if (!entry || result.state === 'unknown') {
    return <Fallback label="Unknown block type" type={type} raw={raw} />;
  }

  if (result.state === 'parse-error') {
    if (streaming) {
      if (stableOk) {
        const Renderer = entry.render;
        return (
          <ErrorBoundary fallback={<Fallback label="Renderer error" type={type} raw={raw} />}>
            <Renderer data={stableOk.data} raw={raw} />
          </ErrorBoundary>
        );
      }
      return <BlockSkeleton type={type} />;
    }
    return <Fallback label="Could not parse block" type={type} raw={raw} detail="Body is not valid JSON." />;
  }

  if (result.state === 'invalid') {
    if (streaming) {
      if (stableOk) {
        const Renderer = entry.render;
        return (
          <ErrorBoundary fallback={<Fallback label="Renderer error" type={type} raw={raw} />}>
            <Renderer data={stableOk.data} raw={raw} />
          </ErrorBoundary>
        );
      }
      return <BlockSkeleton type={type} />;
    }
    return <Fallback label="Invalid block" type={type} raw={raw} detail={result.detail} />;
  }

  const Renderer = entry.render;
  return (
    <ErrorBoundary fallback={<Fallback label="Renderer error" type={type} raw={raw} />}>
      <Renderer data={result.data} raw={raw} />
    </ErrorBoundary>
  );
}
