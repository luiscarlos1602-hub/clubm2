import type { Project } from "@/modules/projects";
import type { Money } from "@/shared/domain/money";
import {
  calculateDistribution,
  type DistributionOutcome,
  type ParticipationTerms,
} from "../../domain/distribution";
import { calculateHolderPayout, type HolderPayout } from "../../domain/holder-payout";
import type { ProjectEconomics } from "../../domain/project-economics";
import type { ProjectSale } from "../../domain/project-sale";
import type { Settlement } from "../../domain/settlement";
import { buildRealizedInput } from "../../domain/settlement-input";

/** Lo que B5 necesita de un proyecto (el hook de datos de admin lo arma; `terms` sale de su ParticipationClass). */
export type SettlementViewSource = {
  readonly project: Project;
  readonly economics: ProjectEconomics | null;
  readonly settlement: Settlement | null;
  readonly sale: ProjectSale | null;
  readonly terms: ParticipationTerms | null;
};

/** settled = liquidación guardada · sold = venta registrada, por liquidar (vista previa) · projection = cifras objetivo. */
export type SettlementViewState = "settled" | "sold" | "projection";

export type SettlementView = {
  readonly state: SettlementViewState;
  readonly basis: "realized" | "projection";
  readonly placed: number;
  readonly total: number;
  readonly inputs: { readonly salePrice: Money; readonly acquisition: Money; readonly recovery: Money; readonly saleCosts: Money };
  readonly outcome: DistributionOutcome;
  /** Cobro de un titular con 1 participación (CA7); null si no hay colocadas. */
  readonly perParticipation: HolderPayout | null;
};

function payoutOf(outcome: DistributionOutcome): HolderPayout | null {
  const payout = calculateHolderPayout(outcome, 1);
  return payout.ok ? payout.value : null;
}

/**
 * Proyectos que B5 puede mostrar: liquidados (realizado), vendidos por liquidar (vista previa con la misma
 * entrada que usará "Liquidar") o con economía y clase (proyección). Todo sale del motor.
 */
export function settlementView(row: SettlementViewSource): SettlementView | null {
  if (row.settlement) {
    const { input, distribution } = row.settlement;
    return {
      state: "settled",
      basis: "realized",
      placed: input.participations.placed,
      total: input.participations.total,
      inputs: { salePrice: input.salePrice, acquisition: input.acquisitionCost, recovery: input.recoveryBudget, saleCosts: input.saleCosts },
      outcome: distribution,
      perParticipation: payoutOf(distribution),
    };
  }
  const { economics, terms, sale } = row;
  if (!economics || !terms) return null;

  if (sale && row.project.status === "sold") {
    const input = buildRealizedInput({ sale, economics, terms });
    const result = calculateDistribution(input);
    if (!result.ok) return null;
    return {
      state: "sold",
      basis: "realized",
      placed: terms.placed,
      total: terms.total,
      inputs: { salePrice: input.salePrice, acquisition: input.acquisitionCost, recovery: input.recoveryBudget, saleCosts: input.saleCosts },
      outcome: result.value,
      perParticipation: payoutOf(result.value),
    };
  }

  const result = calculateDistribution({
    basis: "projection",
    salePrice: economics.targetSalePrice,
    acquisitionCost: economics.acquisitionCost,
    recoveryBudget: economics.recoveryBudget,
    saleCosts: economics.estimatedSaleCosts,
    participations: { total: terms.total, placed: terms.placed, unitPrice: terms.unitPrice },
  });
  if (!result.ok) return null;
  return {
    state: "projection",
    basis: "projection",
    placed: terms.placed,
    total: terms.total,
    inputs: { salePrice: economics.targetSalePrice, acquisition: economics.acquisitionCost, recovery: economics.recoveryBudget, saleCosts: economics.estimatedSaleCosts },
    outcome: result.value,
    perParticipation: payoutOf(result.value),
  };
}
