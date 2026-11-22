import { addDays, type IsoDate } from "@/shared/domain/calendar-date";
import { multiplyMoney, sumMoney, type Money } from "@/shared/domain/money";
import { HOLDING_LIMITS } from "@/modules/participations";
import type { SimulatorBase } from "./simulate";
import type { ProjectDetailData } from "./use-project-detail";

/** Entradas del simulador a partir de lo que entrega el container (proyección). */
export function toSimulatorBase(data: ProjectDetailData): SimulatorBase {
  const { economics, participationClass: c, listing } = data;
  return {
    salePrice: economics.targetSalePrice,
    acquisitionCost: economics.acquisitionCost,
    recoveryBudget: economics.recoveryBudget,
    saleCosts: economics.estimatedSaleCosts,
    total: c.total,
    unitPrice: c.unitPrice,
    placed: c.placed,
    targetTermMonths: listing.targetTermMonths ?? 0,
  };
}

/** D4: 1…20 por persona; en colocación abierta, no más que las disponibles. 0 = sin cupos. */
export function maxHeldFor(data: ProjectDetailData): number {
  const { listing, participationClass: c } = data;
  const cap = listing.phase === "open" ? listing.participations.available : c.placed;
  if (cap < 1) return 0;
  return Math.min(HOLDING_LIMITS.max, cap);
}

export type BudgetView = {
  readonly acquisition: Money;
  readonly works: readonly { readonly label: string; readonly amount: Money }[];
  readonly fees: readonly { readonly label: string; readonly amount: Money }[];
  readonly recovery: Money;
  readonly saleCosts: Money;
  readonly total: Money;
};

/** Presupuesto desglosado: F sale del container; el desglose, de los ejemplos. */
export function toBudgetView(data: ProjectDetailData): BudgetView {
  const { economics, example } = data;
  return {
    acquisition: economics.acquisitionCost,
    works: example.works,
    fees: example.fees,
    recovery: economics.recoveryBudget,
    saleCosts: economics.estimatedSaleCosts,
    total: sumMoney([economics.acquisitionCost, economics.recoveryBudget, economics.estimatedSaleCosts]),
  };
}

export function dateAfterPurchase(acquiredOn: IsoDate, offsetDays: number): IsoDate {
  return addDays(acquiredOn, offsetDays);
}

/** Resumen de la reserva simulada: cantidad × precio por participación. */
export function reservationAmount(unitPrice: Money, quantity: number): Money {
  return multiplyMoney(unitPrice, quantity);
}
