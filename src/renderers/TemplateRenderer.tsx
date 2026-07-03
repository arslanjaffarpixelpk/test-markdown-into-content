import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { RichRendererProps } from './registry';
import type { TemplateSpec, TemplateTabs, TemplateQuiz } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Interactive, data-driven template. Two demo variants (`tabs`, `quiz`) show how
 * an AI response can embed stateful UI. New variants are added here behind the
 * same `template` block type.
 */
export function TemplateRenderer({ data }: RichRendererProps) {
  const spec = data as TemplateSpec;
  switch (spec.kind) {
    case 'tabs':
      return <TabsTemplate spec={spec} />;
    case 'quiz':
      return <QuizTemplate spec={spec} />;
    default:
      return null;
  }
}

function TabsTemplate({ spec }: { spec: TemplateTabs }) {
  return (
    <Card className="my-4">
      {spec.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{spec.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={spec.title ? 'pt-2' : 'pt-6'}>
        <Tabs defaultValue="0">
          <TabsList>
            {spec.tabs.map((t, i) => (
              <TabsTrigger key={i} value={String(i)}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {spec.tabs.map((t, i) => (
            <TabsContent key={i} value={String(i)} className="text-sm">
              {t.body}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function QuizTemplate({ spec }: { spec: TemplateQuiz }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === spec.answerIndex;

  return (
    <Card className="my-4">
      {spec.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{spec.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn('space-y-3', spec.title ? 'pt-2' : 'pt-6')}>
        <p className="font-medium">{spec.question}</p>
        <div className="grid gap-2">
          {spec.options.map((opt, i) => {
            const isAnswer = i === spec.answerIndex;
            const show = answered && (isAnswer || i === picked);
            return (
              <Button
                key={i}
                variant="outline"
                disabled={answered}
                onClick={() => setPicked(i)}
                className={cn(
                  'h-auto justify-start whitespace-normal py-2 text-left',
                  show && isAnswer && 'border-success bg-success/10 text-foreground',
                  show && !isAnswer && 'border-destructive bg-destructive/10 text-foreground',
                )}
              >
                {opt}
              </Button>
            );
          })}
        </div>
        {answered && (
          <div
            className={cn(
              'flex items-start gap-2 text-sm',
              correct ? 'text-success' : 'text-destructive',
            )}
          >
            {correct ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="text-foreground">
              {correct ? 'Correct!' : 'Not quite.'} {spec.explanation}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
