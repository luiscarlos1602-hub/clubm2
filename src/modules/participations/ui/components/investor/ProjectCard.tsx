import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { formatIsoDate } from "@/shared/lib/format-date";
import { projectHref } from "@/shared/ui/app-shell";
import {
  BrandSymbol,
  MoneyDisplay,
  ProjectImage,
  type ProjectImageVariant,
  ProjectSeal,
  ProjectionLabel,
  StatusBadge,
} from "@/shared/ui/brand";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { Surface } from "@/shared/ui/layout";
import type { ProjectListing } from "../../../domain/marketplace-listing";
import { MARKETPLACE_COPY } from "../../copy";
import { PHASE_PRESENTATION } from "./phase-presentation";

const C = MARKETPLACE_COPY.card;

/** Después si la obra terminó; proyección mientras no (ADR-013). */
const IMAGE_VARIANT: Record<ProjectListing["phase"], ProjectImageVariant> = {
  open: "proyeccion",
  placement_complete: "proyeccion",
  renovation: "proyeccion",
  on_sale: "despues",
  sold: "despues",
  finished: "despues",
};

export type ProjectCardProps = TestIdProp & { listing: ProjectListing };

/** Tarjeta de un proyecto: solo presenta lo que entrega la vista; no calcula nada. */
export function ProjectCard({
  listing,
  className,
  "data-testid": testId = "tarjeta-proyecto",
}: ProjectCardProps) {
  const { phase } = listing;
  const presentation = PHASE_PRESENTATION[phase];
  const isOpen = phase === "open";
  const isHistoric = phase === "sold" || phase === "finished";
  return (
    <article
      data-testid={testId}
      data-project-code={listing.code}
      data-phase={phase}
      className={cn(
        "focus-within:ring-ring relative h-full rounded-2xl focus-within:ring-2",
        className,
      )}
    >
      <Surface padding="md" className="h-full overflow-hidden">
        <ProjectImage
          code={listing.code}
          variant={IMAGE_VARIANT[phase]}
          alt={C.imageAlt(listing.name, IMAGE_VARIANT[phase])}
          className="-mx-6 -mt-6 w-[calc(100%+3rem)] md:-mx-7 md:-mt-7 md:w-[calc(100%+3.5rem)]"
          data-testid="tarjeta-imagen"
        />
        {IMAGE_VARIANT[phase] === "proyeccion" ? <ProjectionLabel data-testid="tarjeta-imagen-proyeccion" /> : null}
        <div className="flex items-start justify-between gap-4">
          <ProjectSeal
            code={listing.code}
            date={listing.acquiredOn}
            size="sm"
            data-testid="tarjeta-sello"
          />
          <BrandSymbol className="text-line size-12" />
        </div>
        <StatusBadge
          tone={presentation.tone}
          label={presentation.label}
          data-testid="tarjeta-etapa"
        />
        <div className="flex flex-col gap-1">
          <h3
            data-testid="tarjeta-nombre"
            className="font-heading text-2xl leading-tight font-medium text-balance"
          >
            <Link
              href={projectHref(listing.slug)}
              aria-label={C.cta(listing.name)}
              data-testid="tarjeta-enlace"
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {listing.name}
            </Link>
          </h3>
          <p data-testid="tarjeta-ubicacion" className="text-muted-foreground text-sm">
            {C.location(listing.city, listing.zone)}
          </p>
        </div>
        <p data-testid="tarjeta-disponibles" className="text-sm font-medium">
          {C.availability(listing.participations.available, listing.participations.total)}
          {isOpen ? "" : ` · ${C.closedNote}`}
        </p>
        <div
          data-testid="tarjeta-precio"
          className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 text-sm"
        >
          <span>{isOpen ? C.priceLeadOpen : C.priceLeadClosed}</span>
          <MoneyDisplay value={listing.unitPrice} kind="amount" size="md" />
          {isOpen ? <span>{C.priceSuffix}</span> : null}
        </div>
        {listing.targetTermMonths !== null ? (
          <span data-testid="tarjeta-plazo-proyeccion" className="flex">
            <ProjectionLabel>
              <span data-testid="tarjeta-plazo" className="text-sm">
                {C.targetTerm(listing.targetTermMonths)}
              </span>
            </ProjectionLabel>
          </span>
        ) : null}
        {isHistoric ? (
          <p data-testid="tarjeta-historico" className="text-muted-foreground text-sm">
            {C.historic[phase]}
            {listing.settledOn
              ? ` · ${C.settledOn} ${formatIsoDate(listing.settledOn, "numeric")}`
              : ""}
          </p>
        ) : null}
      </Surface>
    </article>
  );
}
