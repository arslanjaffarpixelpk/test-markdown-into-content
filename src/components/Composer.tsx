import { useRef, useState, type KeyboardEvent } from 'react';
import { Send, Square, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EXAMPLES } from '@/lib/examples';

/** Send a message; `model` defaults to 'gemini' when omitted. */
export type SendFn = (text: string, model?: string) => void;

/** Models offered in the composer dropdown — edit to match your local Flask. */
const MODELS = ['gemini', 'glm'] as const;

interface ComposerProps {
  onSend: SendFn;
  onStop?: () => void;
  onInsertExample?: (markdown: string) => void;
  disabled: boolean;
}

const MAX_H = 320;

export function Composer({ onSend, onStop, onInsertExample, disabled }: ComposerProps) {
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
    <div className="shrink-0 border-t bg-background/80 px-4 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border bg-background shadow-sm transition-shadow focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            ref={taRef}
            value={value}
            rows={3}
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, MAX_H)}px`;
            }}
            onKeyDown={onKeyDown}
            placeholder="Ask the AI…  (Enter to send · Shift+Enter for a new line)"
            className="min-h-[72px] w-full resize-none border-0 bg-transparent px-4 pt-3 text-[15px] shadow-none focus-visible:ring-0"
            style={{ maxHeight: MAX_H }}
          />

          <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={disabled}
                title="Model"
                className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {onInsertExample && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Insert example
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
                    <DropdownMenuLabel className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Render a rich block
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {EXAMPLES.map((ex) => (
                      <DropdownMenuItem key={ex.id} onSelect={() => onInsertExample(ex.markdown)}>
                        {ex.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

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
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Responses render markdown + rich blocks (charts, tables, callouts…). Try{' '}
          <span className="font-medium">Insert example</span>.
        </p>
      </div>
    </div>
  );
}
