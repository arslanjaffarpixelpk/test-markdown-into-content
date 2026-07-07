import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from './overrides';
import { StreamingContext } from './StreamingContext';
import { ChatContext, type ChatContextValue } from './ChatContext';

interface MarkdownRendererProps {
  content: string;
  /** True while `content` is still streaming — swaps partial-block errors for skeletons. */
  streaming?: boolean;
  /** Chat bridge for interactive blocks (Compare buttons, Widget iframes). */
  chat?: ChatContextValue;
}

/**
 * The single entry point for rendering an AI markdown response.
 *
 * Pipeline: remark-gfm (tables/task lists) -> component overrides that
 * intercept fenced rich blocks (```callout / ```compare / ```chart / ```widget)
 * and route them through RichBlock, while everything else renders as styled
 * markdown.
 */
export function MarkdownRenderer({ content, streaming = false, chat = {} }: MarkdownRendererProps) {
  const remarkPlugins = useMemo(() => [remarkGfm], []);

  return (
    <ChatContext.Provider value={chat}>
      <StreamingContext.Provider value={streaming}>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </StreamingContext.Provider>
    </ChatContext.Provider>
  );
}
