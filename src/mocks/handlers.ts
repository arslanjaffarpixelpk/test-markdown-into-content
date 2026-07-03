import { http, HttpResponse } from 'msw';
import type { SampleMeta } from '../types';

// Import each sample "AI response" as a raw markdown string (Vite ?raw).
import charts from './samples/charts.md?raw';
import tables from './samples/tables.md?raw';
import timeline from './samples/timeline.md?raw';
import flowchart from './samples/flowchart.md?raw';
import infographic from './samples/infographic.md?raw';
import interactive from './samples/interactive.md?raw';
import callouts from './samples/callouts.md?raw';
import components from './samples/components.md?raw';
import code from './samples/code.md?raw';
import kitchenSink from './samples/kitchen-sink.md?raw';

interface SampleEntry extends SampleMeta {
  content: string;
}

const SAMPLES: SampleEntry[] = [
  { id: 'charts', title: 'Graphs & Charts', description: 'Line, bar & pie via Recharts', content: charts },
  { id: 'tables', title: 'Tables', description: 'GFM + sortable interactive table', content: tables },
  { id: 'timeline', title: 'Timeline', description: 'Project roadmap milestones', content: timeline },
  { id: 'flowchart', title: 'Flow Diagrams', description: 'Mermaid flow & sequence', content: flowchart },
  { id: 'infographic', title: 'Infographic', description: 'KPI / stat-card grid', content: infographic },
  { id: 'interactive', title: 'Interactive Templates', description: 'Tabs & quiz', content: interactive },
  { id: 'callouts', title: 'Callouts', description: 'note / tip / warning / danger', content: callouts },
  { id: 'components', title: 'UI Components', description: 'Cards, badges, accordion, steps, progress', content: components },
  { id: 'code', title: 'Code', description: 'Highlighted code & tabbed code groups', content: code },
  { id: 'kitchen-sink', title: 'Kitchen Sink', description: 'Every renderer + both syntaxes', content: kitchenSink },
];

const list: SampleMeta[] = SAMPLES.map(({ id, title, description }) => ({ id, title, description }));

/**
 * MSW handlers — the mock "AI backend". Later, point the client at the real AI
 * endpoint and delete these; `src/api/chat.ts` stays unchanged.
 */
export const handlers = [
  // List the available sample responses (for the sidebar).
  http.get('/api/samples', () => HttpResponse.json(list)),

  // Return the full markdown for a selected sample (no streaming in v1).
  http.post('/api/chat', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { sampleId?: string };
    const sample = SAMPLES.find((s) => s.id === body.sampleId) ?? SAMPLES[0];
    return HttpResponse.json({
      id: sample.id,
      role: 'assistant',
      content: sample.content,
    });
  }),
];
