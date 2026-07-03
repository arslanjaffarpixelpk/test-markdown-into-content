# Interactive Templates

AI responses can embed **stateful UI**, not just static visuals.

Here's a tabbed explainer:

```template
{
  "kind": "tabs",
  "title": "Deployment Options",
  "tabs": [
    { "label": "Cloud", "body": "Fully managed. Zero-config autoscaling, pay per use. Best for getting started fast." },
    { "label": "Self-hosted", "body": "Run in your own VPC. Full data control, bring-your-own-keys, works air-gapped." },
    { "label": "Hybrid", "body": "Control plane in cloud, data plane on-prem. Balances convenience and compliance." }
  ]
}
```

And a quick knowledge check — pick an answer:

```template
{
  "kind": "quiz",
  "title": "Quick Check",
  "question": "Which mechanism makes the renderer architecture modular?",
  "options": [
    "A giant switch statement in the chat component",
    "A renderer registry that maps block types to components",
    "Inline HTML embedded in the AI response",
    "One React component per chat message"
  ],
  "answerIndex": 1,
  "explanation": "New content types register a component under a type key — the pipeline never changes."
}
```
