/**
 * Registers every built-in renderer. Import this module once at app boot
 * (see main.tsx) for its side effects.
 *
 * To add a new content type: create a renderer component and add one
 * `registerRenderer(...)` line here. Nothing else in the pipeline changes.
 */
import { registerRenderer } from './registry';
import { ChartRenderer } from './ChartRenderer';
import { TableRenderer } from './TableRenderer';
import { TimelineRenderer } from './TimelineRenderer';
import { MermaidRenderer } from './MermaidRenderer';
import { InfographicRenderer } from './InfographicRenderer';
import { TemplateRenderer } from './TemplateRenderer';
import { CalloutRenderer } from './CalloutRenderer';
import { AccordionRenderer } from './AccordionRenderer';
import { StepsRenderer } from './StepsRenderer';
import { CodeGroupRenderer } from './CodeGroupRenderer';
import { CardsRenderer } from './CardsRenderer';
import { BadgesRenderer } from './BadgesRenderer';
import { ProgressRenderer } from './ProgressRenderer';

// Data visualisation & structure
registerRenderer('chart', { render: ChartRenderer, label: 'Chart' });
registerRenderer('table', { render: TableRenderer, label: 'Interactive table' });
registerRenderer('timeline', { render: TimelineRenderer, label: 'Timeline' });
registerRenderer('infographic', { render: InfographicRenderer, label: 'Infographic' });
registerRenderer('progress', { render: ProgressRenderer, label: 'Progress bars' });

// Content & layout
registerRenderer('callout', { render: CalloutRenderer, label: 'Callout' });
registerRenderer('accordion', { render: AccordionRenderer, label: 'Accordion' });
registerRenderer('steps', { render: StepsRenderer, label: 'Steps' });
registerRenderer('codegroup', { render: CodeGroupRenderer, label: 'Code group' });
registerRenderer('cards', { render: CardsRenderer, label: 'Card grid' });
registerRenderer('badges', { render: BadgesRenderer, label: 'Badges' });

// Interactive
registerRenderer('template', { render: TemplateRenderer, label: 'Interactive template' });

// Mermaid is a DSL, not JSON — parse with identity so `raw` is used directly.
registerRenderer('mermaid', {
  render: MermaidRenderer,
  parse: (raw) => raw,
  label: 'Diagram (Mermaid)',
});
