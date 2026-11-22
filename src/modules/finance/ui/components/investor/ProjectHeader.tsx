import Link from "next/link";
import { formatIsoDate } from "@/shared/lib/format-date";
import { projectHref } from "@/shared/ui/app-shell";
import { MoneyDisplay, ProjectSeal, ProjectionLabel, StatusBadge, type StatusTone } from "@/shared/ui/brand";
import { PageHeader } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import type { ListingPhase } from "@/modules/participations";
import type { ProjectDetailData } from "../../hooks/use-project-detail";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.header;
const TONE: Record<ListingPhase, StatusTone> = {
  open: "positive",
  placement_complete: "neutral",
  renovation: "in-progress",
  on_sale: "in-progress",
  sold: "neutral",
  finished: "neutral",
};

/** Resumen: sello, etapa pública, zona, disponibles y precio por participación. */
export function ProjectHeader({ data }: { data: ProjectDetailData }) {
  const { listing } = data;
  const isOpen = listing.phase === "open";
  return (
    <PageHeader
      id="titulo-p4"
      eyebrow={C.eyebrow(listing.code)}
      title={listing.name}
      description={C.location(listing.city, listing.zone)}
      data-testid="ficha-resumen"
      aside={
        <div className="flex flex-col gap-5">
          <ProjectSeal code={listing.code} date={listing.acquiredOn} data-testid="ficha-sello" />
          <StatusBadge tone={TONE[listing.phase]} label={PROJECT_DETAIL_COPY.phase[listing.phase]} data-testid="ficha-etapa" />
          <p className="font-medium" data-testid="ficha-disponibles">
            {C.availability(listing.participations.available, listing.participations.total)}
            {isOpen ? "" : ` · ${C.closedNote}`}
          </p>
          <MoneyDisplay value={listing.unitPrice} kind="amount" label={C.unitPrice} size="lg" data-testid="ficha-precio" />
          {listing.targetTermMonths !== null ? (
            <ProjectionLabel>
              <span className="text-sm" data-testid="ficha-plazo">{C.targetTerm(listing.targetTermMonths)}</span>
            </ProjectionLabel>
          ) : null}
          {listing.settledOn ? <p className="font-mono text-sm">{C.settledOn} {formatIsoDate(listing.settledOn, "numeric")}</p> : null}
        </div>
      }
      actions={
        isOpen ? (
          <Button asChild size="lg">
            <Link href={`${projectHref(listing.slug)}/participar`} data-testid="ficha-participar">{C.participate}</Link>
          </Button>
        ) : undefined
      }
    />
  );
}
