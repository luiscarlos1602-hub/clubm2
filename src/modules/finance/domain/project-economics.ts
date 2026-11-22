import type { ProjectId } from "@/modules/projects";
import type { Money } from "@/shared/domain/money";

/**
 * Supuestos base del proyecto. Todo es proyección salvo lo que diga `Settlement`.
 * El desglose de F en líneas (docs/02 §6) es de P4/B3.
 */
export type ProjectEconomics = {
  readonly projectId: ProjectId;
  /** C. En due diligence es el precio de oferta. */
  readonly acquisitionCost: Money;
  /** F (ref. USD 10.000). */
  readonly recoveryBudget: Money;
  /** P objetivo, siempre proyección. */
  readonly targetSalePrice: Money;
  /** O estimado, siempre proyección. */
  readonly estimatedSaleCosts: Money;
};
