import { formatMoney, type MoneyDecimals, type MoneyLike } from "@/shared/lib/format-money";
import { cn } from "@/shared/lib/utils";
import { BRAND_COPY } from "./brand-copy";
import { ProjectionLabel } from "./ProjectionLabel";
import type { TestIdProp } from "./types";

export type MoneyKind = "capital" | "realized" | "projection" | "amount";
export type MoneyDisplayProps = TestIdProp & {
  value: MoneyLike;
  /** Separa capital · realizado · proyección. "amount" = monto neutro sin rótulo propio. */
  kind: MoneyKind;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  decimals?: MoneyDecimals;
};

const SIZE: Record<NonNullable<MoneyDisplayProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
  xl: "font-heading text-4xl md:text-5xl",
};

export function MoneyDisplay({
  value,
  kind,
  label,
  size = "md",
  decimals = "auto",
  className,
  "data-testid": testId = "money-display",
}: MoneyDisplayProps) {
  const visibleLabel = label ?? (kind === "amount" ? undefined : BRAND_COPY.figureLabels[kind]);
  return (
    <div data-testid={testId} data-kind={kind} className={cn("flex flex-col gap-1", className)}>
      {visibleLabel ? <span className="text-sm text-muted-foreground">{visibleLabel}</span> : null}
      <span className={cn("font-medium tabular-nums text-foreground", SIZE[size])}>
        {formatMoney(value, { decimals })}
      </span>
      {kind === "projection" ? <ProjectionLabel /> : null}
    </div>
  );
}
