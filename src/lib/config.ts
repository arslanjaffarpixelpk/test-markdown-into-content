/**
 * Runtime config for the chat harness.
 *
 * `AI_MODE` toggles the chat backend between:
 *   - 'mock' — simulated streaming of local fixtures, entirely client-side.
 *   - 'real' — the Flask AI server (VITE_AI_SERVER_URL) over SSE.
 *
 * Set `VITE_AI_MODE=real` (or `mock`) in `.env.local`. Defaults to 'real' when a
 * server URL is configured, otherwise 'mock' so the app still works with no
 * backend.
 */
export type AiMode = 'mock' | 'real';

const envMode = import.meta.env.VITE_AI_MODE as string | undefined;

/** AI base URL. `/ai` routes through the Vite dev proxy (see vite.config.ts). */
export const AI_BASE = (import.meta.env.VITE_AI_SERVER_URL ?? '')
  .replace(/\/+$/, '')
  .replace(/\/api\/chat$/, '');

/** Key sent as the `X-API-Key` header (blank if the server doesn't require one). */
export const X_API_KEY = (import.meta.env.VITE_XAPIKey as string | undefined) ?? '';

/** Default model id passed to the Flask server. */
export const AI_MODEL = (import.meta.env.VITE_AI_MODEL as string | undefined) ?? 'gemini';

/** Mode from env (or inferred: 'real' when a server URL is set, else 'mock'). */
export const AI_MODE: AiMode =
  envMode === 'real' ? 'real' : envMode === 'mock' ? 'mock' : AI_BASE ? 'real' : 'mock';

const MODE_KEY = 'ai_mode';

/** Effective mode, allowing a runtime override (persisted) to win over env. */
export function getAiMode(): AiMode {
  try {
    const o = localStorage.getItem(MODE_KEY);
    if (o === 'real' || o === 'mock') return o;
  } catch {
    /* ignore */
  }
  return AI_MODE;
}

/** Persist a runtime mode override (used by the header toggle). */
export function setAiMode(mode: AiMode): void {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/** True when the real backend is unreachable/unconfigured — used to warn in the UI. */
export const HAS_AI_SERVER = AI_BASE.length > 0;
