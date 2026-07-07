import type { ComponentType } from 'react';
import type { ZodTypeAny } from 'zod';

/**
 * The Renderer Registry — the core of the modular architecture.
 *
 * A rich block (from a ```<type> fence) is dispatched by its `type` string to a
 * registered renderer. Adding a new content type is a two-line change: write a
 * component and call `registerRenderer('type', ...)`. Nothing else in the
 * markdown pipeline changes.
 */

/** Props every rich renderer receives. */
export interface RichRendererProps<T = unknown> {
  /** Parsed + schema-validated block body. */
  data: T;
  /** The raw, unparsed block body text. */
  raw: string;
}

export interface RendererEntry {
  /** The React component that renders the block. */
  render: ComponentType<RichRendererProps>;
  /**
   * Zod schema validating the parsed body. On failure the dispatcher shows a
   * graceful "Invalid block" fallback instead of a broken render.
   */
  schema: ZodTypeAny;
  /**
   * Parse the raw block body into an object before validation.
   * Defaults to `JSON.parse`.
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

/** All registered types (used to keep rich fences out of syntax highlighting). */
export function registeredTypes(): string[] {
  return [...registry.keys()];
}
