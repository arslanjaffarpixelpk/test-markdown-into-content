import { useState } from 'react';
import { Cloud, FlaskConical } from 'lucide-react';
import { getAiMode, setAiMode, HAS_AI_SERVER, type AiMode } from '@/lib/config';
import { cn } from '@/lib/utils';

/**
 * Runtime switch between the real Flask AI backend and the local mock. Persists
 * to localStorage and reloads so the change takes effect immediately.
 */
export function ModeToggle() {
  const [mode, setMode] = useState<AiMode>(() => getAiMode());

  const choose = (next: AiMode) => {
    if (next === mode) return;
    setAiMode(next);
    setMode(next);
    // Clear any cached session token when switching backends.
    try {
      localStorage.removeItem('session_token');
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div className="flex items-center rounded-lg border p-0.5 text-xs" title={HAS_AI_SERVER ? '' : 'No AI server configured — set VITE_AI_SERVER_URL in .env.local'}>
      <button
        type="button"
        onClick={() => choose('real')}
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1 transition-colors',
          mode === 'real' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Cloud className="h-3 w-3" /> Live AI
      </button>
      <button
        type="button"
        onClick={() => choose('mock')}
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1 transition-colors',
          mode === 'mock' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <FlaskConical className="h-3 w-3" /> Mock
      </button>
    </div>
  );
}
