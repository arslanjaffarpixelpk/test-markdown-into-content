import { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { fetchSamples, fetchChat } from './api/chat';
import type { ChatMessage, SampleMeta } from '@/types';

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

export default function App() {
  const [samples, setSamples] = useState<SampleMeta[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSamples()
      .then(setSamples)
      .catch((err) => console.error('Failed to load samples', err));
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', content: `Show me the "${id}" example.` },
    ]);
    fetchChat(id)
      .then((content) => {
        setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content }]);
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: `**Error loading response:** ${String(err)}` },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar samples={samples} activeId={activeId} onSelect={handleSelect} />
      <ChatWindow messages={messages} loading={loading} />
    </div>
  );
}
