/// <reference types="vite/client" />

// Allow importing markdown files as raw strings, e.g. `import md from './x.md?raw'`
declare module '*.md?raw' {
  const content: string;
  export default content;
}
