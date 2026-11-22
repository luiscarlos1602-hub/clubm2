import { addCalendarMonths, compareIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { Project } from "./project";

// Métrica interna: se expone solo por modules/projects/backoffice.ts (ADR-004).

export type Wheel = "good" | "medium" | "bad" | "in_progress";

type Measured = { readonly measuredFrom: IsoDate; readonly measuredUntil: IsoDate };

export type WheelClassification =
  | ({ readonly wheel: "good"; readonly sold: true } & Measured)
  | ({ readonly wheel: "medium"; readonly sold: true } & Measured)
  /** sold: true = "mala (vendida)" (K3). */
  | ({ readonly wheel: "bad"; readonly sold: boolean } & Measured)
  | ({ readonly wheel: "in_progress"; readonly sold: false } & Measured);

export const WHEEL_THRESHOLDS_MONTHS: { readonly good: 3; readonly medium: 6 } = Object.freeze({
  good: 3,
  medium: 6,
});

export type WheelInput = { readonly acquiredOn: IsoDate; readonly saleSignedOn: IsoDate | null };

type WheelErrorCode = "SALE_BEFORE_ACQUISITION" | "TODAY_BEFORE_ACQUISITION" | "SALE_AFTER_TODAY";

const isAfter = (a: IsoDate, b: IsoDate): boolean => compareIsoDate(a, b) > 0;

/**
 * Pura: recibe "hoy" como valor (el Clock se lee en application/ui).
 * Meses calendario desde la compra (K2); se mide hasta la firma de venta (K4); vendida tras 6 meses = mala (K3).
 */
export function classifyWheel(
  input: WheelInput,
  today: IsoDate,
): Result<WheelClassification, DomainError<WheelErrorCode>> {
  const { acquiredOn, saleSignedOn } = input;
  if (saleSignedOn !== null && isAfter(acquiredOn, saleSignedOn)) {
    return err("SALE_BEFORE_ACQUISITION", `${saleSignedOn} < ${acquiredOn}`);
  }
  if (isAfter(acquiredOn, today))
    return err("TODAY_BEFORE_ACQUISITION", `${today} < ${acquiredOn}`);
  if (saleSignedOn !== null && isAfter(saleSignedOn, today)) {
    return err("SALE_AFTER_TODAY", `${saleSignedOn} > ${today}`);
  }

  const goodLimit = addCalendarMonths(acquiredOn, WHEEL_THRESHOLDS_MONTHS.good);
  const mediumLimit = addCalendarMonths(acquiredOn, WHEEL_THRESHOLDS_MONTHS.medium);
  const measuredFrom = acquiredOn;

  if (saleSignedOn === null) {
    const measured = { measuredFrom, measuredUntil: today };
    return ok(
      isAfter(today, mediumLimit)
        ? { wheel: "bad", sold: false, ...measured }
        : { wheel: "in_progress", sold: false, ...measured },
    );
  }

  const measured = { measuredFrom, measuredUntil: saleSignedOn };
  if (!isAfter(saleSignedOn, goodLimit)) return ok({ wheel: "good", sold: true, ...measured });
  if (!isAfter(saleSignedOn, mediumLimit)) return ok({ wheel: "medium", sold: true, ...measured });
  return ok({ wheel: "bad", sold: true, ...measured });
}

/** settledOn nunca interviene (K4). */
export function classifyProjectWheel(
  project: Project,
  today: IsoDate,
): Result<WheelClassification, DomainError<"NOT_ACQUIRED" | WheelErrorCode>> {
  const { acquiredOn, saleSignedOn } = project.timeline;
  if (acquiredOn === null) return err("NOT_ACQUIRED", `${project.code} sin fecha de compra`);
  return classifyWheel({ acquiredOn, saleSignedOn }, today);
}
