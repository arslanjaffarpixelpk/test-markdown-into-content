import { useRef, useState, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

/** Send a message; `model` defaults to 'gemini' when omitted. */
export type SendFn = (text: string, model?: string) => void;

/** Models offered in the composer dropdown — edit to match your local Flask. */
const MODELS = ['gemini', 'glm'] as const;

interface ComposerProps {
  onSend: SendFn;
  onStop?: () => void;
  disabled: boolean;
}

export function Composer({ onSend, onStop, disabled }: ComposerProps) {
  const [value, setValue] = useState('');
  const [model, setModel] = useState<string>(MODELS[0]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text, model);
    setValue('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="shrink-0 border-t bg-background/80 px-4 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={disabled}
          title="Model"
          className="h-9 shrink-0 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <Textarea
          ref={taRef}
          value={value}
          rows={1}
          disabled={disabled}
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
          }}
          onKeyDown={onKeyDown}
          placeholder="Ask the AI…  (Enter to send, Shift+Enter for a new line)"
          className="max-h-[200px] min-h-9 flex-1 resize-none py-2"
        />

        {disabled && onStop ? (
          <Button type="button" variant="outline" size="icon" onClick={onStop} title="Stop">
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={submit}
            disabled={disabled || !value.trim()}
            title="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
