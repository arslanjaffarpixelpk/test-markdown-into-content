// Shared types across the app.

/** A single sample "AI response" available in the sidebar. */
export interface SampleMeta {
  id: string;
  title: string;
  description: string;
}

/** A chat message. In this prototype the assistant content is markdown. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string; // markdown for assistant, plain text for user
}

// ---------------------------------------------------------------------------
// Renderer data shapes (the "rendering standard" — see STANDARDS.md).
// These describe the JSON that lives inside a ```<type> fence or :::<type> block.
// ---------------------------------------------------------------------------

export type ChartKind = 'line' | 'bar' | 'area' | 'pie';

export interface ChartSeries {
  key: string;
  label?: string;
  color?: string;
}

export interface ChartSpec {
  type: ChartKind;
  title?: string;
  xKey?: string; // key on each datum for the x-axis / pie label
  series: ChartSeries[]; // for pie, series[0].key holds the value
  data: Array<Record<string, string | number>>;
  height?: number;
  stacked?: boolean;
}

export interface TableSpec {
  title?: string;
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center' }>;
  rows: Array<Record<string, string | number>>;
  sortable?: boolean;
  pageSize?: number;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  status?: 'done' | 'active' | 'upcoming';
}

export interface TimelineSpec {
  title?: string;
  events: TimelineEvent[];
}

export interface InfographicStat {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string; // e.g. "+12%"
  trend?: 'up' | 'down' | 'flat';
  icon?: string; // emoji or short glyph
  description?: string;
}

export interface InfographicSpec {
  title?: string;
  stats: InfographicStat[];
}

/** Interactive template: a lightweight, data-driven UI. Two demo variants. */
export interface TemplateTabs {
  kind: 'tabs';
  title?: string;
  tabs: Array<{ label: string; body: string }>; // body is markdown-ish plain text
}

export interface TemplateQuiz {
  kind: 'quiz';
  title?: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export type TemplateSpec = TemplateTabs | TemplateQuiz;

// --- Formats added in the shadcn phase -------------------------------------

export interface CalloutSpec {
  variant: 'note' | 'tip' | 'warning' | 'danger';
  title?: string;
  body: string;
}

export interface AccordionSpec {
  items: Array<{ title: string; body: string }>;
}

export interface StepsSpec {
  interactive?: boolean;
  steps: Array<{ title: string; body?: string }>;
}

export interface CodeGroupSpec {
  tabs: Array<{ label: string; language?: string; code: string }>;
}

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface CardsSpec {
  columns?: number;
  cards: Array<{
    title: string;
    description?: string;
    body?: string;
    badge?: string;
    footer?: string;
  }>;
}

export interface BadgesSpec {
  title?: string;
  badges: Array<{ label: string; variant?: BadgeVariant }>;
}

export interface ProgressSpec {
  title?: string;
  items: Array<{ label: string; value: number; max?: number }>;
}
