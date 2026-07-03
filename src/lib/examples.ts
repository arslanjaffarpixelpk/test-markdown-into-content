/**
 * Ready-to-render example snippets for the composer's "Insert example" menu.
 *
 * Each entry is a small assistant-style markdown string containing one rich block.
 * Inserting one appends an assistant message that renders through the exact same
 * pipeline a live AI response uses — a fast way to test any renderer without the AI.
 */
export interface ExampleEntry {
  id: string;
  label: string;
  markdown: string;
}

export const EXAMPLES: ExampleEntry[] = [
  {
    id: 'chart',
    label: 'Chart',
    markdown: `Here's a quick revenue trend:

\`\`\`chart
{
  "type": "line",
  "title": "Monthly Revenue ($K)",
  "xKey": "month",
  "series": [{ "key": "revenue", "label": "Revenue" }],
  "data": [
    { "month": "Jan", "revenue": 120 },
    { "month": "Feb", "revenue": 145 },
    { "month": "Mar", "revenue": 168 },
    { "month": "Apr", "revenue": 210 },
    { "month": "May", "revenue": 248 },
    { "month": "Jun", "revenue": 312 }
  ]
}
\`\`\``,
  },
  {
    id: 'table',
    label: 'Interactive table',
    markdown: `Open issues by assignee (click a header to sort):

\`\`\`table
{
  "title": "Open Issues",
  "sortable": true,
  "columns": [
    { "key": "assignee", "label": "Assignee" },
    { "key": "open", "label": "Open", "align": "right" },
    { "key": "closed", "label": "Closed", "align": "right" }
  ],
  "rows": [
    { "assignee": "Ami", "open": 12, "closed": 9 },
    { "assignee": "Bo", "open": 7, "closed": 5 },
    { "assignee": "Chen", "open": 19, "closed": 11 }
  ]
}
\`\`\``,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    markdown: `Project roadmap:

\`\`\`timeline
{
  "events": [
    { "date": "Q1", "title": "Discovery", "status": "done" },
    { "date": "Q2", "title": "Prototype", "status": "active" },
    { "date": "Q3", "title": "Launch", "status": "upcoming" }
  ]
}
\`\`\``,
  },
  {
    id: 'mermaid',
    label: 'Flow diagram (Mermaid)',
    markdown: `How it flows:

\`\`\`mermaid
graph LR
    A[User] --> B[AI markdown] --> C[Registry] --> D[Rich UI]
\`\`\``,
  },
  {
    id: 'infographic',
    label: 'Infographic',
    markdown: `Key metrics this quarter:

\`\`\`infographic
{
  "stats": [
    { "icon": "💰", "label": "Revenue", "value": "$312", "unit": "K", "delta": "+15%", "trend": "up" },
    { "icon": "👥", "label": "Users", "value": "48.2", "unit": "K", "delta": "+8%", "trend": "up" },
    { "icon": "📉", "label": "Churn", "value": "2.4", "unit": "%", "delta": "-0.6pp", "trend": "down" }
  ]
}
\`\`\``,
  },
  {
    id: 'progress',
    label: 'Progress bars',
    markdown: `Milestone completion:

\`\`\`progress
{
  "title": "Delivery",
  "items": [
    { "label": "Architecture", "value": 100 },
    { "label": "Renderers", "value": 82 },
    { "label": "Docs", "value": 60 }
  ]
}
\`\`\``,
  },
  {
    id: 'callout',
    label: 'Callout',
    markdown: `\`\`\`callout
{ "variant": "tip", "title": "Tip", "body": "Rich blocks render inside live AI responses automatically — no code changes needed." }
\`\`\``,
  },
  {
    id: 'accordion',
    label: 'Accordion (FAQ)',
    markdown: `Common questions:

\`\`\`accordion
{
  "items": [
    { "title": "How do I add a format?", "body": "Register a renderer with one line — the pipeline never changes." },
    { "title": "Both syntaxes?", "body": "Yes — fenced blocks and :::directives hit the same renderer." }
  ]
}
\`\`\``,
  },
  {
    id: 'steps',
    label: 'Steps (checklist)',
    markdown: `Getting started:

\`\`\`steps
{
  "interactive": true,
  "steps": [
    { "title": "Install", "body": "npm install" },
    { "title": "Run", "body": "npm run dev" },
    { "title": "Test", "body": "Insert an example from the composer." }
  ]
}
\`\`\``,
  },
  {
    id: 'codegroup',
    label: 'Code group (tabs)',
    markdown: `Install it:

\`\`\`codegroup
{
  "tabs": [
    { "label": "npm", "language": "bash", "code": "npm install rich-content-renderer" },
    { "label": "pnpm", "language": "bash", "code": "pnpm add rich-content-renderer" },
    { "label": "yarn", "language": "bash", "code": "yarn add rich-content-renderer" }
  ]
}
\`\`\``,
  },
  {
    id: 'cards',
    label: 'Card grid',
    markdown: `\`\`\`cards
{
  "columns": 3,
  "cards": [
    { "title": "Charts", "badge": "Recharts", "description": "Line, bar, pie" },
    { "title": "Tables", "badge": "TanStack", "description": "Sortable" },
    { "title": "Diagrams", "badge": "Mermaid", "description": "Flow & sequence" }
  ]
}
\`\`\``,
  },
  {
    id: 'badges',
    label: 'Badges',
    markdown: `\`\`\`badges
{
  "title": "Status:",
  "badges": [
    { "label": "Stable", "variant": "default" },
    { "label": "Beta", "variant": "secondary" },
    { "label": "Draft", "variant": "outline" }
  ]
}
\`\`\``,
  },
  {
    id: 'template',
    label: 'Interactive template (quiz)',
    markdown: `\`\`\`template
{
  "kind": "quiz",
  "title": "Quick Check",
  "question": "What makes the renderer architecture modular?",
  "options": ["A big switch statement", "A renderer registry", "Inline HTML"],
  "answerIndex": 1,
  "explanation": "New types register a component under a type key."
}
\`\`\``,
  },
  {
    id: 'kitchen-sink',
    label: 'Mixed (prose + chart + callout)',
    markdown: `## Summary

Revenue grew **28%** this quarter, driven by the Platform line.

\`\`\`callout
{ "variant": "note", "body": "This response mixes prose, a callout, and a chart — exactly what a live AI reply can do." }
\`\`\`

\`\`\`chart
{
  "type": "bar",
  "title": "Revenue by Line ($K)",
  "xKey": "line",
  "series": [{ "key": "value", "label": "Revenue" }],
  "data": [
    { "line": "Platform", "value": 380 },
    { "line": "Services", "value": 210 },
    { "line": "Support", "value": 95 }
  ]
}
\`\`\``,
  },
];
