import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { Surface } from "@/shared/ui/layout";

export type AdminKpiProps = TestIdProp & { label: string; children: ReactNode; hint?: string };

/** Indicador del backoffice: rótulo, cifra grande y nota. La cifra la entrega quien lo usa. */
export function AdminKpi({ label, children, hint, className, "data-testid": testId = "admin-kpi" }: AdminKpiProps) {
  return (
    <Surface padding="sm" data-testid={testId} className={cn("gap-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="font-heading text-3xl font-semibold tabular-nums text-foreground">{children}</div>
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </Surface>
  );
}
