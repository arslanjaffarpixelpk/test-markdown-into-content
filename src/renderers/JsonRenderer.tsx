import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { RichRendererProps } from './registry';
import { isEmptyJson, isFaqShape, isTrackerShape, type JsonPayload } from './schemas';
import { FaqRenderer } from './FaqRenderer';
import { TrackerRenderer } from './TrackerRenderer';
import { EmptyBlock } from './EmptyBlock';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function GenericJsonTree({ data }: { data: JsonPayload }) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="my-4">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          JSON data
        </button>
        {open && (
          <pre className={cn('overflow-x-auto border-t bg-muted/30 p-4 text-xs')}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

export function JsonRenderer({ data, raw }: RichRendererProps) {
  const payload = data as JsonPayload;

  if (isEmptyJson(payload)) {
    return <EmptyBlock type="json" />;
  }

  if (isFaqShape(payload)) {
    return <FaqRenderer data={payload} raw={raw} />;
  }

  if (isTrackerShape(payload)) {
    return <TrackerRenderer data={payload} raw={raw} />;
  }

  return <GenericJsonTree data={payload} />;
}
