import { Sparkles } from 'lucide-react';
import type { SampleMeta } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

interface SidebarProps {
  samples: SampleMeta[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function Sidebar({ samples, activeId, onSelect }: SidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Rich Content</div>
            <div className="text-xs text-muted-foreground">markdown → UI</div>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2">
          <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sample AI responses
          </div>
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                'mb-0.5 block w-full rounded-lg border border-transparent px-3 py-2 text-left transition-colors',
                activeId === s.id
                  ? 'border-border bg-background shadow-sm'
                  : 'hover:bg-background/60',
              )}
            >
              <span className="block text-sm font-medium">{s.title}</span>
              <span className="block text-xs text-muted-foreground">{s.description}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        Mocked via MSW · swap for the real AI API
      </div>
    </aside>
  );
}
