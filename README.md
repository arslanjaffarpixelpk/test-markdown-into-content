# Rich Content Markdown Renderer — Prototype

A **Vite + React + TypeScript** prototype that renders structured AI responses —
charts, tables, timelines, flow diagrams, infographics, and interactive
templates — directly inside a chat UI, the way Claude renders rich content.

AI responses are just **markdown**. Rich content is expressed with a small
extension convention (fenced code blocks and/or directives) that a **modular
renderer registry** turns into React components. Adding a new content type is a
two-line change with no edits to the markdown pipeline.

The "AI backend" is mocked with **MSW**, serving sample markdown files. To go
live, swap the mock for the real AI endpoint — the client code is unchanged.

---

## Quick start

```bash
npm install
npx msw init public/ --save   # one-time: generates public/mockServiceWorker.js
npm run dev                    # http://localhost:5173
```

Pick a sample from the sidebar to see it render. `npm run build` type-checks and
builds; `npm run typecheck` runs `tsc` only.

> If `npm install` already ran MSW's postinstall, the worker file may already
> exist — the `npx msw init` step is idempotent.

---

## Architecture

```
AI markdown (mock .md via MSW /api/chat)
   → api/chat.ts               fetch → markdown string   (swap point for real AI)
   → MarkdownRenderer          react-markdown + remark/rehype plugins
        ├─ standard markdown → styled HTML (headings, lists, GFM tables, math, code)
        ├─ ```<type> fence   → intercepted in the `code`/`pre` override ─┐
        └─ :::<type> directive → remarkRichDirective → <richblock> node ─┤
                                                                          ▼
                                                        RichBlock (single dispatcher)
                                                          → registry.get(type)
                                                          → parse body (JSON / DSL)
                                                          → render inside ErrorBoundary
                                                          → unknown / parse-fail = raw fallback
                                                                          │
        ┌──────────┬──────────┬───────────┬──────────┬─────────────┬──────┘
      Chart      Table     Timeline    Mermaid   Infographic    Template
    (Recharts) (TanStack)  (custom)   (mermaid)   (custom)      (custom)
```

### Key files

| Path | Role |
| --- | --- |
| [src/renderers/registry.ts](src/renderers/registry.ts) | The registry — `registerRenderer` / `getRenderer`. The modularity core. |
| [src/renderers/index.ts](src/renderers/index.ts) | Registers all built-in renderers. **Add new types here.** |
| [src/markdown/MarkdownRenderer.tsx](src/markdown/MarkdownRenderer.tsx) | Wires react-markdown + remark/rehype plugins + overrides. |
| [src/markdown/RichBlock.tsx](src/markdown/RichBlock.tsx) | Dispatcher: type → registry → parse → render + fallback. |
| [src/markdown/overrides.tsx](src/markdown/overrides.tsx) | Intercepts fenced code + directive blocks; styles GFM output. |
| [src/markdown/remarkRichDirective.ts](src/markdown/remarkRichDirective.ts) | Turns `:::type` directives into `<richblock>` nodes. |
| [src/mocks/handlers.ts](src/mocks/handlers.ts) | MSW mock "AI backend". |
| [src/api/chat.ts](src/api/chat.ts) | Client. **The single integration point to swap for the real AI.** |

See **[STANDARDS.md](STANDARDS.md)** for the block conventions, per-renderer JSON
schemas, and how to add a renderer.

---

## Adding a new renderer (the whole process)

1. Create `src/renderers/BadgeRenderer.tsx` exporting a component that takes
   `{ data, raw, attributes }`.
2. Register it in [src/renderers/index.ts](src/renderers/index.ts):
   ```ts
   registerRenderer('badge', { render: BadgeRenderer });
   ```
3. Done. AI can now emit ` ```badge ` fences **and** `:::badge` directives; both
   route to your component. No pipeline edits.

---

## Design decisions

- **No streaming (v1).** The mock returns the full response at once; renderers
  never see partial blocks. Streaming is a later milestone.
- **No raw HTML.** `react-markdown` renders no raw HTML (we don't add
  `rehype-raw`), and renderer inputs are parsed as JSON/DSL — never `eval`'d — so
  an AI response can't inject scripts. Mermaid runs with `securityLevel: 'strict'`.
- **Two syntaxes, one dispatcher.** Fenced blocks and directives both resolve to
  `RichBlock`, so the AI can be prompted with whichever convention fits.
- **Graceful degradation.** Unknown block types and malformed payloads render
  their raw body with a notice; a throwing renderer is caught by an
  `ErrorBoundary` and never takes down the message.

---

## Swapping in the real AI

1. Delete the `enableMocking()` block in [src/main.tsx](src/main.tsx) and the
   `src/mocks/` folder.
2. Point [src/api/chat.ts](src/api/chat.ts) at the real endpoint (keep it
   returning a markdown string).
3. Prompt the model to emit rich blocks per [STANDARDS.md](STANDARDS.md).
