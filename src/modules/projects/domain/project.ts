import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Id } from "@/shared/domain/id";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { ProjectStatus } from "./project-status";

export type ProjectId = Id<"Project">;
export type PropertyId = Id<"Property">;

/** Código público del proyecto, p. ej. "M2-001". El prefijo lo pone F1-4 desde brand.shortName; aquí solo se valida la forma. */
export type ProjectCode = string & { readonly __brand: "ProjectCode" };

const PROJECT_CODE_PATTERN = /^[A-Z0-9]{1,4}-\d{3}$/;

export function parseProjectCode(
  raw: unknown,
): Result<ProjectCode, DomainError<"INVALID_PROJECT_CODE">> {
  if (typeof raw !== "string" || !PROJECT_CODE_PATTERN.test(raw)) {
    return err(
      "INVALID_PROJECT_CODE",
      "formato esperado: 1–4 mayúsculas o dígitos, guion y 3 dígitos (M2-001)",
    );
  }
  return ok(raw as ProjectCode);
}

/** Mínimo para F1. F1-4 puede añadir campos descriptivos (fotos, m², tipo) avisando al agente principal. */
export type Property = {
  readonly id: PropertyId;
  readonly city: string;
  /** Zona sin dirección exacta (D6). */
  readonly zone: string;
};

export type ProjectTimeline = {
  /** Firma de compra: inicio de la medición de rueda. */
  readonly acquiredOn: IsoDate | null;
  /** Firma de venta: fin de la medición (K4). */
  readonly saleSignedOn: IsoDate | null;
  /** Liquidación: no afecta la rueda. */
  readonly settledOn: IsoDate | null;
};

export type Project = {
  readonly id: ProjectId;
  readonly code: ProjectCode;
  /** URL en español, kebab-case. */
  readonly slug: string;
  readonly name: string;
  readonly propertyId: PropertyId;
  readonly status: ProjectStatus;
  readonly timeline: ProjectTimeline;
};
