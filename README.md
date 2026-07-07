# Rich Inline Chat — Prototype

Render **structured AI markdown inline in a streaming chat**. Instead of a flat wall of text, the AI emits special fenced code blocks — `callout`, `compare`, `chart`, `widget` — that are intercepted and rendered as **live React components** right in the chat stream, with Zod validation, typed streaming skeletons, and a sandboxed interactive widget that can send prompts back into the conversation.

It runs with **no backend** out of the box (mock mode streams local fixtures), and also wires up to a real Flask AI server over Server-Sent Events.

---

## Highlights

- **Registry-driven rich blocks** — adding a new content type is a 3-step change (schema + component + one registration line). Nothing else in the pipeline changes.
- **Crash-proof rendering** — every rich block degrades gracefully: unknown type, bad JSON, schema mismatch, or a throwing renderer each fall back to a friendly alert instead of breaking the chat.
- **Typed streaming skeletons** — while a block's JSON is still streaming in, a type-shaped placeholder is shown so the layout doesn't jump when the real component resolves.
- **Sandboxed interactive widgets** — the AI can ship raw HTML/JS, rendered in an `allow-scripts`-only iframe (null-origin: no access to parent DOM, cookies, or storage) that can call back into the chat via a `postMessage` bridge.
- **Mock or real backend** — one `streamChat()` function; flip modes from the header (persisted) or via env.
- **Light/dark theming** — class-based dark mode with a no-flash init, theme-aware chart palette.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Build / dev | Vite 6 + TypeScript 5.9 (strict) |
| UI | React 18, Tailwind CSS 3.4, shadcn-style primitives (Radix Slot, CVA, `tailwind-merge`) |
| Markdown | `react-markdown` 9 + `remark-gfm` |
| Validation | Zod 3 |
| Charts | Recharts 2 |
| Icons | `lucide-react` |

---

## Getting started

```bash
# 1. Install
npm install

# 2. (optional) configure the backend
cp .env.example .env.local     # leave as-is to run in mock mode

# 3. Run
npm run dev                    # http://localhost:5173
```

Other scripts:

```bash
npm run build       # tsc --noEmit + vite build
npm run typecheck   # tsc --noEmit
npm run preview     # preview the production build
```

