import { MarkdownRenderer } from '@/markdown/MarkdownRenderer';
import { FIXTURES, GALLERY_EXTRAS } from '@/data/fixtures';

/**
 * Static gallery of every block + degradation state, rendered through the same
 * pipeline the chat uses — for at-a-glance QA without streaming. sendPrompt logs
 * to the console here (no live chat to feed).
 */
export function Gallery() {
  const chat = { sendPrompt: (t: string) => console.log('[gallery] sendPrompt:', t) };

  const items = [
    ...FIXTURES.map((f) => ({ id: f.id, label: f.label, markdown: f.markdown, streaming: false })),
    ...GALLERY_EXTRAS,
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <p className="text-sm text-muted-foreground">
        Every rich block and fallback state, rendered statically. Interactive blocks log their
        prompt to the console here; try them live in the Chat tab.
      </p>
      {items.map((item) => (
        <section key={item.id} className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </h2>
          <div className="rounded-2xl border bg-card px-4 py-3">
            <MarkdownRenderer content={item.markdown} streaming={item.streaming} chat={chat} />
          </div>
        </section>
      ))}
    </div>
  );
}
