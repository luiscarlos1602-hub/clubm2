import type { ParticipationClass } from "@/modules/participations"; // SOLO import type (D2)
import {
  CREATABLE_STATUSES,
  PROJECT_RISK_KINDS,
  checkProjectConsistency,
  isPublishedStatus,
  type Project,
  type ProjectImageKind,
  type ProjectRiskKind,
  type ProjectStatus,
} from "@/modules/projects";
import { compareIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { MAX_MONEY_CENTS, equalsMoney, multiplyMoney, type Money } from "@/shared/domain/money";
import type {
  ProjectSheetErrorCode,
  ProjectSheetField,
  ProjectSheetInput,
  ProjectSheetIssue,
} from "./project-sheet";

/**
 * Reglas de la ficha decididas por el usuario (docs/08): S4 obligatorios, S5 F = total × precio,
 * W2-1 etapas creables, W2-2 clase bloqueada por colocaciones, W2-3 ficha bloqueada. Puras; nunca lanzan.
 */

/** Los 3 riesgos comunes a todo proyecto (maestro §15): los primeros de PROJECT_RISK_KINDS. */
export const COMMON_RISK_KINDS: readonly ProjectRiskKind[] = PROJECT_RISK_KINDS.slice(0, 3);
/** S4: para publicar hacen falta las imágenes "antes" y "proyección". */
export const PUBLISH_REQUIRED_IMAGE_KINDS: readonly ProjectImageKind[] = ["before", "projection"];
/** S4: descripción + 1–5 destacados. */
export const MAX_HIGHLIGHTS = 5;
/** W2-3: su resultado se fija en W-5; aquí se abren en solo lectura. */
export const LOCKED_SHEET_STATUSES: readonly ProjectStatus[] = ["sold", "settled"];

type Issue = ProjectSheetIssue | null;
type Code = ProjectSheetErrorCode;
const issue = (code: Code, field: ProjectSheetField, detail: string): ProjectSheetIssue => ({
  code,
  field,
  detail,
});

/** S5: F esperado = total × precio. null si total no es entero ≥ 1, el precio no es > 0 o el producto supera MAX_MONEY_CENTS. */
export function expectedRecoveryBudget(total: number, unitPrice: Money): Money | null {
  if (!Number.isSafeInteger(total) || total < 1) return null;
  if (!Number.isSafeInteger(unitPrice.cents) || unitPrice.cents <= 0) return null;
  if (unitPrice.cents > Math.floor(MAX_MONEY_CENTS / total)) return null;
  return multiplyMoney(unitPrice, total);
}

/** S5 · F (economics.recoveryBudget) ≠ total × precio → RECOVERY_BUDGET_MISMATCH. */
export function checkRecoveryBudget(
  cls: Pick<ParticipationClass, "total" | "unitPrice">,
  recoveryBudget: Money,
): Issue {
  const expected = expectedRecoveryBudget(cls.total, cls.unitPrice);
  return expected !== null && equalsMoney(expected, recoveryBudget)
    ? null
    : issue("RECOVERY_BUDGET_MISMATCH", "economics.recoveryBudget", "F ≠ total × precio");
}

/** W2-3 · sold / settled → SHEET_LOCKED. */
export function checkSheetLocked(existingStatus: ProjectStatus | null): Issue {
  return existingStatus !== null && LOCKED_SHEET_STATUSES.includes(existingStatus)
    ? issue("SHEET_LOCKED", "project.status", "un proyecto vendido o liquidado no se edita aquí")
    : null;
}

/** Alta: W2-1 (STATUS_NOT_CREATABLE). Edición: la etapa no cambia aquí, la cambia W-3 (STATUS_CHANGE_NOT_ALLOWED). */
export function checkSheetStatus(
  requested: ProjectStatus,
  existingStatus: ProjectStatus | null,
): Issue {
  if (existingStatus !== null) {
    return requested === existingStatus
      ? null
      : issue("STATUS_CHANGE_NOT_ALLOWED", "project.status", "la etapa se cambia en W-3");
  }
  return (CREATABLE_STATUSES as readonly ProjectStatus[]).includes(requested)
    ? null
    : issue("STATUS_NOT_CREATABLE", "project.status", `no se crea un inmueble en ${requested}`);
}

/** W2-2 · con colocadas > 0 no cambian total ni precio, ni se quita la clase. */
export function checkClassLock(
  previous: ParticipationClass | null,
  next: ProjectSheetInput["participationClass"],
): Issue {
  if (previous === null || previous.placed === 0) return null;
  const same =
    next !== null &&
    next.total === previous.total &&
    equalsMoney(next.unitPrice, previous.unitPrice);
  return same
    ? null
    : issue("CLASS_LOCKED_BY_PLACEMENTS", "participationClass", "hay participaciones colocadas");
}

/** S4 · descripción con texto y 1–5 destacados con texto (ya recortados). */
export function checkProfileText(description: string, highlights: readonly string[]): Issue {
  const valid =
    description !== "" &&
    highlights.length >= 1 &&
    highlights.length <= MAX_HIGHLIGHTS &&
    highlights.every((h) => h !== "");
  return valid
    ? null
    : issue("INVALID_PROFILE", "profile", `descripción y 1–${MAX_HIGHLIGHTS} destacados con texto`);
}

/** Una imagen por tipo, cada una con su ruta. */
export function checkImageChoices(images: ProjectSheetInput["images"]): Issue {
  const kinds = new Set(images.map((i) => i.kind));
  return kinds.size === images.length && images.every((i) => i.url.trim() !== "")
    ? null
    : issue("INVALID_IMAGES", "images", "una imagen por tipo, cada una con su ruta");
}

type PublishCheck = {
  readonly code: ProjectSheetErrorCode;
  readonly field: ProjectSheetField;
  readonly met: (input: ProjectSheetInput) => boolean;
  readonly detail: string;
};

/** S4 "para publicar", en el orden del asistente. Comprueba presencia, no validez (eso lo hace buildProjectSheet). */
const PUBLISH_CHECKS: readonly PublishCheck[] = [
  {
    code: "REQUIRED_FOR_PUBLISHED",
    field: "project.acquiredOn",
    met: (i) => i.project.acquiredOn !== null,
    detail: "falta la fecha de compra",
  },
  {
    code: "REQUIRED_FOR_PUBLISHED",
    field: "profile",
    met: (i) => i.profile !== null,
    detail: "faltan la descripción y 1–5 destacados",
  },
  {
    code: "REQUIRED_FOR_PUBLISHED",
    field: "processSteps",
    met: (i) => i.processSteps !== null,
    detail: "falta el proceso de 6 etapas",
  },
  {
    code: "REQUIRED_FOR_PUBLISHED",
    field: "participationClass",
    met: (i) => i.participationClass !== null,
    detail: "falta la clase de participación",
  },
  {
    code: "MISSING_COMMON_RISKS",
    field: "riskKinds",
    met: (i) => COMMON_RISK_KINDS.every((k) => i.riskKinds.includes(k)),
    detail: "faltan riesgos comunes",
  },
  {
    code: "MISSING_REQUIRED_IMAGES",
    field: "images",
    met: (i) => PUBLISH_REQUIRED_IMAGE_KINDS.every((k) => i.images.some((img) => img.kind === k)),
    detail: "faltan las imágenes de antes y de proyección",
  },
];

/** S4 "para publicar": se exige solo si `isPublishedStatus(status)`. Devuelve todos los issues. */
export function checkPublishRequirements(
  input: ProjectSheetInput,
  status: ProjectStatus,
): readonly ProjectSheetIssue[] {
  if (!isPublishedStatus(status)) return [];
  return PUBLISH_CHECKS.filter((c) => !c.met(input)).map((c) =>
    issue(c.code, c.field, `para publicar: ${c.detail}`),
  );
}

/**
 * Fecha de compra: coherente con la etapa (checkProjectConsistency; si falta en una etapa publicable lo reporta
 * checkPublishRequirements) y no posterior a hoy.
 */
export function checkAcquisition(project: Project, today: IsoDate): readonly ProjectSheetIssue[] {
  const { acquiredOn } = project.timeline;
  const issues: ProjectSheetIssue[] = [];
  if (!(acquiredOn === null && isPublishedStatus(project.status))) {
    const consistent = checkProjectConsistency(project);
    if (!consistent.ok) issues.push({ ...consistent.error, field: "project.acquiredOn" });
  }
  if (acquiredOn !== null && compareIsoDate(acquiredOn, today) > 0) {
    issues.push(
      issue(
        "ACQUIRED_IN_FUTURE",
        "project.acquiredOn",
        "la fecha de compra no puede ser posterior a hoy",
      ),
    );
  }
  return issues;
}
