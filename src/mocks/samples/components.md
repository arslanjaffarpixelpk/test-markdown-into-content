# UI Components Catalog

A tour of the structural renderers built on shadcn/ui.

## Card grid

```cards
{
  "columns": 3,
  "cards": [
    { "title": "Charts", "badge": "Recharts", "description": "Line, bar, area & pie", "footer": "type: chart" },
    { "title": "Tables", "badge": "TanStack", "description": "Sortable, interactive", "footer": "type: table" },
    { "title": "Diagrams", "badge": "Mermaid", "description": "Flow, sequence, gantt", "footer": "type: mermaid" },
    { "title": "Callouts", "badge": "Alert", "description": "note / tip / warning / danger", "footer": "type: callout" },
    { "title": "Steps", "badge": "custom", "description": "Guides & checklists", "footer": "type: steps" },
    { "title": "Accordion", "badge": "Radix", "description": "Collapsible sections", "footer": "type: accordion" }
  ]
}
```

## Badges

```badges
{
  "title": "Status:",
  "badges": [
    { "label": "Stable", "variant": "default" },
    { "label": "Beta", "variant": "secondary" },
    { "label": "Deprecated", "variant": "destructive" },
    { "label": "Draft", "variant": "outline" }
  ]
}
```

## Progress metrics

```progress
{
  "title": "Milestone completion",
  "items": [
    { "label": "Architecture", "value": 100 },
    { "label": "Renderers", "value": 82 },
    { "label": "Docs", "value": 60 },
    { "label": "Streaming", "value": 15 }
  ]
}
```

## Accordion (FAQ)

```accordion
{
  "items": [
    { "title": "How do I add a new format?", "body": "Write a renderer component and register it with one line in src/renderers/index.ts. The pipeline never changes." },
    { "title": "Does it support both block syntaxes?", "body": "Yes — fenced code blocks and :::directives both resolve to the same renderer." },
    { "title": "Is AI-authored HTML executed?", "body": "No. Only markdown and typed renderers run; there is no raw HTML path." }
  ]
}
```

## Steps (interactive checklist)

```steps
{
  "interactive": true,
  "steps": [
    { "title": "Install dependencies", "body": "npm install" },
    { "title": "Start the dev server", "body": "npm run dev" },
    { "title": "Pick a sample", "body": "Click any entry in the sidebar to render it." }
  ]
}
```
