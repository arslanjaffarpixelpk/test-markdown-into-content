# Rendering Standards for AI Responses

This is the contract between the AI and the frontend. An AI response is a normal
**markdown** document. Rich, structured content is expressed with **rich blocks**
that the renderer registry turns into components.

## 1. Block syntaxes

Two interchangeable syntaxes are supported; both resolve to the same renderer.

### A. Fenced code block (preferred)

Use the block **type** as the fence language, with a JSON (or DSL) body:

<pre>
```chart
{ "type": "line", "series": [...], "data": [...] }
```
</pre>

### B. Directive

Use a `:::type` container with the payload in a nested `json` fence:

<pre>
:::chart
```json
{ "type": "line", "series": [...], "data": [...] }
```
:::
</pre>

Directives may carry attributes: `:::chart{height=360}` → passed to the renderer
as `attributes`.

**Guidance for prompting the AI:** prefer syntax **A** (fenced blocks) — it is the
simplest to emit reliably. Emit exactly one JSON object per block, with no prose
inside the fence. Unknown types and malformed JSON degrade gracefully (the raw
block is shown), but should be avoided.

## 2. Registered block types & schemas

Payloads are TypeScript-typed in [src/types.ts](src/types.ts). Summary:

### `chart` — Recharts
```json
{
  "type": "line | bar | area | pie",
  "title": "optional string",
  "xKey": "key on each datum for the x-axis / pie label",
  "stacked": false,
  "height": 300,
  "series": [{ "key": "revenue", "label": "Revenue", "color": "#6366f1" }],
  "data": [{ "month": "Jan", "revenue": 120 }]
}
```
For `pie`, the value comes from `series[0].key` and the label from `xKey`.

### `table` — TanStack Table (sortable)
```json
{
  "title": "optional",
  "sortable": true,
  "columns": [{ "key": "assignee", "label": "Assignee", "align": "left | right | center" }],
  "rows": [{ "assignee": "Ami", "open": 12 }]
}
```
> Note: simple, non-interactive tables can also be written as ordinary **GFM
> markdown tables** — no rich block needed.

### `timeline` — custom
```json
{
  "title": "optional",
  "events": [
    { "date": "Aug 2026", "title": "Prototype", "description": "optional", "status": "done | active | upcoming" }
  ]
}
```

### `mermaid` — Mermaid (DSL, not JSON)
The body is raw [Mermaid](https://mermaid.js.org) source (flowchart, sequence,
gantt, …):
<pre>
```mermaid
graph TD
    A --> B
```
</pre>

### `infographic` — custom KPI grid
```json
{
  "title": "optional",
  "stats": [
    { "icon": "💰", "label": "Revenue", "value": "$312", "unit": "K",
      "delta": "+15.6%", "trend": "up | down | flat", "description": "optional" }
  ]
}
```

### `template` — interactive UI (data-driven)
Tabs:
```json
{ "kind": "tabs", "title": "optional", "tabs": [{ "label": "Cloud", "body": "text" }] }
```
Quiz:
```json
{ "kind": "quiz", "question": "…", "options": ["a", "b"], "answerIndex": 1, "explanation": "optional" }
```

### `callout` — shadcn Alert
```json
{ "variant": "note | tip | warning | danger", "title": "optional", "body": "text" }
```

### `accordion` — shadcn Accordion
```json
{ "items": [{ "title": "Question?", "body": "Answer." }] }
```

### `steps` — custom (numbered guide / checklist)
```json
{ "interactive": false, "steps": [{ "title": "Install", "body": "optional detail" }] }
```
Set `"interactive": true` to make each step a checkable item.

### `codegroup` — shadcn Tabs (tabbed code)
```json
{ "tabs": [{ "label": "npm", "language": "bash", "code": "npm install x" }] }
```

### `cards` — shadcn Card grid
```json
{ "columns": 2, "cards": [{ "title": "Charts", "description": "optional", "body": "optional", "badge": "optional", "footer": "optional" }] }
```

### `badges` — shadcn Badge row
```json
{ "title": "optional", "badges": [{ "label": "Stable", "variant": "default | secondary | destructive | outline" }] }
```

### `progress` — shadcn Progress bars
```json
{ "title": "optional", "items": [{ "label": "Docs", "value": 60, "max": 100 }] }
```
`max` defaults to 100 (value read as a percentage).

## 3. Fallback behavior

| Situation | Result |
| --- | --- |
| Unknown block type | Raw body shown with an "Unknown block type" notice. |
| Malformed JSON / DSL | Raw body shown with a "Could not parse" notice. |
| Renderer throws at runtime | Caught by an `ErrorBoundary`; raw body shown. The rest of the message still renders. |

Rich blocks are always **isolated** — one bad block never breaks the message.

## 4. Security rules

- **No raw HTML** is rendered from AI output (`rehype-raw` is intentionally
  absent). Only markdown syntax + typed renderers.
- Renderer payloads are parsed with `JSON.parse` (or a DSL parser), **never**
  `eval`.
- Mermaid runs with `securityLevel: 'strict'` (no click-through JavaScript).
- Links open with `rel="noopener noreferrer"`.

## 5. Adding a new block type

1. Add the payload type to [src/types.ts](src/types.ts).
2. Create the renderer component under `src/renderers/` accepting
   `{ data, raw, attributes }`.
3. Register it in [src/renderers/index.ts](src/renderers/index.ts) with
   `registerRenderer('yourtype', { render: YourRenderer })`.
4. Document its schema in this file.

No changes to the markdown pipeline are required — that is the point of the
registry.
