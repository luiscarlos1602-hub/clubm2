import type { ProjectId } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Id } from "@/shared/domain/id";
import type { Money } from "@/shared/domain/money";

/** Referencia opaca al inversionista. El perfil vive en `investors` (F2). */
export type HolderId = Id<"Investor">;
export type ParticipationClassId = Id<"ParticipationClass">;
export type ParticipationId = Id<"Participation">;

/**
 * Clase de participación de un proyecto (ref. 100 × USD 100).
 * `placed` = total colocado a terceros (agregado); total − placed = retenidas por la empresa.
 * Es estructuralmente compatible con `ParticipationTerms` de finance: se pasa tal cual al motor.
 */
export type ParticipationClass = {
  readonly id: ParticipationClassId;
  readonly projectId: ProjectId;
  /** Entero ≥ 1. */
  readonly total: number;
  /** Entero 0..total. */
  readonly placed: number;
  /** > 0. */
  readonly unitPrice: Money;
};

/** D5: P5 crea las pendientes; solo las confirmadas cuentan como colocadas. */
export const PARTICIPATION_STATUSES = ["pending_confirmation", "confirmed"] as const;
export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number];

/** Tenencia de un titular en un proyecto. */
export type Participation = {
  readonly id: ParticipationId;
  readonly classId: ParticipationClassId;
  readonly projectId: ProjectId;
  readonly holderId: HolderId;
  /** Entero dentro de HOLDING_LIMITS. */
  readonly quantity: number;
  readonly status: ParticipationStatus;
  readonly subscribedOn: IsoDate;
};

/** D4 (decidido 22-nov): mínimo 1 y máximo 20 participaciones por persona y proyecto. */
export const HOLDING_LIMITS: { readonly min: 1; readonly max: 20 } = Object.freeze({
  min: 1,
  max: 20,
});
