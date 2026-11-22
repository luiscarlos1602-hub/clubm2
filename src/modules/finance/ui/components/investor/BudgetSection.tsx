import { MoneyDisplay } from "@/shared/ui/brand";
import { Section, Surface } from "@/shared/ui/layout";
import type { BudgetBreakdown, BudgetLine } from "../../../domain/budget";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.budget;

function Lines({ lines, testId }: { lines: readonly BudgetLine[]; testId: string }) {
  return (
    <ul className="flex flex-col divide-y divide-border" data-testid={testId}>
      {lines.map((line) => (
        <li key={line.item} className="flex items-baseline justify-between gap-4 py-2 text-sm">
          <span>{C.items[line.item]}</span>
          <MoneyDisplay value={line.amount} kind="amount" size="sm" />
        </li>
      ))}
    </ul>
  );
}

/** Presupuesto desglosado (D7): compra, reforma por rubros, honorarios y costos de venta. Cifras de ejemplo. */
export function BudgetSection({ budget }: { budget: BudgetBreakdown }) {
  return (
    <Section tone="paper" spacing="md" ruled labelledBy="titulo-presupuesto" innerClassName="flex flex-col gap-8" data-testid="seccion-presupuesto">
      <div className="flex max-w-[60ch] flex-col gap-3">
        <h2 id="titulo-presupuesto" className="font-heading text-3xl font-medium">
          {C.title}
        </h2>
        <p className="text-muted-foreground">{C.description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium">{C.acquisition}</h3>
            <MoneyDisplay value={budget.acquisition} kind="amount" size="md" data-testid="presupuesto-compra" />
          </div>
          <p className="text-sm text-muted-foreground">{C.note}</p>
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-5">
            <h3 className="font-medium">{C.saleCosts}</h3>
            <MoneyDisplay value={budget.saleCosts} kind="amount" size="md" data-testid="presupuesto-costos-venta" />
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-5">
            <h3 className="font-heading text-lg font-medium">{C.total}</h3>
            <MoneyDisplay value={budget.total} kind="amount" size="md" data-testid="presupuesto-total" />
          </div>
        </Surface>
        <Surface>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium">{C.recovery}</h3>
            <MoneyDisplay value={budget.recovery} kind="amount" size="md" data-testid="presupuesto-reforma" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">{C.works}</p>
            <Lines lines={budget.works} testId="presupuesto-obra" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">{C.fees}</p>
            <Lines lines={budget.fees} testId="presupuesto-honorarios" />
          </div>
        </Surface>
      </div>
    </Section>
  );
}
