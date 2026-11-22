import type { ParticipationTerms } from "./distribution";
import type { ProjectEconomics } from "./project-economics";
import type { ProjectSale } from "./project-sale";
import type { RealizedDistributionInput } from "./settlement";

/**
 * Única forma de armar la entrada realizada de una liquidación (la usan liquidar y la vista previa de B5).
 * P y O salen de la venta real; C y F de la economía del proyecto (F = presupuesto hasta W-4);
 * total, colocadas y precio de la clase al liquidar (CA13). Copia solo los términos: ningún campo extra
 * de la clase llega a la liquidación guardada. No valida: lo hace calculateDistribution.
 */
export function buildRealizedInput(a: {
  readonly sale: ProjectSale;
  readonly economics: ProjectEconomics;
  readonly terms: ParticipationTerms;
}): RealizedDistributionInput {
  const { total, placed, unitPrice } = a.terms;
  return {
    basis: "realized",
    salePrice: a.sale.salePrice,
    acquisitionCost: a.economics.acquisitionCost,
    recoveryBudget: a.economics.recoveryBudget,
    saleCosts: a.sale.saleCosts,
    participations: { total, placed, unitPrice },
  };
}
