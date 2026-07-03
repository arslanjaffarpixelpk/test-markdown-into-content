# Code Formats

Standard fenced code blocks are syntax-highlighted:

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

For install instructions or multi-language snippets, use a **code group** — tabs
with a copy button:

```codegroup
{
  "tabs": [
    { "label": "npm", "language": "bash", "code": "npm install rich-content-renderer" },
    { "label": "pnpm", "language": "bash", "code": "pnpm add rich-content-renderer" },
    { "label": "yarn", "language": "bash", "code": "yarn add rich-content-renderer" },
    { "label": "bun", "language": "bash", "code": "bun add rich-content-renderer" }
  ]
}
```

Multi-file example:

```codegroup
{
  "tabs": [
    { "label": "registry.ts", "language": "ts", "code": "export const getRenderer = (t) => registry.get(t);" },
    { "label": "index.ts", "language": "ts", "code": "registerRenderer('badge', { render: BadgeRenderer });" }
  ]
}
```
