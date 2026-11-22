import { MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { BudgetBar } from "./BudgetBar";
import { WORKS_COPY } from "./copy";
import { BUDGET_LINES, SPENT_BY_PROFILE, type BudgetLineKey, type WorksProfile } from "./examples";
import { TOTAL_BUDGET, TOTAL_SPENT_BY_PROFILE, REMAINING_BY_PROFILE } from "./works-totals";

const C = WORKS_COPY.budget;
const KEYS = Object.keys(BUDGET_LINES) as BudgetLineKey[];

/** Presupuesto frente a gasto por línea, con totales literales del ejemplo. */
export function ProjectBudgetPanel({ profile }: { profile: WorksProfile }) {
  const spent = SPENT_BY_PROFILE[profile];
  return (
    <Surface data-testid="obra-presupuesto">
      <div className="grid gap-3 sm:grid-cols-3">
        <MoneyDisplay value={TOTAL_BUDGET} kind="amount" label={C.budgeted} size="lg" data-testid="obra-total-presupuestado" />
        <MoneyDisplay value={TOTAL_SPENT_BY_PROFILE[profile]} kind="amount" label={C.spent} size="lg" data-testid="obra-total-gastado" />
        <MoneyDisplay value={REMAINING_BY_PROFILE[profile]} kind="amount" label={C.remaining} size="lg" data-testid="obra-total-remanente" />
      </div>
      <div className="flex flex-col gap-6 border-t border-border pt-6">
        {KEYS.map((key) => (
          <BudgetBar
            key={key}
            label={C.lines[key]}
            budget={BUDGET_LINES[key]}
            spent={spent[key]}
            budgetedLabel={C.budgeted}
            spentLabel={C.spent}
            overLabel={C.over}
            data-testid={`obra-linea-${key}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{C.note}</p>
    </Surface>
  );
}
