import type { ComponentType } from 'react';

/**
 * The Renderer Registry — the core of the modular architecture.
 *
 * A rich block (from a ```<type> fence or a :::<type> directive) is dispatched
 * by its `type` string to a registered renderer. Adding a new content type is a
 * two-line change: write a component and call `registerRenderer('type', ...)`.
 * Nothing else in the markdown pipeline needs to change.
 */

/** Props every rich renderer receives. */
export interface RichRendererProps {
  /** Parsed block body (result of `parse`). For JSON renderers this is the object. */
  data: unknown;
  /** The raw, unparsed block body text (used by DSL renderers such as Mermaid). */
  raw: string;
  /** Attributes from a directive block, e.g. `:::chart{theme=dark}`. */
  attributes?: Record<string, string>;
}

export interface RendererEntry {
  /** The React component that renders the block. */
  render: ComponentType<RichRendererProps>;
  /**
   * Parse the raw block body into `data`. Defaults to `JSON.parse`.
   * DSL renderers (e.g. Mermaid) pass identity so `raw` is used directly.
   */
  parse?: (raw: string) => unknown;
  /** Short human label, handy for docs/tooling. */
  label?: string;
}

const registry = new Map<string, RendererEntry>();

/** Register (or override) a renderer for a block type. */
export function registerRenderer(type: string, entry: RendererEntry): void {
  registry.set(type, entry);
}

/** Look up a renderer by block type. */
export function getRenderer(type: string): RendererEntry | undefined {
  return registry.get(type);
}

/** Is a type handled by a rich renderer? Used to intercept code fences. */
export function hasRenderer(type: string): boolean {
  return registry.has(type);
}

/** All registered types (for docs/debug). */
export function registeredTypes(): string[] {
  return [...registry.keys()];
}
