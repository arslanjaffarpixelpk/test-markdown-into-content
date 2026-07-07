import { useEffect, useMemo, useRef, useState } from 'react';
import type { RichRendererProps } from './registry';
import type { SvgPayload } from './schemas';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/useTheme';
import { buildSrcDoc, MAX_FRAME_HEIGHT, type FrameMsg } from '@/markdown/sandboxFrame';

const MIN_HEIGHT = 120;

/**
 * Renders an AI-authored SVG diagram (the raw body of a ```svg fence) inside a
 * sandboxed iframe — the same isolation as WidgetRenderer, minus the sendPrompt
 * bridge (diagrams are non-interactive). The frame auto-resizes to the SVG's
 * height, and theme colors are inlined so `currentColor` follows light/dark.
 */
export function SvgRenderer({ data }: RichRendererProps) {
  const svg = data as SvgPayload;
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);

  // Sandboxed with allow-scripts ONLY — never allow-same-origin (null-origin:
  // no access to parent DOM, cookies, or storage). Rebuilt on theme change so
  // the inlined colors track light/dark.
  const srcDoc = useMemo(
    () => buildSrcDoc(svg),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [svg, theme],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Trust boundary: only accept messages from THIS iframe's window
      // (origin is "null" for sandboxed frames, so check identity, not origin).
      if (event.source !== iframeRef.current?.contentWindow) return;
      const msg = event.data as FrameMsg;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'rich:resize' && typeof msg.height === 'number') {
        setHeight(Math.min(Math.max(msg.height, MIN_HEIGHT), MAX_FRAME_HEIGHT));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <Card className="my-4 overflow-hidden">
      <CardContent className="p-0">
        <iframe
          ref={iframeRef}
          title="Diagram"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          className="w-full border-0"
          style={{ height }}
        />
      </CardContent>
    </Card>
  );
}
