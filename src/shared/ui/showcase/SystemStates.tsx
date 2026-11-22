import { Inbox } from "lucide-react";
import { CardSkeleton, EmptyState, ErrorState } from "@/shared/ui/brand";
import { Button } from "@/shared/ui/primitives/button";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

function Label({ children }: { children: string }) {
  return <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{children}</p>;
}

export function SystemStates() {
  const s = C.estados;
  return (
    <SystemSection id="estados-titulo" testId="sistema-estados" {...s}>
      <div className="grid gap-8 lg:grid-cols-3">
        <div data-testid="estado-vacio" className="flex flex-col gap-3">
          <Label>{s.emptyLabel}</Label>
          <EmptyState
            icon={Inbox}
            title={s.emptyTitle}
            description={s.emptyDescription}
            action={<Button variant="outline">{s.emptyAction}</Button>}
            className="h-full"
          />
        </div>
        <div data-testid="estado-carga" className="flex flex-col gap-3">
          <Label>{s.loadingLabel}</Label>
          <CardSkeleton />
        </div>
        <div data-testid="estado-error" className="flex flex-col gap-3">
          <Label>{s.errorLabel}</Label>
          <ErrorState
            description={s.errorDescription}
            action={<Button variant="outline">{s.errorAction}</Button>}
            className="h-full"
          />
        </div>
      </div>
    </SystemSection>
  );
}
