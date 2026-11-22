"use client";

import { LegalNotice } from "@/shared/ui/brand";
import { Eyebrow, PageHeader, Section } from "@/shared/ui/layout";
import { EXAMPLE_SETTLEMENT, EXAMPLE_TOTALS } from "./examples";
import { FigureTriad } from "./FigureTriad";
import { joinHoldings } from "./holding-rows";
import { PanelError, PanelLoading } from "./PanelStates";
import { PortfolioTable } from "./PortfolioTable";
import { SettlementHistory } from "./SettlementHistory";
import { PANEL_COPY } from "./copy";
import { usePanelListings } from "./use-panel-listings";
import { usePanelProjections } from "./use-panel-projections";

const C = PANEL_COPY.portfolio;

/** P6 · Portafolio: totales separados, tabla por proyecto e histórico de la liquidación de M2-003. */
export function PortfolioScreen() {
  const query = usePanelListings();
  const projections = usePanelProjections();
  const rows = query.data ? joinHoldings(query.data, projections.data?.byCode) : null;
  return (
    <div data-testid="pagina-p6" data-route-id="p6" className="flex flex-col">
      <PageHeader id="titulo-p6" eyebrow={C.eyebrow} title={C.title} description={C.description} />
      <Section tone="light" spacing="md" label={C.columnsLabel} innerClassName="flex flex-col gap-6">
        <FigureTriad
          {...EXAMPLE_TOTALS}
          projection={projections.data?.total ?? null}
          notes={{ capital: C.capitalNote, realized: C.realizedNote, projection: C.projectionNote }}
          testIdPrefix="portafolio-total"
        />
        <LegalNotice notice="riskNotice" />
      </Section>
      <Section tone="sand" spacing="md" labelledBy="portafolio-tabla-titulo" innerClassName="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>{C.tableEyebrow}</Eyebrow>
          <h2 id="portafolio-tabla-titulo" className="font-heading text-2xl font-medium md:text-3xl">{C.tableTitle}</h2>
        </div>
        {query.isPending ? <PanelLoading testId="portafolio-cargando" /> : null}
        {query.isError ? <PanelError testId="portafolio-error" onRetry={() => void query.refetch()} /> : null}
        {rows ? <PortfolioTable rows={rows} /> : null}
      </Section>
      <Section tone="light" spacing="md" labelledBy="portafolio-historico-titulo" innerClassName="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Eyebrow>{C.historyEyebrow}</Eyebrow>
          <h2 id="portafolio-historico-titulo" className="font-heading text-2xl font-medium md:text-3xl">{C.historyTitle(EXAMPLE_SETTLEMENT.code)}</h2>
          <p className="text-muted-foreground max-w-[60ch]">{C.historyDescription}</p>
        </div>
        <SettlementHistory listing={rows?.find((r) => r.holding.status === "settled")?.listing ?? null} />
      </Section>
    </div>
  );
}
