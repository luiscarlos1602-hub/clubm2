import { neutralControls, type SimulationBase, type SimulationControls } from "./simulator";

/**
 * Presets de estrés (maestro §7, docs/02 §4). Los ids fijan los data-testid de la maqueta.
 * Los de sobrecosto de obra (works-20, works-50) se quitaron por decisión del usuario (22-nov);
 * el control de sobrecosto sigue en el simulador.
 */
export const STRESS_PRESET_IDS = [
  "base",
  "sale-20",
  "delay-3",
  "delay-6",
  "delay-9",
  "placement-0",
] as const;
export type StressPresetId = (typeof STRESS_PRESET_IDS)[number];

export type StressPresetPatch = Partial<
  Pick<SimulationControls, "saleAdjustmentBps" | "worksOverrunBps" | "delayMonths" | "placed">
>;

export const STRESS_PRESETS: Readonly<Record<StressPresetId, StressPresetPatch>> = Object.freeze({
  base: Object.freeze({}),
  "sale-20": Object.freeze({ saleAdjustmentBps: -2000 }),
  "delay-3": Object.freeze({ delayMonths: 3 }),
  "delay-6": Object.freeze({ delayMonths: 6 }),
  "delay-9": Object.freeze({ delayMonths: 9 }),
  "placement-0": Object.freeze({ placed: 0 }),
});

/** neutralControls(base, current.held) + el parche del preset (un preset a la vez). */
export function applyStressPreset(
  base: SimulationBase,
  current: SimulationControls,
  id: StressPresetId,
): SimulationControls {
  return { ...neutralControls(base, current.held), ...STRESS_PRESETS[id] };
}
