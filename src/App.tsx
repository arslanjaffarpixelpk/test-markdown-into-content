import { useState } from 'react';
import { MessagesSquare, LayoutGrid } from 'lucide-react';
import { ChatView } from '@/components/ChatView';
import { Gallery } from '@/components/Gallery';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ModeToggle } from '@/components/ModeToggle';
import { cn } from '@/lib/utils';

type Tab = 'chat' | 'gallery';

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Rich Inline Chat</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            callout · compare · chart · widget
          </span>
        </div>
        <div className="flex items-center gap-1">
          <nav className="mr-1 flex rounded-lg border p-0.5 text-sm">
            <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={<MessagesSquare className="h-3.5 w-3.5" />}>
              Chat
            </TabButton>
            <TabButton active={tab === 'gallery'} onClick={() => setTab('gallery')} icon={<LayoutGrid className="h-3.5 w-3.5" />}>
              Gallery
            </TabButton>
          </nav>
          {tab === 'chat' && <ModeToggle />}
          <ThemeToggle />
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden">
        {tab === 'chat' ? <ChatView /> : <div className="h-full overflow-y-auto"><Gallery /></div>}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
