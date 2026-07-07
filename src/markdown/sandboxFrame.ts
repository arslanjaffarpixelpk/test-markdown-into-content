/**
 * Shared machinery for rendering AI-authored markup (HTML or SVG) inside a
 * sandboxed iframe. Used by both WidgetRenderer (interactive HTML) and
 * SvgRenderer (static diagrams).
 *
 * The frame is always sandboxed with `allow-scripts` ONLY — never
 * `allow-same-origin` — so it stays null-origin with no access to the parent
 * DOM, cookies, or storage. See the renderers for the message trust boundary.
 */

/** postMessage protocol between a sandboxed frame and its parent renderer. */
export interface ResizeMsg {
  type: 'rich:resize';
  height: number;
}
export interface SendPromptMsg {
  type: 'rich:sendPrompt';
  text: string;
}
export type FrameMsg = ResizeMsg | SendPromptMsg;

export const MAX_FRAME_HEIGHT = 2000;
export const MAX_PROMPT_LEN = 2000;

/**
 * Read resolved theme colors from the parent and inline them: iframes don't
 * inherit the parent's CSS custom properties, so we snapshot them into a
 * `<style>` block. `svg { max-width:100% }` lets responsive SVGs (width="100%"
 * + viewBox) scale to the card width, and body `color` flows into SVG
 * `currentColor` / `fill="currentColor"`.
 */
export function themeStyle(): string {
  const root = getComputedStyle(document.documentElement);
  const v = (name: string) => root.getPropertyValue(name).trim();
  return `
    :root { color-scheme: light dark; }
    html, body { margin: 0; }
    body {
      font: 14px system-ui, -apple-system, sans-serif;
      background: hsl(${v('--card')});
      color: hsl(${v('--foreground')});
      padding: 12px;
    }
    svg { max-width: 100%; height: auto; display: block; }
    a { color: hsl(${v('--primary')}); }
    button {
      font: inherit; cursor: pointer;
      border: 1px solid hsl(${v('--border')});
      background: hsl(${v('--primary')}); color: hsl(${v('--primary-foreground')});
      border-radius: 6px; padding: 6px 12px;
    }
    button:hover { opacity: 0.9; }
  `;
}

/**
 * Bootstrap injected into every frame. Always auto-resizes; only exposes the
 * `sendPrompt()` bridge when `withSendPrompt` is set (interactive widgets).
 */
function bootstrap(withSendPrompt: boolean): string {
  const sendPrompt = withSendPrompt
    ? `window.sendPrompt = function (text) {
         parent.postMessage({ type: 'rich:sendPrompt', text: String(text) }, '*');
       };`
    : '';
  return `
    <script>
      (function () {
        function postHeight() {
          var h = Math.ceil(document.documentElement.getBoundingClientRect().height);
          parent.postMessage({ type: 'rich:resize', height: h }, '*');
        }
        ${sendPrompt}
        if ('ResizeObserver' in window) {
          new ResizeObserver(postHeight).observe(document.documentElement);
        }
        window.addEventListener('load', postHeight);
        setTimeout(postHeight, 50);
      })();
    <\/script>
  `;
}

/**
 * Build the iframe `srcDoc` for a body of AI-authored markup: inlined theme CSS
 * + the markup + the resize/sendPrompt bootstrap.
 */
export function buildSrcDoc(bodyHtml: string, opts: { withSendPrompt?: boolean } = {}): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><style>${themeStyle()}</style></head>` +
    `<body>${bodyHtml}${bootstrap(opts.withSendPrompt ?? false)}</body></html>`
  );
}
