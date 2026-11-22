import type { ParticipationClass, ParticipationClassId } from "@/modules/participations"; // SOLO import type (D2)
import type {
  ProcessErrorCode,
  Project,
  ProjectCode,
  ProjectId,
  ProjectImage,
  ProjectImageKind,
  ProjectProcess,
  ProjectRiskKind,
  ProjectRisks,
  ProjectStatus,
  Property,
  PropertyId,
  PropertyKind,
  PropertyProfile,
} from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Money } from "@/shared/domain/money";
import type { DomainError, Result } from "@/shared/domain/result";
import type { BudgetErrorCode, BudgetLine, ProjectBudget } from "./budget";
import type { ProjectEconomics } from "./project-economics";

/** Lo que envía el asistente del backoffice (plan 011 §3; sin `revision` hasta DB-4). Montos en `Money`. */
export type ProjectSheetInput = {
  /** null = crear. Al editar manda `ctx.existing`. */
  readonly projectId: ProjectId | null;
  readonly property: {
    readonly city: string;
    readonly zone: string;
    readonly kind: PropertyKind;
    readonly areaM2: number;
  };
  /** Venta y liquidación no se editan aquí: se conservan del existente (W-5). */
  readonly project: {
    readonly name: string;
    readonly status: ProjectStatus;
    readonly acquiredOn: IsoDate | null;
  };
  readonly profile: { readonly description: string; readonly highlights: readonly string[] } | null;
  readonly processSteps: ProjectProcess["steps"] | null;
  readonly riskKinds: readonly ProjectRiskKind[];
  /** `placed` = el existente o 0 (se edita en W-6). */
  readonly participationClass: { readonly total: number; readonly unitPrice: Money } | null;
  readonly economics: Omit<ProjectEconomics, "projectId">;
  readonly budgetLines: readonly BudgetLine[];
  readonly images: readonly { readonly kind: ProjectImageKind; readonly url: string }[];
};

/** Ficha completa y validada, lista para `ProjectSheetWriter.save` (todo o nada). */
export type ProjectSheet = {
  readonly property: Property;
  readonly project: Project;
  readonly profile: PropertyProfile | null;
  readonly process: ProjectProcess | null;
  readonly risks: ProjectRisks | null;
  readonly participationClass: ParticipationClass | null;
  readonly economics: ProjectEconomics;
  readonly budget: ProjectBudget;
  readonly images: readonly ProjectImage[];
};

/** Campo del formulario al que apunta cada error (la UI lo pinta junto al control). */
export type ProjectSheetField =
  | "property.city"
  | "property.zone"
  | "property.kind"
  | "property.areaM2"
  | "project.code"
  | "project.name"
  | "project.status"
  | "project.acquiredOn"
  | "project.timeline"
  | "profile"
  | "processSteps"
  | "riskKinds"
  | "participationClass"
  | "economics"
  | "economics.recoveryBudget"
  | "budgetLines"
  | "images";

export type ProjectSheetErrorCode =
  | "REQUIRED_FIELD" // nombre vacío (S4 "siempre")
  | "REQUIRED_FOR_PUBLISHED" // fecha, perfil, proceso o clase faltan en una etapa publicable (S4)
  | "INVALID_PROPERTY"
  | "INVALID_PROFILE"
  | "INCONSISTENT_TIMELINE"
  | "ACQUIRED_IN_FUTURE"
  | "STATUS_NOT_CREATABLE" // W2-1
  | "STATUS_CHANGE_NOT_ALLOWED" // al editar, la etapa solo cambia con W-3
  | "SHEET_LOCKED" // W2-3: sold / settled
  | "CLASS_LOCKED_BY_PLACEMENTS" // W2-2: placed > 0
  | ProcessErrorCode
  | "INVALID_ECONOMICS"
  | BudgetErrorCode
  | "INVALID_PARTICIPATION_CLASS"
  | "RECOVERY_BUDGET_MISMATCH" // F ≠ total × precio (S5)
  | "MISSING_COMMON_RISKS"
  | "MISSING_REQUIRED_IMAGES"
  | "INVALID_IMAGES" // tipo repetido o URL vacía
  | "INVALID_PROJECT_CODE"
  | "CODE_SPACE_EXHAUSTED"
  | "INVALID_SLUG";

export type ProjectSheetIssue = DomainError<ProjectSheetErrorCode> & {
  readonly field: ProjectSheetField;
};

export type ProjectSheetContext = {
  /** null = alta. */
  readonly existing: ProjectSheet | null;
  readonly existingCodes: readonly ProjectCode[];
  /** brand.shortName, inyectado. */
  readonly codePrefix: string;
  /** Hoy según el `Clock` inyectado. */
  readonly today: IsoDate;
  /** Ids nuevos para el alta (y la clase si el existente no tenía). */
  readonly ids: {
    readonly projectId: ProjectId;
    readonly propertyId: PropertyId;
    readonly classId: ParticipationClassId;
  };
  /** Inyectada desde composition (D2 de plan 006: finance no importa valores de participations). */
  readonly checkParticipationClass: (
    c: ParticipationClass,
  ) => Result<ParticipationClass, DomainError>;
};
