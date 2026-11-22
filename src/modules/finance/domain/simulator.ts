import {
  MAX_MONEY_CENTS,
  ZERO_USD,
  addMoney,
  applyPercentageFloor,
  subtractMoney,
  type Money,
} from "@/shared/domain/money";
import { percentage } from "@/shared/domain/percentage";
import { calculateDistribution, type Distribution, type NoDistribution } from "./distribution";
import { calculateHolderPayout, type HolderPayout } from "./holder-payout";

/** Supuestos base del proyecto (todo proyección). Los arma buildProjectDetail; nunca la pantalla. */
export type SimulationBase = {
  /** P objetivo. */
  readonly salePrice: Money;
  /** C. */
  readonly acquisitionCost: Money;
  /** F: base del sobrecosto (decisión del usuario 22-nov; Q5 abierta). */
  readonly recoveryBudget: Money;
  /** O estimado, fijo al mover el precio (Q6 abierta). */
  readonly saleCosts: Money;
  readonly total: number;
  readonly unitPrice: Money;
  /** Colocación actual de la clase. */
  readonly placed: number;
  /** TARGET_TERM_MONTHS si la tarjeta no trae plazo. */
  readonly targetTermMonths: number;
};

/** Porcentajes en puntos básicos (docs/01 §5). */
export type SimulationControls = {
  /** −3000…+2000, paso 500. */
  readonly saleAdjustmentBps: number;
  /** 0…5000, paso 1000. Se aplica a todo F. */
  readonly worksOverrunBps: number;
  /** 0…9 [SUPUESTO Q2: solo alarga el plazo]. */
  readonly delayMonths: number;
  /** 0…total. */
  readonly placed: number;
  /** 1…heldRange.max. */
  readonly held: number;
};

export const SIMULATION_RANGES: {
  readonly saleAdjustmentBps: { readonly min: -3000; readonly max: 2000; readonly step: 500 };
  readonly worksOverrunBps: { readonly min: 0; readonly max: 5000; readonly step: 1000 };
  readonly delayMonths: { readonly min: 0; readonly max: 9; readonly step: 1 };
} = Object.freeze({
  saleAdjustmentBps: Object.freeze({ min: -3000, max: 2000, step: 500 } as const),
  worksOverrunBps: Object.freeze({ min: 0, max: 5000, step: 1000 } as const),
  delayMonths: Object.freeze({ min: 0, max: 9, step: 1 } as const),
});

export type SimulationOutcome =
  | { readonly kind: "payout"; readonly distribution: Distribution; readonly payout: HolderPayout }
  /** O1/H2: capital "por definir". */
  | { readonly kind: "no_distribution"; readonly distribution: NoDistribution }
  /** Colocación 0 (C3). */
  | { readonly kind: "no_placement"; readonly distribution: Distribution }
  | { readonly kind: "invalid" };

export type SimulationResult = {
  readonly basis: "projection";
  /** P' = P ± floor(P × |ajuste|). */
  readonly salePrice: Money;
  /** floor(F × sobrecosto). Nombre del contrato; la base es F completo (Q5 abierta). */
  readonly worksOverrun: Money;
  /** F' = F + worksOverrun. */
  readonly recoveryBudget: Money;
  /** Objetivo + retraso. */
  readonly termMonths: number;
  /** min(held, placed). */
  readonly heldUsed: number;
  readonly outcome: SimulationOutcome;
};

/** Ajustes en 0, colocación actual y `held` participaciones (1 por defecto). */
export function neutralControls(base: SimulationBase, held = 1): SimulationControls {
  return { saleAdjustmentBps: 0, worksOverrunBps: 0, delayMonths: 0, placed: base.placed, held };
}

/** Math.trunc y recorte; NaN/±Infinity → valor neutro. Normaliza −0. */
function clampInt(value: number, min: number, max: number, fallback: number): number {
  const v = Number.isFinite(value) ? Math.trunc(value) : fallback;
  return Math.min(max, Math.max(min, v)) + 0;
}

/** Recorta a los rangos (held a [1, heldMax], placed a [0, total]). Idempotente. Nunca lanza. */
export function normalizeControls(
  base: SimulationBase,
  heldMax: number,
  c: SimulationControls,
): SimulationControls {
  const { saleAdjustmentBps: s, worksOverrunBps: w, delayMonths: d } = SIMULATION_RANGES;
  return {
    saleAdjustmentBps: clampInt(c.saleAdjustmentBps, s.min, s.max, 0),
    worksOverrunBps: clampInt(c.worksOverrunBps, w.min, w.max, 0),
    delayMonths: clampInt(c.delayMonths, d.min, d.max, 0),
    placed: clampInt(c.placed, 0, base.total, base.placed),
    held: clampInt(c.held, 1, Math.max(1, heldMax), 1),
  };
}

/** Montos que pasan por applyPercentageFloor/addMoney: entero de centavos en [0, MAX_MONEY_CENTS]. */
function isAdjustable(m: Money): boolean {
  return Number.isSafeInteger(m.cents) && m.cents >= 0 && m.cents <= MAX_MONEY_CENTS;
}

/** m ± floor(m × |bps|). Precondición: isAdjustable(m) y bps entero en rango. */
function adjustByBps(m: Money, bps: number): Money {
  if (bps === 0) return m;
  const delta = applyPercentageFloor(m, percentage(Math.abs(bps)));
  return bps > 0 ? addMoney(m, delta) : subtractMoney(m, delta);
}

/**
 * Único cálculo del simulador: normaliza (heldMax = total) → calculateDistribution (basis "projection")
 * → calculateHolderPayout(heldUsed). Nunca lanza. Sin Date.
 */
export function simulateProjection(
  base: SimulationBase,
  controls: SimulationControls,
): SimulationResult {
  const c = normalizeControls(base, base.total, controls);
  const termMonths = base.targetTermMonths + c.delayMonths;
  const heldUsed = Math.min(c.held, c.placed);
  if (!isAdjustable(base.salePrice) || !isAdjustable(base.recoveryBudget)) {
    const r = {
      salePrice: base.salePrice,
      worksOverrun: ZERO_USD,
      recoveryBudget: base.recoveryBudget,
    };
    return { basis: "projection", ...r, termMonths, heldUsed, outcome: { kind: "invalid" } };
  }
  const salePrice = adjustByBps(base.salePrice, c.saleAdjustmentBps);
  const worksOverrun = applyPercentageFloor(base.recoveryBudget, percentage(c.worksOverrunBps));
  const recoveryBudget = addMoney(base.recoveryBudget, worksOverrun);
  const done = (outcome: SimulationOutcome): SimulationResult => ({
    basis: "projection",
    salePrice,
    worksOverrun,
    recoveryBudget,
    termMonths,
    heldUsed,
    outcome,
  });

  const calculated = calculateDistribution({
    basis: "projection",
    salePrice,
    acquisitionCost: base.acquisitionCost,
    recoveryBudget,
    saleCosts: base.saleCosts,
    participations: { total: base.total, placed: c.placed, unitPrice: base.unitPrice },
  });
  if (!calculated.ok) return done({ kind: "invalid" });
  const distribution = calculated.value;
  if (distribution.kind === "no_distribution")
    return done({ kind: "no_distribution", distribution });
  if (heldUsed < 1) return done({ kind: "no_placement", distribution });
  const payout = calculateHolderPayout(distribution, heldUsed);
  return done(
    payout.ok ? { kind: "payout", distribution, payout: payout.value } : { kind: "invalid" },
  );
}
