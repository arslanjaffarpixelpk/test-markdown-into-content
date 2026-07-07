import { createContext } from 'react';

/**
 * True while the surrounding message is still streaming. Consumed by RichBlock
 * so a half-received rich fence (incomplete JSON) shows a typed skeleton
 * placeholder instead of a "Could not parse" error, then resolves to the real
 * component once the closing fence arrives. Provided by MarkdownRenderer.
 */
export const StreamingContext = createContext(false);
