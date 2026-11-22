import { formatIsoDate } from "@/shared/lib/format-date";
import { formatMoney } from "@/shared/lib/format-money";
import type { ProjectListing } from "@/modules/participations";
import { MoneyDisplay } from "@/shared/ui/brand";
import { IndexLabel, Surface } from "@/shared/ui/layout";
import { EXAMPLE_SETTLEMENT } from "./examples";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY.portfolio;

/** Histórico de M2-003: pasos y cifras ya realizadas (capital y ganancia en bloques separados). */
export function SettlementHistory({ listing }: { listing: ProjectListing | null }) {
  return (
    <div className="grid gap-10 lg:grid-cols-2" data-testid="portafolio-historico">
      <ol className="flex flex-col gap-6">
        {C.steps({ quantity: EXAMPLE_SETTLEMENT.quantity, unitPrice: listing ? formatMoney(listing.unitPrice) : null }).map((step, i) => (
          <li key={step.title} className="border-line flex gap-4 border-t pt-5">
            <IndexLabel n={i + 1} />
            <div className="flex flex-col gap-1">
              <p className="font-heading text-lg font-semibold">{step.title}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
              {i === 2 && listing?.settledOn ? (
                <p className="font-mono text-xs">{C.settledOn(formatIsoDate(listing.settledOn, "numeric"))}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <Surface padding="lg" data-testid="portafolio-historico-cifras">
        <MoneyDisplay value={EXAMPLE_SETTLEMENT.capital} kind="capital" label={C.capitalReturned} size="lg" />
        <MoneyDisplay value={EXAMPLE_SETTLEMENT.realized} kind="realized" size="lg" />
      </Surface>
    </div>
  );
}
