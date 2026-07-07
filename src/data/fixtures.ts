/**
 * Canned assistant markdown, one per demo scenario. These stand in for a real
 * AI backend: the chat streams them token-by-token, and the Gallery renders
 * them statically. Each exercises the rich-block pipeline (fenced ```type JSON).
 */

export interface Fixture {
  id: string;
  label: string;
  /** The user prompt that "produces" this response (shown in the composer menu). */
  prompt: string;
  markdown: string;
}

const callout = `Here's something worth keeping in mind before you start.

\`\`\`callout
{ "variant": "tip", "title": "Pro tip", "body": "Rich blocks are just fenced code blocks whose language is the block type. The body is one JSON object — everything else is normal markdown." }
\`\`\`

You can mix these freely with regular prose, lists, and **tables**.`;

const compare = `Both plans work well. Here's how they stack up — pick one to continue:

\`\`\`compare
{
  "title": "Which plan fits you?",
  "options": [
    { "title": "Starter", "points": ["1 project", "Community support", "Free forever"], "prompt": "I'll go with the Starter plan — what are its limits?" },
    { "title": "Pro", "points": ["Unlimited projects", "Priority support", "Advanced analytics"], "recommended": true, "prompt": "Set me up with the Pro plan and explain billing." }
  ]
}
\`\`\`

Choosing an option above sends a follow-up straight into the chat.`;

const chart = `Revenue has climbed steadily through the year:

\`\`\`chart
{
  "type": "line",
  "title": "Monthly revenue ($K)",
  "xKey": "month",
  "series": [
    { "key": "revenue", "label": "Revenue" },
    { "key": "target", "label": "Target" }
  ],
  "data": [
    { "month": "Jan", "revenue": 120, "target": 100 },
    { "month": "Feb", "revenue": 168, "target": 130 },
    { "month": "Mar", "revenue": 154, "target": 160 },
    { "month": "Apr", "revenue": 202, "target": 190 },
    { "month": "May", "revenue": 244, "target": 220 },
    { "month": "Jun", "revenue": 288, "target": 260 }
  ]
}
\`\`\`

The gap over target widened in the second quarter.`;

const widget = `Try this interactive estimator — it runs sandboxed and can talk back to the chat:

\`\`\`widget
{
  "title": "Team size estimator",
  "minHeight": 150,
  "html": "<div style=\\"display:flex;flex-direction:column;gap:10px;align-items:flex-start\\"><label>Team size: <output id=\\"o\\">5</output></label><input id=\\"r\\" type=\\"range\\" min=\\"1\\" max=\\"50\\" value=\\"5\\" style=\\"width:220px\\"><button id=\\"b\\">Recommend a plan for this size</button></div><script>var r=document.getElementById('r'),o=document.getElementById('o');r.oninput=function(){o.textContent=r.value};document.getElementById('b').onclick=function(){window.sendPrompt('Recommend a plan for a team of '+r.value+' people.')};<\\/script>"
}
\`\`\`

Drag the slider, then click the button to send a tailored follow-up.`;

