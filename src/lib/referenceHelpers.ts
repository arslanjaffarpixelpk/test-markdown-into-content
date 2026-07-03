// Tolerant field readers for the loosely-typed `relevant_laws` /
// `relevant_judgments` payloads the AI returns. Mirrors the two pure helpers
// from law-bot-frontend/src/utils/referenceCardHelpers.ts.

/** Return a trimmed, non-empty string, or undefined. */
export const text = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;

/** Return the value if it is an array, else an empty array. */
export const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
