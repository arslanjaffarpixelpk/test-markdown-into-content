import { useEffect, useMemo, useRef, useState } from 'react';
import type { RichRendererProps } from './registry';
import type { WidgetPayload } from './schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/markdown/ChatContext';
import { useTheme } from '@/lib/useTheme';
import { buildSrcDoc, MAX_FRAME_HEIGHT, MAX_PROMPT_LEN, type FrameMsg } from '@/markdown/sandboxFrame';

export function WidgetRenderer({ data }: RichRendererProps) {
  const spec = data as WidgetPayload;
  const { sendPrompt } = useChat();
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(spec.minHeight ?? 160);

  // Rebuild the srcDoc when the widget html or theme changes. Sandboxed with
  // allow-scripts ONLY — never allow-same-origin (keeps the frame null-origin:
  // no access to parent DOM, cookies, or storage).
  const srcDoc = useMemo(
    () => buildSrcDoc(spec.html, { withSendPrompt: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spec.html, theme],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // The trust boundary: only accept messages from THIS iframe's window.
      // (Origin is "null" for sandboxed frames, so identity — not origin — is checked.)
      if (event.source !== iframeRef.current?.contentWindow) return;
      const msg = event.data as FrameMsg;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'rich:resize' && typeof msg.height === 'number') {
        setHeight(Math.min(Math.max(msg.height, spec.minHeight ?? 0), MAX_FRAME_HEIGHT));
      } else if (msg.type === 'rich:sendPrompt') {
        const text = String(msg.text ?? '').slice(0, MAX_PROMPT_LEN);
        if (text.trim()) sendPrompt?.(text);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [sendPrompt, spec.minHeight]);

  return (
    <Card className="my-4 overflow-hidden">
      {spec.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{spec.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={spec.title ? 'p-0' : 'p-0 pt-0'}>
        <iframe
          ref={iframeRef}
          title={spec.title ?? 'Interactive widget'}
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          className="w-full border-0"
          style={{ height }}
        />
      </CardContent>
    </Card>
  );
}
