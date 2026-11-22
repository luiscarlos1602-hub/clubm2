import { CardSkeleton, ErrorState } from "@/shared/ui/brand";
import { Button } from "@/shared/ui/primitives/button";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY.common;

export function PanelLoading({ testId }: { testId: string }) {
  return (
    <div data-testid={testId} role="status" aria-label={C.loadingTitle} className="grid gap-6 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PanelError({ onRetry, testId }: { onRetry: () => void; testId: string }) {
  return (
    <ErrorState
      data-testid={testId}
      title={C.error.title}
      description={C.error.description}
      action={
        <Button variant="outline" onClick={onRetry}>
          {C.error.retry}
        </Button>
      }
    />
  );
}
