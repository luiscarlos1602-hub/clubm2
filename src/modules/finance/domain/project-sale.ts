import type { ProjectId } from "@/modules/projects";
import { compareIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { MAX_MONEY_CENTS, compareMoney, type Money } from "@/shared/domain/money";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";

/**
 * Venta real de un proyecto (W-5): precio P y costos de venta O reales, y la fecha de firma.
 * Vive en el slice `finance.sales`; no se corrige en W-5 (W5-3). La liquidación la toma con buildRealizedInput.
 */
export type ProjectSale = {
  readonly projectId: ProjectId;
  readonly salePrice: Money;
  readonly saleCosts: Money;
  readonly signedOn: IsoDate;
};

export type ProjectSaleErrorCode =
  | "NON_POSITIVE_SALE_PRICE"
  | "NEGATIVE_AMOUNT"
  | "AMOUNT_TOO_LARGE"
  | "SALE_COSTS_EXCEED_PRICE"
  | "SALE_DATE_IN_FUTURE";

function isWithinCeiling(m: Money): boolean {
  return Number.isSafeInteger(m.cents) && m.cents <= MAX_MONEY_CENTS;
}

/**
 * Reglas propias de la venta: P > 0, O ≥ 0, montos dentro del techo, O ≤ P (W5-2) y firma ≤ hoy.
 * El orden frente al timeline y la transición de estado los valida el caso de uso. Nunca lanza.
 */
export function checkProjectSale(
  sale: ProjectSale,
  today: IsoDate,
): Result<ProjectSale, DomainError<ProjectSaleErrorCode>> {
  const { salePrice, saleCosts, signedOn } = sale;
  if (!(salePrice.cents > 0)) {
    return err("NON_POSITIVE_SALE_PRICE", "el precio de venta debe ser mayor que 0");
  }
  if (saleCosts.cents < 0) return err("NEGATIVE_AMOUNT", "los costos de venta no pueden ser negativos");
  if (!isWithinCeiling(salePrice) || !isWithinCeiling(saleCosts)) {
    return err("AMOUNT_TOO_LARGE", `cada monto debe ser un entero de centavos ≤ ${MAX_MONEY_CENTS}`);
  }
  if (compareMoney(saleCosts, salePrice) > 0) {
    return err("SALE_COSTS_EXCEED_PRICE", "los costos de venta no pueden superar el precio de venta");
  }
  if (compareIsoDate(signedOn, today) > 0) {
    return err("SALE_DATE_IN_FUTURE", "la fecha de firma no puede ser posterior a hoy");
  }
  return ok(sale);
}
