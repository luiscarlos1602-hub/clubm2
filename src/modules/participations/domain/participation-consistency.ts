import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import { HOLDING_LIMITS, type Participation, type ParticipationClass } from "./participation";

export type HoldingsErrorCode =
  "HOLDING_CLASS_MISMATCH" | "HOLDING_OUT_OF_LIMITS" | "HOLDINGS_EXCEED_PLACED";

/** total entero ≥ 1; placed entero 0..total; unitPrice.cents > 0. Nunca lanza. */
export function checkParticipationClass(
  cls: ParticipationClass,
): Result<ParticipationClass, DomainError<"INVALID_PARTICIPATION_CLASS">> {
  const { total, placed, unitPrice } = cls;
  if (!Number.isSafeInteger(total) || total < 1) {
    return err("INVALID_PARTICIPATION_CLASS", "total debe ser un entero ≥ 1");
  }
  if (!Number.isSafeInteger(placed) || placed < 0 || placed > total) {
    return err("INVALID_PARTICIPATION_CLASS", `colocadas debe ser un entero entre 0 y ${total}`);
  }
  if (!Number.isSafeInteger(unitPrice.cents) || unitPrice.cents <= 0) {
    return err("INVALID_PARTICIPATION_CLASS", "el precio por participación debe ser > 0");
  }
  return ok(cls);
}

function isWithinLimits(quantity: number): boolean {
  return (
    Number.isSafeInteger(quantity) &&
    quantity >= HOLDING_LIMITS.min &&
    quantity <= HOLDING_LIMITS.max
  );
}

/**
 * Cada tenencia pertenece a la clase y respeta D4 (1–20).
 * La suma de las confirmadas no supera las colocadas de la clase. Nunca lanza.
 */
export function checkHoldings(
  cls: ParticipationClass,
  holdings: readonly Participation[],
): Result<readonly Participation[], DomainError<HoldingsErrorCode>> {
  let confirmed = 0;
  for (const h of holdings) {
    if (h.classId !== cls.id || h.projectId !== cls.projectId) {
      return err("HOLDING_CLASS_MISMATCH", `la tenencia ${h.id} no es de la clase ${cls.id}`);
    }
    if (!isWithinLimits(h.quantity)) {
      return err(
        "HOLDING_OUT_OF_LIMITS",
        `la tenencia ${h.id} debe tener entre ${HOLDING_LIMITS.min} y ${HOLDING_LIMITS.max} participaciones`,
      );
    }
    if (h.status === "confirmed") confirmed += h.quantity;
  }
  if (confirmed > cls.placed) {
    return err(
      "HOLDINGS_EXCEED_PLACED",
      `las tenencias confirmadas (${confirmed}) superan las colocadas (${cls.placed})`,
    );
  }
  return ok(holdings);
}
