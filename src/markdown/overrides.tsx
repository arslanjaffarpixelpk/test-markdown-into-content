import type { ComponentProps, ReactNode } from 'react';
import type { Components, ExtraProps } from 'react-markdown';
import { hasRenderer } from '../renderers/registry';
import { RichBlock } from './RichBlock';

/** Pull the fenced language (`language-chart` -> `chart`) from a className. */
function langFromClassName(className: unknown): string | null {
  if (typeof className !== 'string') return null;
  const match = /language-([\w-]+)/.exec(className);
  return match ? match[1] : null;
}

/**
 * react-markdown component overrides.
 *
 * - `richblock`: emitted by remarkRichDirective for `:::type` directives.
 * - `pre` / `code`: intercept fenced code blocks whose language matches a
 *   registered renderer; everything else falls through to normal rendering
 *   (syntax-highlighted code, styled GFM tables, safe links).
 */

function RichBlockFromDirective({ node }: ExtraProps): ReactNode {
  const props = (node?.properties ?? {}) as Record<string, unknown>;
  const type = String(props.richType ?? '');
  const raw = String(props.richRaw ?? '');
  let attributes: Record<string, string> = {};
  try {
    attributes = JSON.parse(String(props.richAttrs ?? '{}'));
  } catch {
    attributes = {};
  }
  return <RichBlock type={type} raw={raw} attributes={attributes} />;
}

function Pre({ node, children }: ComponentProps<'pre'> & ExtraProps): ReactNode {
  // Peek at the child <code> language; if it's a rich type, drop the <pre>
  // wrapper so the RichBlock isn't boxed in monospace styling.
  const codeEl = node?.children?.find(
    (c) => c.type === 'element' && c.tagName === 'code',
  );
  const className =
    codeEl && codeEl.type === 'element' ? codeEl.properties?.className : undefined;
  const lang = langFromClassName(Array.isArray(className) ? className.join(' ') : className);
  if (lang && hasRenderer(lang)) {
    return <>{children}</>;
  }
  return <pre className="code-block">{children}</pre>;
}

function Code({
  node,
  className,
  children,
  ...rest
}: ComponentProps<'code'> & ExtraProps): ReactNode {
  void node;
  const lang = langFromClassName(className);
  if (lang && hasRenderer(lang)) {
    // The un-highlighted body is a single text string (rich langs are marked
    // plainText in rehype-highlight config), so String(children) is the raw.
    const raw = String(children).replace(/\n$/, '');
    return <RichBlock type={lang} raw={raw} />;
  }
  // Not a rich block: inline code or an ordinary highlighted code fence.
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
}

function Anchor({ children, href }: ComponentProps<'a'> & ExtraProps): ReactNode {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function Table({ children }: ComponentProps<'table'> & ExtraProps): ReactNode {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-sm [&_td]:border-t [&_td]:px-4 [&_td]:py-2 [&_th]:bg-muted/50 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium">
        {children}
      </table>
    </div>
  );
}

// `richblock` is a custom element name (not in react-markdown's element union),
// so assemble the map and cast it to the Components type.
export const markdownComponents = {
  richblock: RichBlockFromDirective,
  pre: Pre,
  code: Code,
  a: Anchor,
  table: Table,
} as unknown as Components;
