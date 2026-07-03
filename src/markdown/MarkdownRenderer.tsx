import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { remarkRichDirective } from './remarkRichDirective';
import { markdownComponents } from './overrides';
import { StreamingContext } from './streamingContext';
import { registeredTypes } from '../renderers/registry';

interface MarkdownRendererProps {
  content: string;
  /** True while `content` is still streaming — suppresses partial-block errors. */
  streaming?: boolean;
}

/**
 * The single entry point for rendering an AI markdown response.
 *
 * Pipeline:
 *   remark: gfm (tables) → math → directive → remarkRichDirective (:::type)
 *   rehype: katex (math) → highlight (code fences, rich langs left as plain text)
 *   components: intercept fenced rich blocks + directive rich blocks, style the rest
 */
export function MarkdownRenderer({ content, streaming = false }: MarkdownRendererProps) {
  // Rich fence languages must NOT be syntax-highlighted, or their body would be
  // split into token <span>s and we'd lose the raw JSON/DSL text.
  const plainText = useMemo(() => registeredTypes(), []);

  return (
    <StreamingContext.Provider value={streaming}>
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkDirective, remarkRichDirective]}
          rehypePlugins={[
            rehypeKatex,
            [rehypeHighlight, { ignoreMissing: true, plainText }],
          ]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </StreamingContext.Provider>
  );
}
