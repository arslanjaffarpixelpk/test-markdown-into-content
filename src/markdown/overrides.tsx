import type { ComponentProps, ReactNode } from 'react';
import type { Components, ExtraProps } from 'react-markdown';
import { hasRenderer } from '@/renderers/registry';
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
 * `pre` / `code`: intercept fenced code blocks whose language matches a
 * registered renderer; everything else falls through to normal rendering
 * (code blocks, styled GFM tables, safe links).
 */

function Pre({ node, children }: ComponentProps<'pre'> & ExtraProps): ReactNode {
  // Peek at the child <code> language; if it's a rich type, drop the <pre>
  // wrapper so the RichBlock isn't boxed in monospace styling.
  const codeEl = node?.children?.find((c) => c.type === 'element' && c.tagName === 'code');
  const className = codeEl && codeEl.type === 'element' ? codeEl.properties?.className : undefined;
  const lang = langFromClassName(Array.isArray(className) ? className.join(' ') : className);
  if (lang && hasRenderer(lang)) {
    return <>{children}</>;
  }
  return <pre className="code-block">{children}</pre>;
}

function Code({ node, className, children, ...rest }: ComponentProps<'code'> & ExtraProps): ReactNode {
  void node;
  const lang = langFromClassName(className);
  if (lang && hasRenderer(lang)) {
    // The un-highlighted body is a single text string, so String(children) is
    // the raw block content.
    const raw = String(children).replace(/\n$/, '');
    return <RichBlock type={lang} raw={raw} />;
  }
  // Not a rich block: inline code or an ordinary code fence.
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

export const markdownComponents = {
  pre: Pre,
  code: Code,
  a: Anchor,
} as unknown as Components;
