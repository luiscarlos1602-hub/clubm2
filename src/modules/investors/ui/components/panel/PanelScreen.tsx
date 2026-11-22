"use client";

import Link from "next/link";
import { LegalNotice } from "@/shared/ui/brand";
import { routeHref } from "@/shared/ui/app-shell";
import { PageHeader, Section, Eyebrow } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { EXAMPLE_PROFILE, EXAMPLE_TOTALS } from "./examples";
import { FigureTriad } from "./FigureTriad";
import { HoldingsList } from "./HoldingsList";
import { joinHoldings } from "./holding-rows";
import { MilestonesList, NewsList } from "./NewsAndMilestones";
import { OpenProjects } from "./OpenProjects";
import { PanelError, PanelLoading } from "./PanelStates";
import { PANEL_COPY } from "./copy";
import { usePanelListings } from "./use-panel-listings";
import { usePanelProjections } from "./use-panel-projections";

const C = PANEL_COPY;

/** Panel del inversionista (maqueta): resumen, participaciones, novedades, hitos y proyectos abiertos. */
export function PanelScreen() {
  const query = usePanelListings();
  const projections = usePanelProjections();
  return (
    <div data-testid="pagina-panel" data-route-id="panel" className="flex flex-col">
      <PageHeader
        id="titulo-panel"
        eyebrow={C.home.eyebrow}
        title={C.home.greeting(EXAMPLE_PROFILE.firstName)}
        description={C.home.description}
        actions={
          <>
            <Button asChild>
              <Link href={routeHref("p6")}>{C.home.toPortfolio}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routeHref("p3")}>{C.home.toProjects}</Link>
            </Button>
          </>
        }
      />
      <Section tone="light" spacing="md" labelledBy="panel-resumen-titulo" innerClassName="flex flex-col gap-6">
        <h2 id="panel-resumen-titulo" className="font-heading text-2xl font-medium md:text-3xl">
          {C.summary.title}
        </h2>
        <FigureTriad
          {...EXAMPLE_TOTALS}
          projection={projections.data?.total ?? null}
          notes={{ capital: C.summary.capitalNote, realized: C.summary.realizedNote, projection: C.summary.projectionNote }}
          testIdPrefix="panel-resumen"
        />
        <LegalNotice notice="riskNotice" />
      </Section>
      <Section tone="sand" spacing="md" labelledBy="panel-part-titulo" innerClassName="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Eyebrow>{C.holdings.eyebrow}</Eyebrow>
          <h2 id="panel-part-titulo" className="font-heading text-2xl font-medium md:text-3xl">
            {C.holdings.title}
          </h2>
          <p className="text-muted-foreground max-w-[60ch]">{C.holdings.description}</p>
        </div>
        {query.isPending ? <PanelLoading testId="panel-cargando" /> : null}
        {query.isError ? <PanelError testId="panel-error" onRetry={() => void query.refetch()} /> : null}
        {query.data ? <HoldingsList rows={joinHoldings(query.data, projections.data?.byCode)} /> : null}
      </Section>
      <Section tone="light" spacing="md" labelledBy="panel-novedades-titulo" innerClassName="grid gap-12 lg:grid-cols-2">
        <NewsList />
        <MilestonesList />
      </Section>
      <Section tone="dark" spacing="md" labelledBy="panel-abiertos-titulo" innerClassName="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Eyebrow>{C.open.eyebrow}</Eyebrow>
          <h2 id="panel-abiertos-titulo" className="font-heading text-2xl font-medium md:text-3xl">
            {C.open.title}
          </h2>
        </div>
        {query.isPending ? <PanelLoading testId="panel-abiertos-cargando" /> : null}
        {query.data ? <OpenProjects listings={query.data} /> : null}
      </Section>
    </div>
  );
}
