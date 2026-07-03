import type { SendFn } from './Composer';

interface SuggestedQuestionsProps {
  questions?: string[];
  onAsk: SendFn;
  disabled?: boolean;
}

/** Clickable follow-up chips from the completion event; click re-sends as a query. */
export function SuggestedQuestions({ questions, onAsk, disabled }: SuggestedQuestionsProps) {
  if (!questions?.length) return null;

  return (
    <div className="mt-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Suggested questions
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(q)}
            className="rounded-full border bg-background px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
