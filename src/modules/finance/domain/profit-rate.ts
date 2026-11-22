import { divideFloor, isNegative, isZero, multiplyMoney, type Money } from "@/shared/domain/money";
import { BPS_PER_WHOLE, type Percentage } from "@/shared/domain/percentage";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";

export type ProfitRateErrorCode = "CAPITAL_NOT_POSITIVE" | "NEGATIVE_GAIN";

/**
 * % generado sobre el capital (ADR-013): ganancia / capital, en puntos básicos, redondeado hacia abajo.
 * Es la única fuente del "%" que acompaña a toda ganancia (realizada o proyectada). Ninguna pantalla lo calcula.
 * Una pérdida nunca se expresa como % de ganancia: se usa calculateRecoveryRate (ADR-019).
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

export type RecoveryRateErrorCode = "CAPITAL_NOT_POSITIVE" | "NEGATIVE_RETURN";

/**
 * % del aporte que se recupera (ADR-019): capitalReturned / capital, en puntos básicos, hacia abajo.
 * Acompaña a toda pérdida (C5: 97,5 %). Ninguna pantalla lo calcula.
 */
export function calculateRecoveryRate(
  capitalReturned: Money,
  capital: Money,
): Result<Percentage, DomainError<RecoveryRateErrorCode>> {
  if (isNegative(capital) || isZero(capital)) return err("CAPITAL_NOT_POSITIVE");
  if (isNegative(capitalReturned)) return err("NEGATIVE_RETURN");
  const { quotient } = divideFloor(multiplyMoney(capitalReturned, BPS_PER_WHOLE), capital.cents);
  return ok({ bps: quotient.cents });
}
