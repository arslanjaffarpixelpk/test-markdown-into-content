import { z } from 'zod';

/**
 * Zod payload schemas — the contract between the AI/backend and the frontend.
 * Each block type validates its fenced JSON body against one of these; on
 * failure the block degrades gracefully (see RichBlock).
 */

/* ---- callout ----------------------------------------------------------- */
export const calloutSchema = z.object({
  variant: z.enum(['note', 'tip', 'warning', 'danger']),
  title: z.string().optional(),
  body: z.string(),
});
export type CalloutPayload = z.infer<typeof calloutSchema>;

/* ---- compare ----------------------------------------------------------- */
export const compareOptionSchema = z.object({
  title: z.string(),
  points: z.array(z.string()).default([]),
  recommended: z.boolean().optional(),
  /** Prompt sent back into the chat when this option's button is clicked. */
  prompt: z.string().optional(),
});
export const compareSchema = z.object({
  title: z.string().optional(),
  options: z.array(compareOptionSchema).min(1),
});
export type ComparePayload = z.infer<typeof compareSchema>;

/* ---- chart ------------------------------------------------------------- */
export const chartSeriesSchema = z.object({
  key: z.string(),
  label: z.string().optional(),
  color: z.string().optional(),
});
export const chartSchema = z.object({
  type: z.enum(['line', 'bar', 'pie']),
  title: z.string().optional(),
  xKey: z.string(),
  height: z.number().optional(),
  series: z.array(chartSeriesSchema).min(1),
  data: z.array(z.record(z.string(), z.unknown())).min(1),
});
export type ChartPayload = z.infer<typeof chartSchema>;

/* ---- widget ------------------------------------------------------------ */
export const widgetSchema = z.object({
  title: z.string().optional(),
  /** Raw SVG/HTML rendered inside a sandboxed iframe. */
  html: z.string().min(1),
  minHeight: z.number().optional(),
});
export type WidgetPayload = z.infer<typeof widgetSchema>;

/* ---- svg ---------------------------------------------------------------- */
/**
 * Unlike the other blocks, an `svg` body is raw markup (not JSON) — the renderer
 * registers `parse: (raw) => raw`, so this schema validates a plain string.
 * Requiring both an opening and closing <svg> tag keeps a still-streaming,
 * unterminated block in the "invalid" state (→ skeleton) until it completes.
 */
export const svgSchema = z
  .string()
  .refine((s) => /<svg[\s>]/i.test(s) && /<\/svg>/i.test(s), 'Incomplete or missing <svg> element');
export type SvgPayload = z.infer<typeof svgSchema>;

/* ---- timeline ---------------------------------------------------------- */
export const timelineEventSchema = z.object({
  date: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['done', 'current', 'upcoming']).optional(),
});
export const timelineSchema = z.object({
  events: z.array(timelineEventSchema).min(1),
});
export type TimelinePayload = z.infer<typeof timelineSchema>;

/* ---- steps / stepper --------------------------------------------------- */
export const stepItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});
export const stepsSchema = z.object({
  steps: z.array(stepItemSchema).min(1),
});
export type StepsPayload = z.infer<typeof stepsSchema>;

/* ---- mermaid ----------------------------------------------------------- */
export const mermaidSchema = z.string().refine((s) => s.trim().length > 0, 'Mermaid diagram is empty');
export type MermaidPayload = z.infer<typeof mermaidSchema>;

/* ---- faq --------------------------------------------------------------- */
export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export const faqSchema = z.array(faqItemSchema).min(1);
export type FaqPayload = z.infer<typeof faqSchema>;

/* ---- accordion --------------------------------------------------------- */
export const accordionItemSchema = z.object({
  title: z.string(),
  content: z.string(),
});
export const accordionSchema = z.object({
  items: z.array(accordionItemSchema).min(1),
});
export type AccordionPayload = z.infer<typeof accordionSchema>;

/* ---- tracker ----------------------------------------------------------- */
export const trackerSchema = z.object({
  title: z.string().optional(),
  stages: z.array(z.string()).min(1),
  current: z.number().int().min(0),
});
export type TrackerPayload = z.infer<typeof trackerSchema>;

/* ---- json (generic — shape dispatch happens in JsonRenderer) ----------- */
export const jsonSchema = z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]);
export type JsonPayload = z.infer<typeof jsonSchema>;

/** Detect FAQ-shaped JSON arrays for the json fence dispatcher. */
export function isFaqShape(data: unknown): data is FaqPayload {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        'question' in item &&
        'answer' in item &&
        typeof (item as { question: unknown }).question === 'string' &&
        typeof (item as { answer: unknown }).answer === 'string',
    )
  );
}

/** Detect tracker-shaped JSON objects for the json fence dispatcher. */
export function isTrackerShape(data: unknown): data is TrackerPayload {
  return (
    !!data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    'stages' in data &&
    'current' in data &&
    Array.isArray((data as { stages: unknown }).stages) &&
    (data as { stages: unknown[] }).stages.every((s) => typeof s === 'string') &&
    typeof (data as { current: unknown }).current === 'number'
  );
}

/** True when parsed JSON has no displayable content. */
export function isEmptyJson(data: unknown): boolean {
  if (Array.isArray(data)) return data.length === 0;
  if (data && typeof data === 'object') return Object.keys(data).length === 0;
  return false;
}
