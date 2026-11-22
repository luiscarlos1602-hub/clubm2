import type { Money } from "@/shared/domain/money";
import {
  neutralControls,
  simulateProjection,
  type SimulationBase,
  type SimulationOutcome,
} from "./simulator";

export const SCENARIO_IDS = ["conservative", "base", "optimistic"] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

/** [SUPUESTO Q3] Deltas sobre la base, en puntos básicos. El sobrecosto se aplica a todo F (Q5 abierta). */
export const SCENARIO_ASSUMPTIONS: Readonly<
  Record<ScenarioId, { readonly saleAdjustmentBps: number; readonly worksOverrunBps: number }>
> = Object.freeze({
  conservative: Object.freeze({ saleAdjustmentBps: -1000, worksOverrunBps: 2000 }),
  base: Object.freeze({ saleAdjustmentBps: 0, worksOverrunBps: 0 }),
  optimistic: Object.freeze({ saleAdjustmentBps: 500, worksOverrunBps: 0 }),
});

export type ScenarioRow = {
  readonly id: ScenarioId;
  readonly salePrice: Money;
  readonly outcome: SimulationOutcome;
};

/** Derivados con el motor (nunca sembrados): 1 participación, colocación actual y retraso 0. */
export function buildScenarios(base: SimulationBase): readonly ScenarioRow[] {
  return SCENARIO_IDS.map((id) => {
    const result = simulateProjection(base, {
      ...neutralControls(base, 1),
      ...SCENARIO_ASSUMPTIONS[id],
    });
    return { id, salePrice: result.salePrice, outcome: result.outcome };
  });
}
