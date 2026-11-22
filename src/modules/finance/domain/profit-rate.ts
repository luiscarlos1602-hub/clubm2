import { divideFloor, isNegative, isZero, multiplyMoney, type Money } from "@/shared/domain/money";
import { BPS_PER_WHOLE, type Percentage } from "@/shared/domain/percentage";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";

export type ProfitRateErrorCode = "CAPITAL_NOT_POSITIVE" | "NEGATIVE_GAIN";

/**
 * % generado sobre el capital (ADR-013): ganancia / capital, en puntos básicos, redondeado hacia abajo.
 * Es la única fuente del "%" que acompaña a toda ganancia (realizada o proyectada). Ninguna pantalla lo calcula.
 * Una ganancia negativa no se expresa como % (la política de pérdidas está por definir, H2/O1).
 */
export function calculateProfitRate(
  gain: Money,
  capital: Money,
): Result<Percentage, DomainError<ProfitRateErrorCode>> {
  if (isNegative(capital) || isZero(capital)) return err("CAPITAL_NOT_POSITIVE");
  if (isNegative(gain)) return err("NEGATIVE_GAIN");
  const { quotient } = divideFloor(multiplyMoney(gain, BPS_PER_WHOLE), capital.cents);
  return ok({ bps: quotient.cents });
}