const svgDiagram = `Here is a visual taxonomy of the five categories of virtual assets under Pakistan's emerging regulatory regime. The AI emits the diagram as raw SVG inside a \`svg\` fence:

\`\`\`svg
<svg width="100%" viewBox="0 0 680 236" xmlns="http://www.w3.org/2000/svg" role="img" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
  <title>Classification of Virtual Assets under Pakistani Law</title>
  <desc>Virtual assets are categorised into Virtual Currencies, Utility Tokens, Security Tokens, NFTs, and Central Bank Digital Currency.</desc>
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#8a8a8a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <rect x="250" y="20" width="180" height="56" rx="8" fill="#534AB7"/>
  <text x="340" y="42" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#FFFFFF">Virtual Assets</text>
  <text x="340" y="60" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#FFFFFF">Regulatory classification</text>

  <path d="M340 76 V108 M45 108 H635" fill="none" stroke="#8a8a8a" stroke-width="1.5"/>
  <line x1="45" y1="108" x2="45" y2="140" stroke="#8a8a8a" stroke-width="1.5" marker-end="url(#ah)"/>
  <line x1="170" y1="108" x2="170" y2="140" stroke="#8a8a8a" stroke-width="1.5" marker-end="url(#ah)"/>
  <line x1="300" y1="108" x2="300" y2="140" stroke="#8a8a8a" stroke-width="1.5" marker-end="url(#ah)"/>
  <line x1="430" y1="108" x2="430" y2="140" stroke="#8a8a8a" stroke-width="1.5" marker-end="url(#ah)"/>
  <line x1="560" y1="108" x2="560" y2="140" stroke="#8a8a8a" stroke-width="1.5" marker-end="url(#ah)"/>

  <rect x="10" y="140" width="110" height="56" rx="8" fill="#0F6E56"/>
  <text x="65" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#FFFFFF">Virtual Currencies</text>
  <text x="65" y="180" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#FFFFFF">e.g. Bitcoin, Litecoin</text>

  <rect x="135" y="140" width="110" height="56" rx="8" fill="#0F6E56"/>
  <text x="190" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#FFFFFF">Utility Tokens</text>
  <text x="190" y="180" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#FFFFFF">Access to service</text>

  <rect x="265" y="140" width="110" height="56" rx="8" fill="#0F6E56"/>
  <text x="320" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#FFFFFF">Security Tokens</text>
  <text x="320" y="180" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#FFFFFF">Asset-backed / equity</text>

  <rect x="395" y="140" width="110" height="56" rx="8" fill="#0F6E56"/>
  <text x="450" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#FFFFFF">NFTs</text>
  <text x="450" y="180" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#FFFFFF">Unique digital items</text>

  <rect x="525" y="140" width="110" height="56" rx="8" fill="#185FA5"/>
  <text x="580" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#FFFFFF">CBDC (anticipated)</text>
  <text x="580" y="180" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#FFFFFF">Central bank digital currency</text>
</svg>
\`\`\`

The first four are treated as virtual assets under the Anti-Money Laundering Act, 2010, while a future CBDC would be legal tender and fall outside that definition.`;

const kitchenSink = `# Rich content demo

A single response can weave prose, standard markdown, and rich blocks together.

\`\`\`callout
{ "variant": "note", "title": "Heads up", "body": "Everything below renders from one markdown string." }
\`\`\`

## A chart

\`\`\`chart
{ "type": "bar", "title": "Quarterly signups", "xKey": "q", "series": [{ "key": "signups", "label": "Signups" }], "data": [ { "q": "Q1", "signups": 340 }, { "q": "Q2", "signups": 520 }, { "q": "Q3", "signups": 610 }, { "q": "Q4", "signups": 790 } ] }
\`\`\`

## A choice

\`\`\`compare
{ "options": [ { "title": "Keep current", "points": ["No migration", "Familiar"] }, { "title": "Upgrade", "points": ["2x faster", "New features"], "recommended": true, "prompt": "Walk me through upgrading." } ] }
\`\`\`

That's the whole system in one message.`;

/** Malformed JSON in a known block -> graceful "Invalid/Could not parse" alert. */
const malformed = `This block has broken JSON and should degrade gracefully instead of crashing:

\`\`\`callout
{ "variant": "tip", "title": "Oops", body: missing quotes and comma }
\`\`\`

The rest of the message still renders fine.`;

/** A rich fence left open (no closing \`\`\`) — used to demo the streaming skeleton. */
export const OPEN_CHART_FIXTURE = `Rendering your chart now…

\`\`\`chart
{ "type": "line", "title": "Loading", "xKey": "month", "series": [{ "key": "v" }], "data": [ { "month": "Jan"`;

const timelineDemo = `## Bail workflow timeline

\`\`\`timeline
{
  "events": [
    { "date": "Day 1", "title": "FIR lodged", "description": "Section 376 PPC, Section 154 CrPC", "status": "done" },
    { "date": "Within 24 hrs", "title": "Investigation and arrest", "description": "Pre-arrest bail may be filed under Section 498 CrPC", "status": "done" },
    { "date": "Post-arrest", "title": "Bail application", "description": "Section 497 CrPC before the Magistrate", "status": "current" },
    { "date": "If refused", "title": "Sessions Court appeal", "description": "Section 408/439 CrPC", "status": "upcoming" }
  ]
}
\`\`\``;

const stepsDemo = `## Procedural steps

\`\`\`steps
{
  "steps": [
    { "title": "FIR", "description": "Report under Section 154 CrPC" },
    { "title": "Investigation", "description": "Police collect evidence and may arrest" },
    { "title": "Bail application", "description": "File under Section 497 or 498 CrPC" },
    { "title": "Appellate review", "description": "Sessions Court, High Court, Supreme Court" }
  ]
}
\`\`\``;

