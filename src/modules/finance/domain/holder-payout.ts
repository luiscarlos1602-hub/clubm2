import {
  ZERO_USD,
  addMoney,
  isPositive,
  multiplyMoney,
  subtractMoney,
  type Money,
} from "@/shared/domain/money";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { DistributionOutcome, ValueBasis } from "./distribution";

/**
 * Cobro de un titular con `held` participaciones. Ganancia (C1 × 1 = 100 + 50) o pérdida (C5 × 1: pierde 2,50,
 * recupera 97,50), nunca ambas. Todos los montos ≥ 0: la pérdida se rotula aparte, nunca como ganancia negativa.
 */
export type HolderPayout = {
  readonly basis: ValueBasis;
  readonly held: number;
  /** Del titular: gain > 0 → "gain"; loss > 0 → "loss"; si no, "break_even" (recupera su aporte). */
  readonly result: "gain" | "break_even" | "loss";
  readonly capital: Money; // aportado = held × unitPrice
  readonly loss: Money; // held × lossPerParticipation (0 sin pérdida)
  readonly capitalReturned: Money; // capital − loss
  readonly gain: Money; // held × perParticipation (0 en pérdida)
  readonly total: Money; // capitalReturned + gain (≥ 0)
};

export type HolderPayoutErrorCode = "HELD_OUT_OF_RANGE";

function resultOf(gain: Money, loss: Money): HolderPayout["result"] {
  if (isPositive(gain)) return "gain";
  return isPositive(loss) ? "loss" : "break_even";
}

/** Nunca lanza. Con ganancia o con pérdida (ADR-019) usa el mismo resultado del motor. */
export function calculateHolderPayout(
  outcome: DistributionOutcome,
  held: number,
): Result<HolderPayout, DomainError<HolderPayoutErrorCode>> {
  const { placed, unitPrice } = outcome.participations;
  if (!Number.isSafeInteger(held) || held < 1 || held > placed) {
    return err("HELD_OUT_OF_RANGE", `held debe ser un entero entre 1 y ${placed}`);
  }
  const capital = multiplyMoney(unitPrice, held);
  const loss =
    outcome.kind === "loss" ? multiplyMoney(outcome.lossPerParticipation, held) : ZERO_USD;
  const gain = outcome.kind === "loss" ? ZERO_USD : multiplyMoney(outcome.perParticipation, held);
  const capitalReturned = subtractMoney(capital, loss);
  return ok({
    basis: outcome.basis,
    held,
    result: resultOf(gain, loss),
    capital,
    loss,
    capitalReturned,
    gain,
    total: addMoney(capitalReturned, gain),
  });
}
