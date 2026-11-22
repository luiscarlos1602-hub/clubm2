import { addMoney, multiplyMoney, type Money } from "@/shared/domain/money";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { DistributionOutcome, ValueBasis } from "./distribution";

/** Cobro de un titular con `held` participaciones (C1 × 1 = 100 capital + 50 ganancia). */
export type HolderPayout = {
  readonly basis: ValueBasis;
  readonly held: number;
  readonly capital: Money; // held × unitPrice
  readonly gain: Money; // held × perParticipation
  readonly total: Money; // capital + gain
};

export type HolderPayoutErrorCode = "HELD_OUT_OF_RANGE" | "LOSS_POLICY_UNDEFINED";

/** Nunca lanza. En pérdida no calcula devolución: la política está por definir (H2). */
export function calculateHolderPayout(
  outcome: DistributionOutcome,
  held: number,
): Result<HolderPayout, DomainError<HolderPayoutErrorCode>> {
  if (outcome.kind === "no_distribution") {
    return err("LOSS_POLICY_UNDEFINED", "sin excedente: la política de pérdidas está por definir");
  }
  const { placed, unitPrice } = outcome.participations;
  if (!Number.isSafeInteger(held) || held < 1 || held > placed) {
    return err("HELD_OUT_OF_RANGE", `held debe ser un entero entre 1 y ${placed}`);
  }
  const capital = multiplyMoney(unitPrice, held);
  const gain = multiplyMoney(outcome.perParticipation, held);
  return ok({ basis: outcome.basis, held, capital, gain, total: addMoney(capital, gain) });
}
