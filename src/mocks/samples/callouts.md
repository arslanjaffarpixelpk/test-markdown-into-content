# Callouts & Admonitions

Callouts highlight important asides. There are four variants:

```callout
{ "variant": "note", "title": "Note", "body": "This prototype renders AI markdown into rich UI using a modular renderer registry." }
```

```callout
{ "variant": "tip", "title": "Tip", "body": "Prefer fenced code blocks (```callout) — they're the most reliable format for an AI to emit." }
```

```callout
{ "variant": "warning", "title": "Heads up", "body": "Rich blocks must contain a single valid JSON object. Malformed JSON degrades to a raw fallback." }
```

```callout
{ "variant": "danger", "title": "Important", "body": "No raw HTML is ever rendered from AI output — only markdown syntax and typed renderers." }
```

They also work through the directive syntax:

:::callout
```json
{ "variant": "tip", "body": "This callout was written with the :::callout directive form." }
```
:::