const mermaidDemo = `## Bail flowchart

\`\`\`mermaid
flowchart TD
    A[Accused of Rape] --> B{Already Arrested?}
    B -->|No| C[Pre-Arrest Bail S.498]
    B -->|Yes| D[Post-Arrest Bail S.497]
    C --> E[Magistrate / Sessions]
    D --> E
    E -->|Granted| F[Released]
    E -->|Refused| G[Sessions Appeal]
\`\`\``;

const faqDemo = `## FAQ

\`\`\`faq
[
  { "question": "Is bail a right in rape cases?", "answer": "No. Bail is discretionary under Section 497 CrPC for non-bailable offences." },
  { "question": "What is pre-arrest bail?", "answer": "Relief under Section 498 CrPC sought before arrest from the Sessions Court or High Court." }
]
\`\`\``;

const accordionDemo = `## Expandable sections

\`\`\`accordion
{
  "items": [
    { "title": "FIR and Initiation", "content": "The process begins when the victim reports the offence under Section 154 CrPC." },
    { "title": "Pre-Arrest Bail", "content": "Section 498 CrPC allows applying before arrest to the Sessions Court or High Court." },
    { "title": "Post-Arrest Bail", "content": "Section 497 CrPC governs bail after arrest before the magistrate." }
  ]
}
\`\`\``;

const trackerDemo = `## Case progress

\`\`\`tracker
{
  "title": "Bail Application Progress",
  "stages": ["FIR", "Investigation", "Bail Filing", "Sessions Appeal", "High Court"],
  "current": 2
}
\`\`\``;

const jsonDemo = `## Structured workflow data

\`\`\`json
{
  "caseType": "bail",
  "offence": "Section 376 PPC",
  "forums": ["Magistrate", "Sessions Court", "High Court", "Supreme Court"]
}
\`\`\``;

const emptyBlocksDemo = `## Empty block warnings

\`\`\`timeline
\`\`\`

\`\`\`steps
\`\`\`

\`\`\`json
[]
\`\`\``;

export const FIXTURES: Fixture[] = [
  { id: 'callout', label: 'Callout', prompt: 'Give me a quick tip about rich blocks.', markdown: callout },
  { id: 'compare', label: 'Compare (interactive)', prompt: 'Compare the Starter and Pro plans.', markdown: compare },
  { id: 'chart', label: 'Chart', prompt: 'Show me monthly revenue vs target.', markdown: chart },
  { id: 'widget', label: 'Widget (interactive)', prompt: 'Help me estimate a plan for my team.', markdown: widget },
  { id: 'svg', label: 'SVG diagram', prompt: 'Show me the virtual asset classification diagram (svg).', markdown: svgDiagram },
  { id: 'kitchen-sink', label: 'Kitchen sink', prompt: 'Show me everything you can render.', markdown: kitchenSink },
];

/** Extra fixtures shown only in the Gallery (fallback + streaming states). */
export const GALLERY_EXTRAS: { id: string; label: string; markdown: string; streaming?: boolean }[] = [
  { id: 'malformed', label: 'Malformed JSON → graceful fallback', markdown: malformed },
  { id: 'streaming', label: 'Open fence (streaming) → skeleton', markdown: OPEN_CHART_FIXTURE, streaming: true },
  { id: 'timeline', label: 'Timeline', markdown: timelineDemo },
  { id: 'steps', label: 'Stepper', markdown: stepsDemo },
  { id: 'mermaid', label: 'Mermaid diagram', markdown: mermaidDemo },
  { id: 'faq', label: 'FAQ cards', markdown: faqDemo },
  { id: 'accordion', label: 'Accordion', markdown: accordionDemo },
  { id: 'tracker', label: 'Case tracker', markdown: trackerDemo },
  { id: 'json', label: 'JSON viewer', markdown: jsonDemo },
  { id: 'empty-blocks', label: 'Empty blocks → warning', markdown: emptyBlocksDemo },
];

/** Default reply for a free-typed prompt with no matching fixture. */
export function replyFor(prompt: string): string {
  const p = prompt.toLowerCase();
  const hit = FIXTURES.find((f) => f.prompt.toLowerCase() === p || p.includes(f.id));
  if (hit) return hit.markdown;
  if (p.includes('plan') || p.includes('pro') || p.includes('starter')) return compare;
  if (p.includes('revenue') || p.includes('chart') || p.includes('signup')) return chart;
  return `Here's a rich response to **"${prompt}"**:\n\n${callout}`;
}
