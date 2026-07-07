import { FileWarning } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/** Shown when a block has no displayable content. */
export function EmptyBlock({ type }: { type: string }) {
  return (
    <Alert className="my-4 border-warning/50 [&>svg]:text-warning">
      <FileWarning className="h-4 w-4" />
      <AlertTitle>
        Empty block <code className="ml-1 text-xs font-normal text-muted-foreground">{type}</code>
      </AlertTitle>
      <AlertDescription className="text-xs text-muted-foreground">
        The AI did not provide content for this block.
      </AlertDescription>
    </Alert>
  );
}
