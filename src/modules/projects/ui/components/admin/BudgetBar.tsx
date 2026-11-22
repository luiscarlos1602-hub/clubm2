import { cn } from "@/shared/lib/utils";
import { MoneyDisplay } from "@/shared/ui/brand";
import type { TestIdProp } from "@/shared/ui/brand/types";
import type { Money } from "@/shared/domain/money";

export type BudgetBarProps = TestIdProp & {
  label: string;
  budget: Money;
  spent: Money;
  budgetedLabel: string;
  spentLabel: string;
  overLabel: string;
};

/** Barra de presupuesto frente a gasto. Si el gasto supera el presupuesto, usa Óxido y lo dice con texto. */
export function BudgetBar({ label, budget, spent, budgetedLabel, spentLabel, overLabel, className, "data-testid": testId = "barra-presupuesto" }: BudgetBarProps) {
  const over = spent.cents > budget.cents;
  const ratio = budget.cents === 0 ? 0 : Math.min(100, Math.round((spent.cents * 100) / budget.cents));
  return (
    <div data-testid={testId} data-over={over} className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium text-foreground">{label}</span>
        {over ? <span className="text-xs font-medium text-destructive">{overLabel}</span> : null}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ratio}
        className="h-2.5 w-full overflow-hidden rounded-full bg-line/30"
      >
        <div className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-primary")} style={{ width: `${ratio}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <MoneyDisplay value={budget} kind="amount" label={budgetedLabel} size="sm" />
        <MoneyDisplay value={spent} kind="amount" label={spentLabel} size="sm" />
      </div>
    </div>
  );
}
