import type { Money } from "@/shared/domain/money";
import { formatPercentage } from "@/shared/lib/format-percentage";
import { calculateProfitRate } from "../../domain/profit-rate";

/** Único texto del % junto a una ganancia (ADR-013). */
export const PROFIT_RATE_COPY = {
  onCapital: (pct: string) => `${pct} sobre el capital`,
  /** Ganancia presente cuyo % no puede expresarse (ganancia negativa, capital 0): nunca se omite ni sale negativo. */
  undefinedRate: "% por definir",
} as const;

/** "34,5 % sobre el capital" para una ganancia sobre su capital; el % lo calcula el motor, aquí solo se formatea.
 *  null solo si no hay ganancia (gain null). Si no puede calcularse, "% por definir". */
export function profitRateLabel(gain: Money | null, capital: Money): string | null {
  if (gain === null) return null;
  const rate = calculateProfitRate(gain, capital);
  return rate.ok ? PROFIT_RATE_COPY.onCapital(formatPercentage(rate.value)) : PROFIT_RATE_COPY.undefinedRate;
}
