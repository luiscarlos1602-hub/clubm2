import { compareIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { Project, ProjectTimeline, Property } from "./project";
import type { ProjectStatus } from "./project-status";

type Presence = "absent" | "present";
type ExpectedTimeline = Readonly<Record<keyof ProjectTimeline, Presence>>;

const PRE_ACQUISITION: ExpectedTimeline = {
  acquiredOn: "absent",
  saleSignedOn: "absent",
  settledOn: "absent",
};
const ACQUIRED_UNSOLD: ExpectedTimeline = {
  acquiredOn: "present",
  saleSignedOn: "absent",
  settledOn: "absent",
};

/** Fechas exigidas por estado (plan 002 §3.7). */
const EXPECTED_BY_STATUS: Readonly<Record<ProjectStatus, ExpectedTimeline>> = {
  opportunity: PRE_ACQUISITION,
  due_diligence: PRE_ACQUISITION,
  discarded: PRE_ACQUISITION,
  acquired: ACQUIRED_UNSOLD,
  funding: ACQUIRED_UNSOLD,
  renovation: ACQUIRED_UNSOLD,
  on_sale: ACQUIRED_UNSOLD,
  stalled: ACQUIRED_UNSOLD,
  sold: { acquiredOn: "present", saleSignedOn: "present", settledOn: "absent" },
  settled: { acquiredOn: "present", saleSignedOn: "present", settledOn: "present" },
};

const TIMELINE_FIELDS = ["acquiredOn", "saleSignedOn", "settledOn"] as const;

/** Coherencia estado ↔ fechas y orden acquiredOn ≤ saleSignedOn ≤ settledOn. Lo usa seed-consistency.test.ts (F1-4). */
export function checkProjectConsistency(
  project: Project,
): Result<Project, DomainError<"INCONSISTENT_TIMELINE">> {
  const expected = EXPECTED_BY_STATUS[project.status];
  for (const field of TIMELINE_FIELDS) {
    const presence: Presence = project.timeline[field] === null ? "absent" : "present";
    if (presence !== expected[field]) {
      return err(
        "INCONSISTENT_TIMELINE",
        `${project.status}: ${field} debe estar ${expected[field] === "present" ? "registrada" : "vacía"}`,
      );
    }
  }

  const recorded = TIMELINE_FIELDS.map((field) => project.timeline[field]).filter(
    (date): date is IsoDate => date !== null,
  );
  for (let i = 1; i < recorded.length; i++) {
    if (compareIsoDate(recorded[i - 1], recorded[i]) > 0) {
      return err(
        "INCONSISTENT_TIMELINE",
        `fechas fuera de orden: ${recorded[i - 1]} > ${recorded[i]}`,
      );
    }
  }
  return ok(project);
}

/** Inmueble válido: ciudad y zona con texto, superficie entera > 0. Nunca lanza. */
export function checkProperty(
  property: Property,
): Result<Property, DomainError<"INVALID_PROPERTY">> {
  if (property.city.trim() === "") return err("INVALID_PROPERTY", "la ciudad es obligatoria");
  if (property.zone.trim() === "") return err("INVALID_PROPERTY", "la zona es obligatoria");
  if (!Number.isSafeInteger(property.areaM2) || property.areaM2 <= 0) {
    return err("INVALID_PROPERTY", "la superficie debe ser un entero de m² mayor que 0");
  }
  return ok(property);
}
