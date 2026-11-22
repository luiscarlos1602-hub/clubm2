import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projectHref } from "@/shared/ui/app-shell";
import { MoneyDisplay, ProjectSeal, StatusBadge, type StatusTone } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { HoldingProcess } from "./HoldingProcess";
import { ProfitRateLine } from "./ProfitRateLine";
import { VisitDialog } from "./VisitDialog";
import type { HoldingRow } from "./holding-rows";
import type { HoldingStatus } from "./examples";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY;
const TONE: Record<HoldingStatus, StatusTone> = { settled: "neutral", renovation: "in-progress", funding: "positive" };

/** Una tarjeta por proyecto; capital, ganancia realizada y proyección siempre en bloques separados. */
export function HoldingsList({ rows }: { rows: readonly HoldingRow[] }) {
  return (
    <ul className="grid gap-6 lg:grid-cols-3" data-testid="panel-participaciones">
      {rows.map(({ holding, listing, projection, realizedRate, projectionRate }) => (
        <Surface as="li" key={holding.code} padding="md" data-testid={`panel-participacion-${holding.code.toLowerCase()}`}>
          <div className="flex items-start justify-between gap-4">
            {listing ? <ProjectSeal code={holding.code} date={listing.acquiredOn} size="sm" /> : <span className="font-mono text-sm">{holding.code}</span>}
            <StatusBadge tone={TONE[holding.status]} label={C.status[holding.status]} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-xl leading-tight font-medium">{listing?.name ?? holding.code}</h3>
            {listing ? <p className="text-muted-foreground text-sm">{`${listing.city} · ${listing.zone}`}</p> : null}
            <p className="text-sm font-medium">{C.common.unit(holding.quantity)}</p>
          </div>
          <div className="border-line grid gap-4 border-t pt-4">
            <MoneyDisplay value={holding.capital} kind="capital" size="md" />
            {holding.realized ? (
              <div className="flex flex-col gap-1">
                <MoneyDisplay value={holding.realized} kind="realized" size="md" />
                <ProfitRateLine text={realizedRate} data-testid={`panel-participacion-${holding.code.toLowerCase()}-porcentaje`} />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">{C.holdings.realized}</span>
                <span className="text-muted-foreground text-sm">{C.holdings.noRealized}</span>
              </div>
            )}
            {projection ? (
              <div className="flex flex-col gap-1">
                <MoneyDisplay value={projection} kind="projection" size="sm" data-testid={`panel-participacion-${holding.code.toLowerCase()}-proyeccion`} />
                <ProfitRateLine text={projectionRate} projection data-testid={`panel-participacion-${holding.code.toLowerCase()}-proyeccion-porcentaje`} />
              </div>
            ) : null}
          </div>
          <HoldingProcess code={holding.code} acquiredOn={listing?.acquiredOn ?? null} />
          {listing && holding.status !== "settled" ? <VisitDialog code={holding.code} name={listing.name} /> : null}
          {listing ? (
            <Link
              href={projectHref(listing.slug)}
              aria-label={C.common.seeProject(listing.name)}
              className="mt-auto inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none rounded-sm"
            >
              {C.common.seeProject(listing.name)}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          ) : null}
        </Surface>
      ))}
    </ul>
  );
}
