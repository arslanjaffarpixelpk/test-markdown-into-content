import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyMarkdownButtonProps {
  content: string;
}

export function CopyMarkdownButton({ content }: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy markdown">
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Copy markdown
        </>
      )}
    </Button>
  );
}
