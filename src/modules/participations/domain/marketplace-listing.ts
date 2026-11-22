import {
  TARGET_TERM_MONTHS,
  resolveProjectImages,
  toPublicStage,
  type Project,
  type ProjectCode,
  type ProjectId,
  type ProjectImage,
  type Property,
  type PublicStage,
} from "@/modules/projects";
import { compareIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import type { Money } from "@/shared/domain/money";
import type { ParticipationClass } from "./participation";

/**
 * Fase de la tarjeta: etapa pública + estado de la colocación.
 * funding se divide en open (quedan disponibles) y placement_complete (P3-1). settled → finished.
 */
export const LISTING_PHASES = [
  "open",
  "placement_complete",
  "renovation",
  "on_sale",
  "sold",
  "finished",
] as const;
export type ListingPhase = (typeof LISTING_PHASES)[number];

export type ProjectListing = {
  readonly projectId: ProjectId;
  readonly code: ProjectCode;
  readonly slug: string;
  readonly name: string;
  readonly city: string;
  /** Sin dirección exacta (D6). */
  readonly zone: string;
  /** Fecha del sello. */
  readonly acquiredOn: IsoDate;
  readonly stage: PublicStage;
  readonly phase: ListingPhase;
  readonly participations: {
    readonly total: number;
    /** phase === "open" ? total − placed : 0  [SUPUESTO P3-3] */
    readonly available: number;
  };
  /** De la clase; la UI solo lo formatea. */
  readonly unitPrice: Money;
  /** TARGET_TERM_MONTHS si phase ∉ {sold, finished}; null en histórico (CA4). */
  readonly targetTermMonths: number | null;
  /** Solo en finished. */
  readonly settledOn: IsoDate | null;
  /** Guardadas o, si no hay, las SVG de referencia por código (W-2). */
  readonly images: readonly ProjectImage[];
};

export type MarketplaceSource = {
  readonly projects: readonly Project[];
  readonly properties: readonly Property[];
  readonly classes: readonly ParticipationClass[];
  /** Imágenes guardadas de todos los proyectos; sin ellas se usa el respaldo por código. */
  readonly images?: readonly ProjectImage[];
};

const PHASE_RANK: Readonly<Record<ListingPhase, number>> = Object.freeze({
  open: 0,
  placement_complete: 1,
  renovation: 2,
  on_sale: 3,
  sold: 4,
  finished: 5,
});

const HISTORIC_PHASES: ReadonlySet<ListingPhase> = new Set(["sold", "finished"]);

function phaseOf(stage: PublicStage, participationClass: ParticipationClass): ListingPhase {
  switch (stage) {
    case "funding":
      return participationClass.placed < participationClass.total ? "open" : "placement_complete";
    case "settled":
      return "finished";
    default:
      return stage;
  }
}

function toListing(
  project: Project,
  property: Property,
  participationClass: ParticipationClass,
  stage: PublicStage,
  acquiredOn: IsoDate,
  stored: readonly ProjectImage[],
): ProjectListing {
  const phase = phaseOf(stage, participationClass);
  const { total, placed } = participationClass;
  return {
    projectId: project.id,
    code: project.code,
    slug: project.slug,
    name: project.name,
    city: property.city,
    zone: property.zone,
    acquiredOn,
    stage,
    phase,
    participations: { total, available: phase === "open" ? total - placed : 0 },
    unitPrice: participationClass.unitPrice,
    targetTermMonths: HISTORIC_PHASES.has(phase) ? null : TARGET_TERM_MONTHS,
    settledOn: phase === "finished" ? project.timeline.settledOn : null,
    images: resolveProjectImages(project, stored),
  };
}

function compareListings(a: ProjectListing, b: ProjectListing): number {
  const byPhase = PHASE_RANK[a.phase] - PHASE_RANK[b.phase];
  if (byPhase !== 0) return byPhase;
  const byAcquired = compareIsoDate(b.acquiredOn, a.acquiredOn);
  if (byAcquired !== 0) return byAcquired;
  if (a.code === b.code) return 0;
  return a.code < b.code ? -1 : 1;
}

/**
 * Pura, nunca lanza. Omite (sin error) un proyecto no publicable, sin inmueble, sin clase o sin fecha de compra.
 * Con dos clases del mismo proyecto usa la primera. Orden P3-2: fase, compra descendente, código ascendente.
 */
export function buildMarketplaceListing(source: MarketplaceSource): readonly ProjectListing[] {
  const propertyById = new Map(source.properties.map((p) => [p.id, p] as const));
  const classByProject = new Map<ProjectId, ParticipationClass>();
  for (const c of source.classes)
    if (!classByProject.has(c.projectId)) classByProject.set(c.projectId, c);

  const imagesByProject = new Map<ProjectId, ProjectImage[]>();
  for (const image of source.images ?? []) {
    const list = imagesByProject.get(image.projectId) ?? [];
    list.push(image);
    imagesByProject.set(image.projectId, list);
  }

  const listings: ProjectListing[] = [];
  for (const project of source.projects) {
    const stage = toPublicStage(project.status);
    const property = propertyById.get(project.propertyId);
    const participationClass = classByProject.get(project.id);
    const { acquiredOn } = project.timeline;
    if (
      stage === null ||
      property === undefined ||
      participationClass === undefined ||
      acquiredOn === null
    )
      continue;
    listings.push(toListing(project, property, participationClass, stage, acquiredOn, imagesByProject.get(project.id) ?? []));
  }
  return listings.sort(compareListings);
}
