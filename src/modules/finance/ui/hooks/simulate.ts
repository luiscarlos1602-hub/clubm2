import { calculateDistribution, type Distribution, type NoDistribution } from "../../domain/distribution";
import { calculateHolderPayout, type HolderPayout } from "../../domain/holder-payout";
import {
  addMoney,
  applyPercentageFloor,
  subtractMoney,
  type Money,
} from "@/shared/domain/money";
import { percentage } from "@/shared/domain/percentage";

/** Supuestos base del proyecto (todo proyección): vienen del container, nunca de la pantalla. */
export type SimulatorBase = {
  readonly salePrice: Money;
  readonly acquisitionCost: Money;
  readonly recoveryBudget: Money;
  readonly saleCosts: Money;
  readonly total: number;
  readonly unitPrice: Money;
  /** Colocación actual de la clase. */
  readonly placed: number;
  /** Plazo objetivo en meses (proyección). */
  readonly targetTermMonths: number;
};

export type SimulatorControls = {
  /** Variación del precio de venta sobre el objetivo, en % entero (−30…+20). */
  readonly salePct: number;
  /** Sobrecosto de obra sobre el presupuesto de reforma, en % entero (0…50). */
  readonly overrunPct: number;
  /** Retraso en meses (0…9): solo alarga el plazo proyectado [SUPUESTO P4-2]. */
  readonly delayMonths: number;
  /** Colocación total (0…total). */
  readonly placed: number;
  /** Participaciones del usuario (1…20). */
  readonly held: number;
};

export type SimulatorOutcome =
  | { readonly kind: "payout"; readonly distribution: Distribution; readonly payout: HolderPayout }
  | { readonly kind: "no_distribution"; readonly distribution: NoDistribution }
  | { readonly kind: "no_placement"; readonly distribution: Distribution }
  | { readonly kind: "invalid" };

export type SimulatorResult = {
  readonly salePrice: Money;
  readonly recoveryBudget: Money;
  readonly termMonths: number;
  /** Participaciones efectivamente consideradas (nunca más que la colocación). */
  readonly heldUsed: number;
  readonly outcome: SimulatorOutcome;
};

/** m ± pct % (pct entero). Redondeo hacia abajo del delta, vía shared/domain/money. */
export function adjustByPercent(m: Money, pct: number): Money {
  if (pct === 0) return m;
  const delta = applyPercentageFloor(m, percentage(Math.abs(pct) * 100));
  return pct > 0 ? addMoney(m, delta) : subtractMoney(m, delta);
}

export function neutralControls(base: SimulatorBase, held = 1): SimulatorControls {
  return { salePct: 0, overrunPct: 0, delayMonths: 0, placed: base.placed, held };
}

/** Todo número sale de calculateDistribution / calculateHolderPayout (motor único). */
export function simulate(base: SimulatorBase, controls: SimulatorControls): SimulatorResult {
  const salePrice = adjustByPercent(base.salePrice, controls.salePct);
  const recoveryBudget = adjustByPercent(base.recoveryBudget, controls.overrunPct);
  const heldUsed = Math.min(controls.held, controls.placed);
  const termMonths = base.targetTermMonths + controls.delayMonths;
  const calculated = calculateDistribution({
    basis: "projection",
    salePrice,
    acquisitionCost: base.acquisitionCost,
    recoveryBudget,
    saleCosts: base.saleCosts,
    participations: { total: base.total, placed: controls.placed, unitPrice: base.unitPrice },
  });
  const done = (outcome: SimulatorOutcome): SimulatorResult => ({ salePrice, recoveryBudget, termMonths, heldUsed, outcome });
  if (!calculated.ok) return done({ kind: "invalid" });
  const distribution = calculated.value;
  if (distribution.kind === "no_distribution") return done({ kind: "no_distribution", distribution });
  if (heldUsed < 1) return done({ kind: "no_placement", distribution });
  const payout = calculateHolderPayout(distribution, heldUsed);
  return done(payout.ok ? { kind: "payout", distribution, payout: payout.value } : { kind: "invalid" });
}

export const SALE_RANGE = { min: -30, max: 20, step: 5 } as const;
export const OVERRUN_RANGE = { min: 0, max: 50, step: 10 } as const;
export const DELAY_RANGE = { min: 0, max: 9, step: 1 } as const;

/** Presets de estrés (maestro §7, docs/02 §4). Cada uno parte del escenario base. */
export const STRESS_PRESETS = [
  { id: "base", patch: {} },
  { id: "sale-20", patch: { salePct: -20 } },
  { id: "works-20", patch: { overrunPct: 20 } },
  { id: "works-50", patch: { overrunPct: 50 } },
  { id: "delay-3", patch: { delayMonths: 3 } },
  { id: "delay-6", patch: { delayMonths: 6 } },
  { id: "delay-9", patch: { delayMonths: 9 } },
  { id: "placement-0", patch: { placed: 0 } },
] as const;
export type StressPresetId = (typeof STRESS_PRESETS)[number]["id"];

export function applyStressPreset(base: SimulatorBase, controls: SimulatorControls, id: StressPresetId): SimulatorControls {
  const preset = STRESS_PRESETS.find((p) => p.id === id);
  return { ...neutralControls(base, controls.held), ...preset?.patch };
}

/** Escenarios fijos [SUPUESTO P4-1]: venta y sobrecosto con deltas documentados. */
export const SCENARIOS = [
  { id: "conservative", salePct: -10, overrunPct: 20 },
  { id: "base", salePct: 0, overrunPct: 0 },
  { id: "optimistic", salePct: 5, overrunPct: 0 },
] as const;
export type ScenarioId = (typeof SCENARIOS)[number]["id"];
