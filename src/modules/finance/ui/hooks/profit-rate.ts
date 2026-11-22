import type { Money } from "@/shared/domain/money";
import { formatPercentage } from "@/shared/lib/format-percentage";
import { calculateProfitRate, calculateRecoveryRate } from "../../domain/profit-rate";

/** Único texto del % junto a una ganancia (ADR-013). */
export const PROFIT_RATE_COPY = {
  onCapital: (pct: string) => `${pct} sobre el capital`,
  /** Ganancia presente cuyo % no puede expresarse (capital 0; una pérdida no es ganancia negativa, ADR-019): nunca se omite ni sale negativo. */
  undefinedRate: "% por definir",
  /** Pérdida (ADR-019): nunca "% de ganancia" ni negativo; se expresa lo que se recupera del aporte. */
  recovered: (pct: string) => `${pct} del aporte recuperado`,
  undefinedRecovery: "% de recuperación por definir",
} as const;

/** "34,5 % sobre el capital" para una ganancia sobre su capital; el % lo calcula el motor, aquí solo se formatea.
 *  null solo si no hay ganancia (gain null). Si no puede calcularse, "% por definir". */
export function profitRateLabel(gain: Money | null, capital: Money): string | null {
  if (gain === null) return null;
  const rate = calculateProfitRate(gain, capital);
  return rate.ok ? PROFIT_RATE_COPY.onCapital(formatPercentage(rate.value)) : PROFIT_RATE_COPY.undefinedRate;
}

/** "97,5 % del aporte recuperado" para una pérdida (ADR-019); el % lo calcula el motor, aquí solo se formatea. */
export function recoveryRateLabel(capitalReturned: Money, capital: Money): string {
  const rate = calculateRecoveryRate(capitalReturned, capital);
  return rate.ok ? PROFIT_RATE_COPY.recovered(formatPercentage(rate.value)) : PROFIT_RATE_COPY.undefinedRecovery;
}
