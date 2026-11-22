import { MoneyDisplay, ProjectionLabel } from "@/shared/ui/brand";
import { Section, Surface } from "@/shared/ui/layout";
import { buildScenarioRows } from "../../hooks/scenarios";
import type { SimulatorBase } from "../../hooks/simulate";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.scenarios;

/** Tres escenarios, siempre rotulados como proyección. Cifras del motor para 1 participación. */
export function ScenariosSection({ base }: { base: SimulatorBase }) {
  const rows = buildScenarioRows(base);
  return (
    <Section tone="light" spacing="md" ruled labelledBy="titulo-escenarios" innerClassName="flex flex-col gap-8" data-testid="seccion-escenarios">
      <div className="flex max-w-[60ch] flex-col gap-3">
        <h2 id="titulo-escenarios" className="font-heading text-3xl font-medium">
          {C.title}
        </h2>
        <p className="text-muted-foreground">{C.description}</p>
      </div>
      <ul className="grid gap-6 lg:grid-cols-3">
        {rows.map((row) => (
          <Surface as="li" key={row.id} data-testid={`escenario-${row.id}`}>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-xl font-medium">{C.names[row.id]}</h3>
              <p className="text-sm text-muted-foreground">{C.rules[row.id]}</p>
            </div>
            <MoneyDisplay value={row.salePrice} kind="projection" label={C.sale} size="md" />
            {row.outcome.kind === "payout" ? (
              <>
                <MoneyDisplay value={row.outcome.payout.capital} kind="capital" label={C.capital} size="md" data-testid={`escenario-${row.id}-capital`} />
                <MoneyDisplay value={row.outcome.payout.gain} kind="projection" label={C.gain} size="md" data-testid={`escenario-${row.id}-ganancia`} />
                <MoneyDisplay value={row.outcome.payout.total} kind="projection" label={C.payout} size="md" />
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground" data-testid={`escenario-${row.id}-capital`}>{C.capitalTbd}</p>
                <ProjectionLabel placement="below">
                  <p className="font-medium" data-testid={`escenario-${row.id}-sin-reparto`}>{C.noDistribution}</p>
                </ProjectionLabel>
              </>
            )}
          </Surface>
        ))}
      </ul>
    </Section>
  );
}
