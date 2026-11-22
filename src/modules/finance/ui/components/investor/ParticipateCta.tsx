import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projectHref, routeHref } from "@/shared/ui/app-shell";
import { LegalNotice } from "@/shared/ui/brand";
import { Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import type { ProjectListing } from "@/modules/participations";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.cta;

/** Cierre de la ficha: Participar (si hay colocación abierta) con el aviso de riesgo cerca. */
export function ParticipateCta({ listing }: { listing: ProjectListing }) {
  const isOpen = listing.phase === "open";
  return (
    <Section tone="paper" spacing="md" ruled labelledBy="titulo-cta" innerClassName="flex flex-col items-start gap-5" data-testid="seccion-participar">
      <h2 id="titulo-cta" className="font-heading text-3xl font-medium">
        {C.title}
      </h2>
      <p className="max-w-[60ch] text-muted-foreground">{isOpen ? C.openDescription : C.closedDescription}</p>
      <LegalNotice notice="riskNotice" />
      {isOpen ? (
        <Button asChild size="lg">
          <Link href={`${projectHref(listing.slug)}/participar`} data-testid="ficha-participar-final">
            {C.action}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link href={routeHref("p3")} data-testid="ficha-ver-proyectos">{PROJECT_DETAIL_COPY.header.backToProjects}</Link>
        </Button>
      )}
    </Section>
  );
}
