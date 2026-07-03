import type { SampleMeta } from '../types';

/**
 * The single integration point with the "AI backend".
 *
 * In this prototype these calls are intercepted by MSW (src/mocks). To go live,
 * replace the mock with the real AI endpoint — the return types (markdown
 * strings) stay identical, so nothing else in the app changes.
 */

/** List the available sample responses (drives the sidebar). */
export async function fetchSamples(): Promise<SampleMeta[]> {
  const res = await fetch('/api/samples');
  if (!res.ok) throw new Error(`fetchSamples failed: ${res.status}`);
  return res.json();
}

/** Request an assistant response; returns markdown. */
export async function fetchChat(sampleId: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sampleId }),
  });
  if (!res.ok) throw new Error(`fetchChat failed: ${res.status}`);
  const data = (await res.json()) as { content: string };
  return data.content;
}
