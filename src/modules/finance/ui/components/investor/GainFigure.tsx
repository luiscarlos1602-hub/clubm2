import { formatMoney } from "@/shared/lib/format-money";
import { cn } from "@/shared/lib/utils";
import { ProjectionLabel } from "@/shared/ui/brand";
import type { Money } from "@/shared/domain/money";
import { profitRateLabel } from "../../hooks/profit-rate";

const SIZE = { sm: "text-sm", md: "text-lg", lg: "text-2xl" } as const;

export type GainFigureProps = {
  gain: Money;
  /** Capital aportado sobre el que se mide el %. */
  capital: Money;
  /** Misma separación que MoneyDisplay: la ganancia proyectada lleva su rótulo; la realizada, no. */
  kind: "projection" | "realized";
  label: string;
  size?: keyof typeof SIZE;
  className?: string;
  "data-testid"?: string;
};

/** Ganancia con su % sobre el capital (ADR-013), bajo el mismo rótulo. El % lo calcula el motor, no este componente. */
export function GainFigure({ gain, capital, kind, label, size = "md", className, "data-testid": testId = "gain-figure" }: GainFigureProps) {
  const rate = profitRateLabel(gain, capital);
  return (
    <div data-testid={testId} data-kind={kind} className={cn("flex flex-col gap-1", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cn("font-medium tabular-nums text-foreground", SIZE[size])}>{formatMoney(gain)}</span>
        {rate === null ? null : (
          <span className="font-mono text-sm text-muted-foreground" data-testid={`${testId}-porcentaje`}>
            {rate}
          </span>
        )}
      </span>
      {kind === "projection" ? <ProjectionLabel /> : null}
    </div>
  );
}
