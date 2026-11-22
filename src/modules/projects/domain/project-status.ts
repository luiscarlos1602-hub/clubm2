import { compareIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { Project, ProjectTimeline } from "./project";

export const PROJECT_STATUSES = [
  "opportunity",
  "due_diligence",
  "acquired",
  "funding",
  "renovation",
  "on_sale",
  "sold",
  "settled",
  "discarded",
  "stalled",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/**
 * W2-1 (22-nov): etapas en las que el backoffice da de alta un inmueble. No exigen obra, venta ni liquidación;
 * "publicar" = crear en `funding`. Las demás etapas se alcanzan con transiciones (W-3).
 */
export const CREATABLE_STATUSES = ["opportunity", "due_diligence", "acquired", "funding"] as const;
export type CreatableStatus = (typeof CREATABLE_STATUSES)[number];

/** Tabla única de transiciones (docs/02 §2, plan 002 §3.9). stalled → on_sale | sold: [SUPUESTO L3]. */
export const PROJECT_TRANSITIONS: Readonly<Record<ProjectStatus, readonly ProjectStatus[]>> =
  Object.freeze({
    opportunity: Object.freeze(["due_diligence"] as const),
    due_diligence: Object.freeze(["acquired", "discarded"] as const),
    acquired: Object.freeze(["funding"] as const),
    funding: Object.freeze(["renovation"] as const),
    renovation: Object.freeze(["on_sale"] as const),
    on_sale: Object.freeze(["sold", "stalled"] as const),
    stalled: Object.freeze(["on_sale", "sold"] as const),
    sold: Object.freeze(["settled"] as const),
    settled: Object.freeze([] as const),
    discarded: Object.freeze([] as const),
  });

/** W-3: etapas que fija W-5 al registrar la venta y la liquidación (llevan precio y Settlement). */
export const SETTLEMENT_STAGES = ["sold", "settled"] as const;

/** W-3: siguientes etapas que el backoffice cambia con un clic (PROJECT_TRANSITIONS sin las de W-5). */
export function manualNextStages(from: ProjectStatus): readonly ProjectStatus[] {
  return PROJECT_TRANSITIONS[from].filter(
    (to) => !(SETTLEMENT_STAGES as readonly ProjectStatus[]).includes(to),
  );
}

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return PROJECT_TRANSITIONS[from].includes(to);
}

export function transitionStatus(
  from: ProjectStatus,
  to: ProjectStatus,
): Result<ProjectStatus, DomainError<"INVALID_TRANSITION">> {
  return canTransition(from, to) ? ok(to) : err("INVALID_TRANSITION", `${from} → ${to}`);
}

export function isTerminalStatus(s: ProjectStatus): boolean {
  return PROJECT_TRANSITIONS[s].length === 0;
}

/** Fecha del timeline que sella cada estado destino. */
const STAMPED_FIELD: Partial<Record<ProjectStatus, keyof ProjectTimeline>> = {
  acquired: "acquiredOn",
  sold: "saleSignedOn",
  settled: "settledOn",
};

function latestRecordedDate(timeline: ProjectTimeline): IsoDate | null {
  const recorded = [timeline.acquiredOn, timeline.saleSignedOn, timeline.settledOn].filter(
    (date): date is IsoDate => date !== null,
  );
  return recorded.reduce<IsoDate | null>(
    (latest, date) => (latest === null || compareIsoDate(date, latest) > 0 ? date : latest),
    null,
  );
}

/** Cambia el estado y sella la fecha cuando corresponde: → acquired fija acquiredOn, → sold saleSignedOn, → settled settledOn. */
export function changeProjectStatus(
  project: Project,
  to: ProjectStatus,
  effectiveOn: IsoDate,
): Result<Project, DomainError<"INVALID_TRANSITION" | "DATE_OUT_OF_ORDER">> {
  const transition = transitionStatus(project.status, to);
  if (!transition.ok) return transition;

  const latest = latestRecordedDate(project.timeline);
  if (latest !== null && compareIsoDate(effectiveOn, latest) < 0) {
    return err("DATE_OUT_OF_ORDER", `${effectiveOn} es anterior a ${latest}`);
  }

  const field = STAMPED_FIELD[to];
  const timeline =
    field === undefined ? project.timeline : { ...project.timeline, [field]: effectiveOn };
  return ok({ ...project, status: transition.value, timeline });
}
