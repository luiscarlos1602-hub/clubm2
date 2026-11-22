import type { ProjectId } from "@/modules/projects";
import type { Money } from "@/shared/domain/money";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";

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

/**
 * W-1. C, F y P objetivo > 0; O estimado ≥ 0. No exige excedente positivo: una oportunidad puede
 * proyectar pérdida (lo muestra la ficha como escenario). Nunca lanza.
 */
export function checkProjectEconomics(
  economics: ProjectEconomics,
): Result<ProjectEconomics, DomainError<"INVALID_ECONOMICS">> {
  const { acquisitionCost, recoveryBudget, targetSalePrice, estimatedSaleCosts } = economics;
  if (acquisitionCost.cents <= 0) return err("INVALID_ECONOMICS", "el costo de compra debe ser mayor que 0");
  if (recoveryBudget.cents <= 0) return err("INVALID_ECONOMICS", "el presupuesto de recuperación debe ser mayor que 0");
  if (targetSalePrice.cents <= 0) return err("INVALID_ECONOMICS", "el precio objetivo de venta debe ser mayor que 0");
  if (estimatedSaleCosts.cents < 0) return err("INVALID_ECONOMICS", "los costos de venta no pueden ser negativos");
  return ok(economics);
}
