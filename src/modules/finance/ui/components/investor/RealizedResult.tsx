import { formatIsoDate } from "@/shared/lib/format-date";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Section, Surface } from "@/shared/ui/layout";
import type { HolderPayout } from "../../../domain/holder-payout";
import type { Settlement } from "../../../domain/settlement";
import { PROJECT_DETAIL_COPY } from "./copy";
import { GainFigure } from "./GainFigure";

const C = PROJECT_DETAIL_COPY.realized;

/** Proyecto finalizado: resultado realizado (liquidación sembrada), sin simulador. Capital y ganancia separados. */
export function RealizedResult({ realized, settlement }: { realized: HolderPayout; settlement: Settlement }) {
  const { distribution: d, input } = settlement;
  return (
    <Section tone="sand" spacing="md" ruled labelledBy="titulo-realizado" innerClassName="flex flex-col gap-8" data-testid="seccion-resultado-realizado">
      <div className="flex max-w-[60ch] flex-col gap-3">
        <h2 id="titulo-realizado" className="font-heading text-3xl font-medium">
          {C.title}
        </h2>
        <p className="text-muted-foreground">{C.description}</p>
        <p className="font-mono text-sm text-muted-foreground">{formatIsoDate(settlement.settledOn, "short")}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <MoneyDisplay value={realized.capital} kind="capital" label={C.capitalPerPart} size="lg" data-testid="realizado-capital" />
          <p className="text-sm text-muted-foreground">{C.note}</p>
        </Surface>
        <Surface>
          <GainFigure gain={realized.gain} capital={realized.capital} kind="realized" label={C.gainPerPart} size="md" data-testid="realizado-ganancia" />
          <dl className="grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">{C.salePrice}</dt>
              <dd><MoneyDisplay value={input.salePrice} kind="amount" size="sm" /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{C.surplus}</dt>
              <dd><MoneyDisplay value={d.surplus} kind="amount" size="sm" /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{C.fund}</dt>
              <dd><MoneyDisplay value={d.fund} kind="amount" size="sm" /></dd>
            </div>
          </dl>
        </Surface>
      </div>
      <p className="text-sm text-muted-foreground" data-testid="realizado-sin-simulador">{C.noSimulator}</p>
    </Section>
  );
}
