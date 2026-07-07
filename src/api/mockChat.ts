import type { StreamChatArgs } from './chat';
import { replyFor } from '@/data/fixtures';

/**
 * Drop-in mock for `streamChat` (same signature). Streams a local fixture chosen
 * from the query — word by word so open rich fences visibly show a skeleton
 * before resolving — with no backend. Honors the AbortSignal like the real
 * client, and ends with a completion carrying suggested questions.
 */

const SUGGESTIONS = [
  'Compare the Starter and Pro plans.',
  'Show me monthly revenue vs target.',
  'Help me estimate a plan for my team.',
];

/** Split into word-ish chunks so streaming looks natural (and pauses mid-fence). */
function chunks(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export async function mockStreamChat(args: StreamChatArgs): Promise<void> {
  const { query, onToken, onThought, onEvent, signal } = args;

  try {
    await sleep(250, signal);

    // 1) Thinking pass.
    for (const c of chunks('Choosing the clearest structure — a short answer plus a rich block.')) {
      if (signal?.aborted) return;
      onThought?.(c);
      await sleep(14, signal);
    }

    await sleep(200, signal);

    // 2) Answer: a fixture chosen from the query, streamed a few chars at a time.
    for (const c of chunks(replyFor(query))) {
      if (signal?.aborted) return;
      onToken(c);
      await sleep(10, signal);
    }

    await sleep(120, signal);

    // 3) Completion: suggested follow-ups.
    if (signal?.aborted) return;
    onEvent?.({ type: 'completion', suggested_questions: SUGGESTIONS });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    throw err;
  }
}
