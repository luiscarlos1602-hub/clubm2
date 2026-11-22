import { LegalNotice, MoneyDisplay, ProjectionLabel } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import type { SimulatorResult } from "../../hooks/simulate";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.simulator;

/** Tres bloques separados: capital aportado · ganancia proyectada · cobro proyectado. El capital manda en jerarquía. */
export function SimulatorResultPanel({ result, requestedHeld }: { result: SimulatorResult; requestedHeld: number }) {
  const { outcome } = result;
  return (
    <Surface variant="dark" padding="lg" className="gap-6" data-testid="simulador-resultado">
      <h3 className="font-heading text-xl font-medium">{C.resultTitle}</h3>
      <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-6" data-testid="simulador-resultado-vivo">
        {outcome.kind === "payout" ? (
          <>
            <MoneyDisplay value={outcome.payout.capital} kind="capital" label={C.capital} size="lg" data-testid="simulador-capital" />
            <MoneyDisplay value={outcome.payout.gain} kind="projection" label={C.gain} size="md" data-testid="simulador-ganancia" />
            <MoneyDisplay value={outcome.payout.total} kind="projection" label={C.payout} size="md" data-testid="simulador-cobro" />
            <dl className="grid gap-3 border-t border-line/40 pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">{C.surplus}</dt>
                <dd data-testid="simulador-excedente"><MoneyDisplay value={outcome.distribution.surplus} kind="amount" size="sm" /></dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{C.fund}</dt>
                <dd><MoneyDisplay value={outcome.distribution.fund} kind="amount" size="sm" /></dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{C.perParticipation}</dt>
                <dd data-testid="simulador-por-participacion"><MoneyDisplay value={outcome.distribution.perParticipation} kind="amount" size="sm" /></dd>
              </div>
            </dl>
            <ProjectionLabel placement="inline">
              <span className="text-sm" data-testid="simulador-plazo">{C.term(result.termMonths)}</span>
            </ProjectionLabel>
            {result.heldUsed < requestedHeld ? <p className="text-sm">{C.heldAdjusted(result.heldUsed)}</p> : null}
          </>
        ) : null}
        {outcome.kind === "no_distribution" ? (
          <div className="flex flex-col gap-3" data-testid="simulador-sin-reparto">
            <p className="font-heading text-2xl font-medium">{C.noDistribution}</p>
            <p>{C.noDistributionDescription}</p>
            <div className="flex flex-col gap-1" data-testid="simulador-capital">
              <span className="text-sm text-muted-foreground">{C.capital}</span>
              <span className="text-2xl font-medium">{C.capitalPending}</span>
              <span className="text-sm">{C.capitalPendingNote}</span>
            </div>
          </div>
        ) : null}
        {outcome.kind === "no_placement" ? (
          <div className="flex flex-col gap-2" data-testid="simulador-sin-colocacion">
            <p className="font-heading text-2xl font-medium">{C.noPlacement}</p>
            <p>{C.noPlacementDescription}</p>
          </div>
        ) : null}
        {outcome.kind === "invalid" ? <p data-testid="simulador-invalido">{C.invalid}</p> : null}
        {outcome.kind !== "payout" && outcome.kind !== "invalid" ? (
          <ProjectionLabel placement="inline">
            <span className="text-sm">{C.term(result.termMonths)}</span>
          </ProjectionLabel>
        ) : null}
      </div>
      <LegalNotice notice="simulatorDisclaimer" data-testid="simulador-descargo" className="text-foreground" />
    </Surface>
  );
}
