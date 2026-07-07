import type { RichRendererProps } from './registry';
import type { StepsPayload } from './schemas';
import { cn } from '@/lib/utils';

export function StepperRenderer({ data }: RichRendererProps) {
  const { steps } = data as StepsPayload;

  return (
    <div className="my-4">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className="font-medium leading-8">{step.title}</p>
              {step.description && (
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
