import { multiplyMoney, type Money } from "@/shared/domain/money";
import {
  neutralControls,
  simulateProjection,
  type SimulationBase,
  type SimulationResult,
} from "./simulator";

/**
 * Estimación de una reserva de `quantity` participaciones con el motor (proyección).
 * [SUPUESTO P5-1] La reserva se suma a lo colocado, con el total como tope.
 */
export function estimateReservation(base: SimulationBase, quantity: number): SimulationResult {
  const placed = Math.min(base.total, base.placed + quantity);
  return simulateProjection(base, { ...neutralControls(base, quantity), placed });
}

/** Capital de una reserva: unitPrice × quantity. quantity < 0 o no entero → RangeError de Money: valida antes. */
export function reservationAmount(unitPrice: Money, quantity: number): Money {
  return multiplyMoney(unitPrice, quantity);
}

/**
 * Ganancia proyectada de `held` participaciones en el escenario base (la misma cuenta del simulador).
 * null si no hay payout o si el motor no puede considerar las `held` completas (tenencia > colocadas).
 */
export function projectHoldingGain(base: SimulationBase, held: number): Money | null {
  const { outcome } = simulateProjection(base, neutralControls(base, held));
  return outcome.kind === "payout" && outcome.payout.held === held ? outcome.payout.gain : null;
}
