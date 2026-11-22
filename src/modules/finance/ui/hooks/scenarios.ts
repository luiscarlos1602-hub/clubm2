import { SCENARIOS, neutralControls, simulate, type ScenarioId, type SimulatorBase, type SimulatorOutcome } from "./simulate";
import type { Money } from "@/shared/domain/money";

export type ScenarioRow = {
  readonly id: ScenarioId;
  readonly salePrice: Money;
  readonly outcome: SimulatorOutcome;
};

/** Escenarios conservador/base/optimista derivados con el motor para 1 participación [SUPUESTO P4-1]. */
export function buildScenarioRows(base: SimulatorBase): readonly ScenarioRow[] {
  return SCENARIOS.map((s) => {
    const result = simulate(base, { ...neutralControls(base, 1), salePct: s.salePct, overrunPct: s.overrunPct });
    return { id: s.id, salePrice: result.salePrice, outcome: result.outcome };
  });
}
