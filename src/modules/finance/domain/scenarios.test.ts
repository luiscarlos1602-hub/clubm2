import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { SCENARIO_ASSUMPTIONS, SCENARIO_IDS, buildScenarios } from "./scenarios";
import type { SimulationBase, SimulationOutcome } from "./simulator";

// M2-006: P 76.000 · C 50.000 · F 10.000 · O 2.280 · 63 de 100 colocadas.
const M2_006: SimulationBase = {
  salePrice: usdUnits(76_000),
  acquisitionCost: usdUnits(50_000),
  recoveryBudget: usdUnits(10_000),
  saleCosts: usdUnits(2_280),
  total: 100,
  unitPrice: usdUnits(100),
  placed: 63,
  targetTermMonths: 3,
};

const gainOf = (o: SimulationOutcome) => (o.kind === "payout" ? o.payout.gain : null);

describe("escenarios fijos [SUPUESTO Q3]", () => {
  it("supuestos: conservador venta −10 % y obra +20 %; base 0; optimista venta +5 %", () => {
    expect(SCENARIO_ASSUMPTIONS).toEqual({
      conservative: { saleAdjustmentBps: -1000, worksOverrunBps: 2000 },
      base: { saleAdjustmentBps: 0, worksOverrunBps: 0 },
      optimistic: { saleAdjustmentBps: 500, worksOverrunBps: 0 },
    });
  });

  it("3 filas en el orden de SCENARIO_IDS", () => {
    expect(buildScenarios(M2_006).map((r) => r.id)).toEqual([...SCENARIO_IDS]);
  });

  it("M2-006, 1 participación: conservador USD 10,30 · base USD 34,30 · optimista USD 43,80 (sobrecosto sobre F)", () => {
    const [conservative, base, optimistic] = buildScenarios(M2_006);
    expect(conservative?.salePrice).toEqual(usdUnits(68_400));
    expect(gainOf(conservative!.outcome)).toEqual(usd(1_030));
    expect(base?.salePrice).toEqual(usdUnits(76_000));
    expect(gainOf(base!.outcome)).toEqual(usd(3_430));
    expect(optimistic?.salePrice).toEqual(usdUnits(79_800));
    expect(gainOf(optimistic!.outcome)).toEqual(usd(4_380));
  });

  it("excedente negativo en un escenario → loss en esa fila (ADR-019)", () => {
    const tight = { ...M2_006, salePrice: usdUnits(64_000) };
    const kinds = buildScenarios(tight).map((r) => r.outcome.kind);
    expect(kinds).toEqual(["loss", "payout", "payout"]);
  });
});
