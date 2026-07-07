/**
 * Registers all built-in rich renderers. Imported once for its side effects
 * from `main.tsx` (before the app renders).
 *
 * Adding a new block type is a 3-step change: a Zod schema in `schemas.ts`, a
 * `*Renderer.tsx` component, and one `registerRenderer(...)` line here.
 */
import { registerRenderer } from './registry';
import {
  calloutSchema,
  compareSchema,
  chartSchema,
  widgetSchema,
  svgSchema,
  timelineSchema,
  stepsSchema,
  mermaidSchema,
  faqSchema,
  accordionSchema,
  trackerSchema,
  jsonSchema,
} from './schemas';
import { CalloutRenderer } from './CalloutRenderer';
import { CompareRenderer } from './CompareRenderer';
import { ChartRenderer } from './ChartRenderer';
import { WidgetRenderer } from './WidgetRenderer';
import { SvgRenderer } from './SvgRenderer';
import { TimelineRenderer } from './TimelineRenderer';
import { StepperRenderer } from './StepperRenderer';
import { MermaidRenderer } from './MermaidRenderer';
import { FaqRenderer } from './FaqRenderer';
import { AccordionRenderer } from './AccordionRenderer';
import { TrackerRenderer } from './TrackerRenderer';
import { JsonRenderer } from './JsonRenderer';

registerRenderer('callout', { render: CalloutRenderer, schema: calloutSchema, label: 'Callout' });
registerRenderer('compare', { render: CompareRenderer, schema: compareSchema, label: 'Compare' });
registerRenderer('chart', { render: ChartRenderer, schema: chartSchema, label: 'Chart' });
registerRenderer('widget', { render: WidgetRenderer, schema: widgetSchema, label: 'Widget' });
registerRenderer('svg', { render: SvgRenderer, schema: svgSchema, parse: (raw) => raw, label: 'SVG' });
registerRenderer('timeline', { render: TimelineRenderer, schema: timelineSchema, label: 'Timeline' });
registerRenderer('steps', { render: StepperRenderer, schema: stepsSchema, label: 'Steps' });
registerRenderer('stepper', { render: StepperRenderer, schema: stepsSchema, label: 'Stepper' });
registerRenderer('mermaid', {
  render: MermaidRenderer,
  schema: mermaidSchema,
  parse: (raw) => raw,
  label: 'Mermaid',
});
registerRenderer('faq', { render: FaqRenderer, schema: faqSchema, label: 'FAQ' });
registerRenderer('accordion', { render: AccordionRenderer, schema: accordionSchema, label: 'Accordion' });
registerRenderer('tracker', { render: TrackerRenderer, schema: trackerSchema, label: 'Tracker' });
registerRenderer('json', { render: JsonRenderer, schema: jsonSchema, label: 'JSON' });
