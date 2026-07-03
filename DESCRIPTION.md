# Rich Content Rendering — Detailed Project Description

> A working prototype for rendering structured AI responses (charts, tables, timelines,
> flow diagrams, infographics, callouts, interactive templates, and more) directly inside
> a chat UI — the way Claude renders rich content. Built to demo and finalize an
> architecture for the **"Rich Content Rendering (Discussion & Planning)"** ticket.

---

## 1. Purpose & problem

The chat product needs to render **rich, structured content** in AI responses, not just
plain text. AI models return **markdown**, and standard markdown only covers headings,
lists, basic tables, code, and links. Everything else — charts, timelines, flow diagrams,
KPI infographics, callouts, interactive widgets — has no native markdown representation.

This prototype solves that with two ideas working together:

1. **An extension convention** — the AI marks up rich content with fenced code blocks
   (```` ```chart ````) and/or directives (`:::chart`) whose body is a small JSON (or DSL)
   payload.
2. **A modular renderer registry** — a lookup table that maps each block *type* to a React
   component. New content types are added by writing a component and registering it in one
   line; the markdown pipeline never changes.

The result: the AI emits portable markdown; the frontend turns it into a polished,
design-system UI. The "AI backend" is currently **mocked** (MSW serving sample markdown)
and is designed to be swapped for the real AI API with no client-side changes.

---

## 2. Technology stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build / dev | **Vite 6** + React 18 + TypeScript | Fast HMR, first-class TS, `?raw` imports |
| Markdown | **react-markdown 9** + remark/rehype | Element-tree rendering with plugin pipeline |
| GFM / math / code | `remark-gfm`, `remark-math` + `rehype-katex`, `rehype-highlight` | Tables, KaTeX, syntax highlighting |
| Directives | `remark-directive` + `unist-util-visit` | `:::type` block syntax |
| Charts | **Recharts** | Declarative, React-native charts |
| Tables | **TanStack Table** | Headless sorting/interaction |
| Diagrams | **Mermaid** | Flow / sequence / gantt from text DSL |
| Design system | **Tailwind CSS v3 + shadcn/ui** | Accessible primitives, theme tokens, light/dark |
| Icons | **lucide-react** | Matches shadcn |
| Mock API | **MSW (Mock Service Worker)** | Realistic HTTP surface to swap for the real AI |

---

## 3. End-to-end data flow

```
AI markdown (mock .md served by MSW at /api/chat)
   │
   ▼  api/chat.ts  →  returns a markdown string   ← single swap point for the real AI
   │
   ▼  MarkdownRenderer (react-markdown)
   │     remark:  gfm → math → directive → remarkRichDirective
   │     rehype:  katex → highlight (rich langs kept as plain text)
   │     components: overrides for code / pre / richblock / table / a
   │
   ├─ plain markdown  ─────────────►  styled HTML (headings, lists, GFM tables, math, code)
   │
   ├─ ```<type> fence  ─► code/pre override detects the language ─┐
   └─ :::<type> directive ─► remarkRichDirective → <richblock> node ┤
                                                                    ▼
                                                     RichBlock (single dispatcher)
                                                       1. registry.get(type)
                                                       2. parse body (JSON.parse / DSL identity)
                                                       3. render inside an ErrorBoundary
                                                       4. unknown type or parse error → raw fallback
                                                                    │
     ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────┴─── … 13 renderers …
   Chart      Table     Timeline    Mermaid   Infographic  Callout   (chart, table, timeline,
  (Recharts)(TanStack) (custom)   (Mermaid)   (custom)    (Alert)     mermaid, infographic,
                                                                       progress, callout,
                                                                       accordion, steps,
                                                                       codegroup, cards,
                                                                       badges, template)
```

**Key property:** both the fenced-block path and the directive path converge on the *same*
`RichBlock` dispatcher and the *same* registry. The AI can be prompted with whichever syntax
is more reliable, and the frontend treats them identically.

---

## 4. The renderer registry (the core abstraction)

`src/renderers/registry.ts` is a `Map<string, RendererEntry>`:

```ts
export interface RichRendererProps {
  data: unknown;                 // parsed body (JSON object), or null
  raw: string;                   // raw block text (for DSL renderers like Mermaid)
  attributes?: Record<string, string>;  // directive attributes, e.g. :::chart{height=360}
}

export interface RendererEntry {
  render: React.ComponentType<RichRendererProps>;
  parse?: (raw: string) => unknown;   // default JSON.parse; Mermaid uses identity
  label?: string;
}
```

- `registerRenderer(type, entry)` — add/override a renderer.
- `getRenderer(type)` / `hasRenderer(type)` — used by the dispatcher and the code-fence override.

All built-in renderers register themselves in `src/renderers/index.ts`, imported once for its
side effects at boot (`src/main.tsx`).

**Adding a new format is a 3-step, ~2-line change:**
1. Add a payload type to `src/types.ts`.
2. Write `src/renderers/FooRenderer.tsx` taking `{ data, raw, attributes }`.
3. `registerRenderer('foo', { render: FooRenderer })` in `src/renderers/index.ts`.

That's it — no edits to `MarkdownRenderer`, `RichBlock`, or the plugins.

---

## 5. Supported formats (13 renderers)

### Data & structure
| Type | Renderer | Library | Payload | Notes |
| --- | --- | --- | --- | --- |
| `chart` | `ChartRenderer` | Recharts | JSON | line / bar / area / pie; theme-aware palette; stacked option |
| `table` | `TableRenderer` | TanStack + shadcn Table | JSON | click-to-sort headers, column alignment |
| `timeline` | `TimelineRenderer` | custom | JSON | status dots (done / active / upcoming) + connector |
| `mermaid` | `MermaidRenderer` | Mermaid | **DSL** | flow / sequence / gantt; re-themes on light/dark |
| `infographic` | `InfographicRenderer` | custom | JSON | KPI stat-card grid with trend arrows |
| `progress` | `ProgressRenderer` | shadcn Progress | JSON | labeled metric bars |

### Content & layout
| Type | Renderer | Library | Payload | Notes |
| --- | --- | --- | --- | --- |
| `callout` | `CalloutRenderer` | shadcn Alert | JSON | note / tip / warning / danger, with icons |
| `accordion` | `AccordionRenderer` | shadcn Accordion | JSON | collapsible FAQ sections |
| `steps` | `StepsRenderer` | custom | JSON | numbered guide or interactive checklist |
| `codegroup` | `CodeGroupRenderer` | shadcn Tabs | JSON | tabbed multi-file/lang code + copy button |
| `cards` | `CardsRenderer` | shadcn Card | JSON | responsive card grid with badges/footers |
| `badges` | `BadgesRenderer` | shadcn Badge | JSON | status/tag rows |

### Interactive
| Type | Renderer | Library | Payload | Notes |
| --- | --- | --- | --- | --- |
| `template` | `TemplateRenderer` | shadcn Tabs / Button | JSON | stateful UI; `tabs` and `quiz` variants |

Plus everything **standard markdown** already covers, handled by the pipeline: headings,
lists, task lists, blockquotes, GFM tables, syntax-highlighted code fences, and KaTeX math.

Every payload schema is documented in **[STANDARDS.md](STANDARDS.md)**.

---

## 6. The two block syntaxes

Both resolve to the identical renderer.

**A. Fenced code block (preferred — most reliable for an AI to emit):**
<pre>
```chart
{ "type": "line", "xKey": "month", "series": [{ "key": "revenue" }], "data": [ ... ] }
```
</pre>

**B. Directive (payload in a nested `json` fence):**
<pre>
:::chart
```json
{ "type": "line", "xKey": "month", "series": [{ "key": "revenue" }], "data": [ ... ] }
```
:::
</pre>

Fenced blocks are detected in the `code`/`pre` component overrides
(`src/markdown/overrides.tsx`). Directives are transformed by a small remark plugin
(`src/markdown/remarkRichDirective.ts`) into a `<richblock>` node carrying the type + raw
body, which the overrides map to `RichBlock`.

---

## 7. Robustness & security ("rendering standards")

- **Graceful fallback.** Unknown block types and malformed JSON render their raw body inside
  a shadcn Alert with a notice — they never crash the message. A renderer that throws at
  runtime is caught by an `ErrorBoundary` (`src/components/ErrorBoundary.tsx`); the rest of
  the message still renders.
- **No raw HTML.** `react-markdown` renders no raw HTML (we deliberately omit `rehype-raw`).
  AI output flows only through markdown syntax + typed renderers, so a response cannot inject
  arbitrary HTML or scripts.
- **No `eval`.** Renderer payloads are parsed with `JSON.parse` (or a DSL parser), never
  evaluated as code.
- **Sandboxed diagrams.** Mermaid runs with `securityLevel: 'strict'` (no click-through JS).
- **Safe links.** All links open with `rel="noopener noreferrer"`.

---

## 8. Theming

Tailwind + shadcn CSS variables drive a full **light/dark** theme (`src/index.css`). A toggle
in the sidebar header (`src/components/ThemeToggle.tsx`) flips the `.dark` class on
`<html>`, persists the choice to `localStorage`, and defaults to the OS preference. Charts
(via CSS-var palette) and Mermaid diagrams (re-initialized per theme) both adapt.

---

## 9. Mock AI backend

`src/mocks/handlers.ts` (MSW) exposes:
- `GET /api/samples` — the list of sample responses (drives the sidebar).
- `POST /api/chat` — returns the full markdown for a selected sample (no streaming in v1).

Sample "AI responses" live in `src/mocks/samples/*.md` and are imported as raw strings via
Vite's `?raw`. The client (`src/api/chat.ts`) is the **single integration point**: to go
live, replace the MSW handler with the real AI endpoint and this function is unchanged.

Samples: `charts`, `tables`, `timeline`, `flowchart`, `infographic`, `interactive`,
`callouts`, `components`, `code`, and a `kitchen-sink` exercising every renderer plus both
syntaxes and the fallback.

---

## 10. Project structure

```
src/
├─ main.tsx                 boot: start MSW (dev) → register renderers → render App
├─ App.tsx                  layout: Sidebar + ChatWindow; drives fetchSamples/fetchChat
├─ index.css               Tailwind layers + shadcn theme tokens + markdown prose styles
├─ types.ts                shared types + every renderer payload schema
├─ lib/utils.ts            cn() class-merge helper
├─ api/chat.ts             AI client (swap point for the real API)
├─ mocks/                  MSW worker, handlers, samples/*.md
├─ markdown/
│  ├─ MarkdownRenderer.tsx wires react-markdown + plugins + overrides
│  ├─ overrides.tsx        code/pre/richblock/table/a component overrides
│  ├─ remarkRichDirective.ts  :::type → <richblock> node
│  └─ RichBlock.tsx        dispatcher: type → registry → parse → render + fallback
├─ renderers/
│  ├─ registry.ts          the Map + register/get API
│  ├─ index.ts             registers all 13 renderers
│  └─ *Renderer.tsx        one component per format
└─ components/
   ├─ ui/                  shadcn primitives (Card, Table, Tabs, Alert, …)
   ├─ Sidebar / ChatWindow / Message / ThemeToggle / ErrorBoundary
```

**Unchanged across the Tailwind/shadcn migration** (the payoff of the modular design):
`registry.ts`, the entire `markdown/` pipeline, and `api/chat.ts`.

---

## 11. Running it

```bash
npm install
npx msw init public/ --save   # one-time: generates public/mockServiceWorker.js
npm run dev                    # http://localhost:5173
```

- `npm run build` — type-checks (`tsc --noEmit`) and builds.
- `npm run typecheck` — types only.

shadcn components and Tailwind config are committed, so no `shadcn init` is needed.

---

## 12. Verification status

- ✅ `tsc --noEmit` and `vite build` are clean.
- ✅ Automated browser smoke test (Playwright): all 10 samples render with **zero console/
  page errors**; Recharts, Mermaid, tables, alerts, tabs, cards, and progress bars all
  present.
- ✅ Interactions verified: table sorting, tabs, quiz, and the unknown-type fallback.
- ✅ Light and dark themes visually confirmed.

---

## 13. Path to production

1. **Wire the real AI** — replace the MSW handler; keep `api/chat.ts` returning markdown.
2. **Prompt the model** to emit rich blocks per [STANDARDS.md](STANDARDS.md) (favor fenced
   blocks).
3. **Streaming** — the current v1 returns full responses; progressive rendering (partial
   code-fence handling) is the next milestone.
4. **Extend formats** — add renderers as needed (maps, image galleries, forms, diffs…) using
   the same one-line registration.
5. **Hardening** — schema validation per renderer (e.g. Zod), accessibility audit, bundle
   code-splitting (Mermaid is the heaviest chunk).

---

## 14. Deliverables mapping (ticket → artifact)

| Ticket deliverable | Where |
| --- | --- |
| Proposed rendering architecture | §3–4 above + [README.md](README.md) |
| Component strategy | §4–5 (registry + one component per format) |
| Rendering standards for AI responses | §6–7 + [STANDARDS.md](STANDARDS.md) |
| Development implementation plan | §11, §13 + the working prototype itself |