### Configuration (`.env.local`)

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_AI_MODE` | `mock` (local fixtures, no server) or `real` (Flask SSE). | `real` if a server URL is set, else `mock` |
| `VITE_AI_SERVER_URL` | Base URL for the AI backend. Use `/ai` to route through the Vite dev proxy and avoid CORS. | `/ai` |
| `VITE_XAPIKey` | Sent as the `X-API-Key` header. | *(blank)* |
| `VITE_AI_MODEL` | LLM model id passed to the server. | `gemini` |
| `AI_PROXY_TARGET` | Where the dev proxy's `/ai/*` routes to. | `https://flask.pakistanlawbot.com` |

You can also flip **Mock ⇄ Real** at runtime from the header toggle (persisted in `localStorage`).

---

## How it works

The pipeline turns an AI markdown string into rich UI in four stages:

```
AI response (markdown w/ fenced blocks)
        │
        ▼
  MarkdownRenderer ── react-markdown + remark-gfm
        │
        ▼
  overrides (pre/code) ── intercept fences whose language is a registered type
        │                 (everything else renders as normal styled markdown)
        ▼
  RichBlock ── parse → Zod-validate → render in an ErrorBoundary
        │        (degrades to skeleton/alert at every failure point)
        ▼
  Renderer (callout · compare · chart · widget)
```

### The four building blocks

1. **Renderer Registry** — [`src/renderers/registry.ts`](src/renderers/registry.ts)
   A `Map<type, { render, schema, parse?, label? }>`. `registerRenderer()` / `getRenderer()` / `hasRenderer()`.

2. **Fence interception** — [`src/markdown/overrides.tsx`](src/markdown/overrides.tsx)
   `react-markdown` `pre`/`code` overrides route registered fence languages to `RichBlock`; unknown fences render as ordinary code, links open safely in a new tab.

3. **The dispatcher** — [`src/markdown/RichBlock.tsx`](src/markdown/RichBlock.tsx)
   Parses + validates each block and degrades safely:
   - unknown type → *"Unknown block type"* alert
   - bad JSON while streaming → typed skeleton; when done → *"Could not parse"* alert
   - schema mismatch → *"Invalid block"* alert (with the first Zod issue)
   - renderer throws → caught by an `ErrorBoundary`

4. **Backend abstraction** — [`src/api/chat.ts`](src/api/chat.ts) / [`src/api/mockChat.ts`](src/api/mockChat.ts)
   One `streamChat()` dispatches to the mock or the real Flask SSE client (brace-balanced JSON reassembly, thinking/content/completion events, session tokens, a 20s inactivity watchdog). The rest of the app is backend-agnostic.

---

## Block types

Each type validates its fenced JSON body against a [Zod schema](src/renderers/schemas.ts) — the contract between the AI and the frontend.

### `callout`
```callout
{ "variant": "tip", "title": "Heads up", "body": "This renders as an alert box." }
```
Variants: `note` · `tip` · `warning` · `danger`.

### `compare`
Side-by-side option cards; the `recommended` one is highlighted. **Each button feeds a prompt back into the chat.**
```compare
{
  "title": "Pick a plan",
  "options": [
    { "title": "Starter", "points": ["1 seat", "Community support"], "prompt": "Tell me about Starter." },
    { "title": "Pro", "points": ["Unlimited seats", "Priority support"], "recommended": true }
  ]
}
```

### `chart`
Recharts `line` / `bar` / `pie` with a theme-aware palette.
```chart
{
  "type": "bar",
  "title": "Revenue vs target",
  "xKey": "month",
  "series": [{ "key": "revenue", "label": "Revenue" }, { "key": "target" }],
  "data": [{ "month": "Jan", "revenue": 40, "target": 50 }]
}
```

### `widget`
Arbitrary AI-authored HTML/SVG rendered inside a **sandboxed iframe**. The widget can call `window.sendPrompt("...")` to inject a new turn into the chat.
```widget
{
  "title": "Estimator",
  "html": "<button onclick=\"sendPrompt('Estimate a plan for 12 people.')\">Estimate for my team</button>"
}
```

> **Security:** widgets run with `sandbox="allow-scripts"` **only** — never `allow-same-origin`. The frame is null-origin (no parent DOM / cookies / storage). Messages are trusted by window **identity**, prompt length is capped, and theme colors are inlined (iframes don't inherit CSS vars).

### Adding a new block type

1. Add a Zod schema in [`src/renderers/schemas.ts`](src/renderers/schemas.ts).
2. Write a `*Renderer.tsx` component that takes `{ data, raw }`.
3. Register it with one line in [`src/renderers/index.ts`](src/renderers/index.ts).

---

## Project structure

```
src/
├── App.tsx                     # Shell: Chat / Gallery tabs, theme + mode toggles
├── api/
│   ├── chat.ts                 # streamChat() — real Flask SSE client + dispatch
│   └── mockChat.ts             # word-by-word streaming of local fixtures
├── components/                 # ChatView, Composer, Message, ErrorBoundary, Gallery, ui/*
├── data/fixtures.ts            # canned mock responses (chosen by query)
├── lib/
│   ├── config.ts               # env + runtime AI-mode resolution
│   ├── useChatSession.ts       # the chat engine (shared by composer + blocks)
│   └── useTheme.ts             # light/dark
├── markdown/
│   ├── MarkdownRenderer.tsx    # react-markdown entry point
│   ├── overrides.tsx           # fence interception
│   ├── RichBlock.tsx           # dispatcher + graceful degradation
│   ├── BlockSkeleton.tsx       # typed streaming placeholders
│   └── ChatContext / StreamingContext
└── renderers/
    ├── registry.ts             # the renderer registry
    ├── schemas.ts              # Zod contracts
    ├── index.ts                # registrations
    └── CalloutRenderer / CompareRenderer / ChartRenderer / WidgetRenderer
```

The **chat bridge** ([`useChatSession`](src/lib/useChatSession.ts)) exposes a single `sendPrompt` used by **both** the composer **and** interactive blocks — so a Compare button or a Widget can start a new turn on the exact same path as typing.

---

## Status

Prototype (v0.1.0) — a UI/architecture proof-of-concept. Try it in **Mock** mode first, then point it at a real backend via `.env.local`.
