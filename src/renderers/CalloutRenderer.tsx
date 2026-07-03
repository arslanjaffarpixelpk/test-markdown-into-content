import { Info, Lightbulb, TriangleAlert, OctagonAlert } from 'lucide-react';
import type { RichRendererProps } from './registry';
import type { CalloutSpec } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const VARIANT = {
  note: { icon: Info, cls: 'border-primary/40 [&>svg]:text-primary', label: 'Note' },
  tip: { icon: Lightbulb, cls: 'border-success/40 [&>svg]:text-success', label: 'Tip' },
  warning: { icon: TriangleAlert, cls: 'border-warning/50 [&>svg]:text-warning', label: 'Warning' },
  danger: {
    icon: OctagonAlert,
    cls: 'border-destructive/50 [&>svg]:text-destructive text-destructive',
    label: 'Danger',
  },
} as const;

export function CalloutRenderer({ data }: RichRendererProps) {
  const spec = data as CalloutSpec;
  const variant = VARIANT[spec.variant] ?? VARIANT.note;
  const Icon = variant.icon;

  return (
    <Alert className={cn('my-4', variant.cls)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{spec.title ?? variant.label}</AlertTitle>
      <AlertDescription>{spec.body}</AlertDescription>
    </Alert>
  );
}
