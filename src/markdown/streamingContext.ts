import { createContext } from 'react';

/**
 * True while the surrounding message is still streaming. Consumed by RichBlock
 * so a half-received rich fence (incomplete JSON) shows a subtle placeholder
 * instead of the "Could not parse block" error, then resolves when the fence
 * completes. Provided by MarkdownRenderer.
 */
export const StreamingContext = createContext(false);
