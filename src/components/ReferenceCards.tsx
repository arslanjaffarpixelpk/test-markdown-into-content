import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { asArray, text } from '@/lib/referenceHelpers';
import { cn } from '@/lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** One "relevant law" card. Reads the tolerant field names the AI may emit. */
function LawReferenceCard({ l }: { l: any }) {
  const title =
    text(l?.title) ||
    text(l?.name) ||
    text(l?.section) ||
    text(l?.provision) ||
    text(l?.law) ||
    'Law';
  const section = text(l?.section) || text(l?.provision);
  const description = text(l?.description) || text(l?.summary) || text(l?.details);
  const url = text(l?.link) || text(l?.url) || text(l?.source_url);

  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug">{title}</h4>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      {section && (
        <div className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium">Section:</span> {section}
        </div>
      )}
      {description && (
        <div className="markdown-body mt-2 text-xs text-muted-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
        </div>
      )}
      {!section && !description && !url && (
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-muted/50 p-2 text-xs">
          {JSON.stringify(l, null, 2)}
        </pre>
      )}
    </div>
  );
}

function outcomeClasses(outcome: string): string {
  const lower = outcome.toLowerCase();
  if (/allowed|granted|succeeded|upheld|maintained/.test(lower)) {
    return 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400';
  }
  if (/dismissed|refused|rejected|failed|quashed/.test(lower)) {
    return 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400';
  }
  return 'border-border bg-muted/50 text-muted-foreground';
}

/** One "relevant judgment" card. */
function JudgmentReferenceCard({ j }: { j: any }) {
  const [showSummary, setShowSummary] = useState(false);
  const title = text(j?.caseTitle) || text(j?.title) || text(j?.caseNumber) || 'Judgment';
  const court = text(j?.courtName);
  const outcome = text(j?.outcome);
  const sections = text(j?.legalSectionsInvolved);
  const summary = text(j?.shortSummaryOfTheCase) || text(j?.summary) || text(j?.facts);
  const url = text(j?.source_url) || text(j?.link) || text(j?.url);
  const cited =
    asArray(j?.citedCaseLaws).length > 0
      ? (asArray(j?.citedCaseLaws) as string[])
      : (text(j?.citedCaseLaws)?.split(',') ?? []);

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3 text-card-foreground">
      {court && (
        <span className="inline-flex items-center gap-1 rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
          Court: <span className="font-semibold">{court}</span>
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug">{title}</h4>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {outcome && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
            outcomeClasses(outcome),
          )}
        >
          <span className="font-semibold">Outcome:</span> {outcome}
        </span>
      )}

      {sections && (
        <div className="flex flex-wrap gap-1.5">
          {sections.split(',').map((s, i) => (
            <span
              key={i}
              className="rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      {summary && (
        <div>
          <button
            type="button"
            onClick={() => setShowSummary((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Summary
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showSummary && 'rotate-180')} />
          </button>
          {showSummary && (
            <div className="markdown-body mt-1 text-xs text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {cited.length > 0 && (
        <div className="border-t pt-2 text-xs text-muted-foreground">
          <span className="font-medium">Cited cases:</span> {cited.join(', ')}
        </div>
      )}
    </div>
  );
}

/** Renders the "relevant laws" and "relevant judgments" sections, if any. */
export function References({
  laws,
  judgments,
}: {
  laws?: unknown[];
  judgments?: unknown[];
}) {
  const lawList = asArray(laws);
  const judgmentList = asArray(judgments);
  if (!lawList.length && !judgmentList.length) return null;

  return (
    <div className="mt-4 space-y-4">
      {lawList.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Relevant Laws
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {lawList.map((l, i) => (
              <LawReferenceCard key={i} l={l} />
            ))}
          </div>
        </div>
      )}

      {judgmentList.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Relevant Judgments
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {judgmentList.map((j, i) => (
              <JudgmentReferenceCard key={i} j={j} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
