import type { Money } from "@/shared/domain/money";
import { MoneyDisplay, ProjectionLabel } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import type { ExampleMoney } from "./examples";
import { PANEL_COPY } from "./copy";

export type FigureTriadProps = {
  capital: ExampleMoney;
  realized: ExampleMoney;
  /** null mientras finance calcula o si no hay proyección disponible. */
  projection: Money | null;
  notes: { capital: string; realized: string; projection: string };
  testIdPrefix: string;
};

/** Tres bloques separados y rotulados. La proyección va en un tamaño menor que el capital (docs/06). */
export function FigureTriad({ capital, realized, projection, notes, testIdPrefix }: FigureTriadProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Surface padding="md" data-testid={`${testIdPrefix}-capital`}>
        <MoneyDisplay value={capital} kind="capital" size="xl" data-testid={`${testIdPrefix}-capital-valor`} />
        <p className="text-muted-foreground text-sm">{notes.capital}</p>
      </Surface>
      <Surface padding="md" data-testid={`${testIdPrefix}-realizada`}>
        <MoneyDisplay value={realized} kind="realized" size="lg" data-testid={`${testIdPrefix}-realizada-valor`} />
        <p className="text-muted-foreground text-sm">{notes.realized}</p>
      </Surface>
      <Surface padding="md" data-testid={`${testIdPrefix}-proyeccion`} className="border-dashed">
        {projection ? (
          <MoneyDisplay value={projection} kind="projection" size="lg" data-testid={`${testIdPrefix}-proyeccion-valor`} />
        ) : (
          <div className="flex flex-col gap-1" data-testid={`${testIdPrefix}-proyeccion-valor`}>
            <span className="text-muted-foreground text-sm">{PANEL_COPY.holdings.projection}</span>
            <span className="text-muted-foreground">{PANEL_COPY.summary.projectionPending}</span>
            <ProjectionLabel />
          </div>
        )}
        <p className="text-muted-foreground text-sm">{notes.projection}</p>
      </Surface>
    </div>
  );
}
