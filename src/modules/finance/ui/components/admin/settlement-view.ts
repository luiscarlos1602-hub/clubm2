import type { Money } from "@/shared/domain/money";
import { calculateDistribution, type DistributionOutcome } from "../../../domain/distribution";
import type { FinanceRow } from "./use-admin-finance";
import { PLACED_BY_CODE, TOTAL_PARTICIPATIONS, UNIT_PRICE } from "./examples";

export type SettlementView = {
  readonly basis: "realized" | "projection";
  readonly placed: number;
  readonly total: number;
  readonly inputs: { readonly salePrice: Money; readonly acquisition: Money; readonly recovery: Money; readonly saleCosts: Money };
  readonly outcome: DistributionOutcome;
};

/** Proyectos que se pueden mostrar: liquidados (realizado) o con economía y colocación (proyección). */
export function settlementView(row: FinanceRow): SettlementView | null {
  if (row.settlement) {
    const { input, distribution } = row.settlement;
    return {
      basis: "realized",
      placed: input.participations.placed,
      total: input.participations.total,
      inputs: { salePrice: input.salePrice, acquisition: input.acquisitionCost, recovery: input.recoveryBudget, saleCosts: input.saleCosts },
      outcome: distribution,
    };
  }
  const placed = PLACED_BY_CODE[row.project.code];
  if (!row.economics || placed === undefined) return null;
  const e = row.economics;
  const result = calculateDistribution({
    basis: "projection",
    salePrice: e.targetSalePrice,
    acquisitionCost: e.acquisitionCost,
    recoveryBudget: e.recoveryBudget,
    saleCosts: e.estimatedSaleCosts,
    participations: { total: TOTAL_PARTICIPATIONS, placed, unitPrice: UNIT_PRICE },
  });
  if (!result.ok) return null;
  return {
    basis: "projection",
    placed,
    total: TOTAL_PARTICIPATIONS,
    inputs: { salePrice: e.targetSalePrice, acquisition: e.acquisitionCost, recovery: e.recoveryBudget, saleCosts: e.estimatedSaleCosts },
    outcome: result.value,
  };
}
