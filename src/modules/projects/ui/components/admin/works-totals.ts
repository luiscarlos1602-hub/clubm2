import { usd, type Money } from "@/shared/domain/money";
import type { WorksProfile } from "./examples";

// Totales literales de las líneas de examples.ts (500.000 + 250.000 + 150.000 + 100.000 ¢ = USD 10.000).
export const TOTAL_BUDGET: Money = usd(1_000_000);
export const TOTAL_SPENT_BY_PROFILE: Readonly<Record<WorksProfile, Money>> = {
  funding: usd(0),
  renovation: usd(440_000),
  finished: usd(892_000),
};
export const REMAINING_BY_PROFILE: Readonly<Record<WorksProfile, Money>> = {
  funding: usd(1_000_000),
  renovation: usd(560_000),
  finished: usd(108_000),
};
