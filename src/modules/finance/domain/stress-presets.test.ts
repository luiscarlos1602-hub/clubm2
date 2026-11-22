import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { STRESS_PRESETS, STRESS_PRESET_IDS, applyStressPreset } from "./stress-presets";
import { neutralControls, type SimulationBase, type SimulationControls } from "./simulator";

const BASE: SimulationBase = {
  salePrice: usdUnits(40_000),
  acquisitionCost: usdUnits(10_000),
  recoveryBudget: usdUnits(10_000),
  saleCosts: usd(0),
  total: 100,
  unitPrice: usdUnits(100),
  placed: 63,
  targetTermMonths: 3,
};

const MOVED: SimulationControls = {
  saleAdjustmentBps: 1500,
  worksOverrunBps: 3000,
  delayMonths: 4,
  placed: 80,
  held: 7,
};

describe("presets de estrés (maestro §7; decisión del usuario 22-nov)", () => {
  it("los ids son los de la maqueta sin los de sobrecosto de obra (protegen los data-testid)", () => {
    expect([...STRESS_PRESET_IDS]).toEqual([
      "base",
      "sale-20",
      "delay-3",
      "delay-6",
      "delay-9",
      "placement-0",
    ]);
    expect(Object.keys(STRESS_PRESETS).sort()).toEqual([...STRESS_PRESET_IDS].sort());
  });

  it("base = neutralControls conservando held", () => {
    expect(applyStressPreset(BASE, MOVED, "base")).toEqual(neutralControls(BASE, 7));
  });

  it("cada preset parte de los valores neutros, cambia solo su variable y conserva held", () => {
    const expected: Record<string, Partial<SimulationControls>> = {
      "sale-20": { saleAdjustmentBps: -2000 },
      "delay-3": { delayMonths: 3 },
      "delay-6": { delayMonths: 6 },
      "delay-9": { delayMonths: 9 },
      "placement-0": { placed: 0 },
    };
    for (const [id, patch] of Object.entries(expected)) {
      const c = applyStressPreset(BASE, MOVED, id as (typeof STRESS_PRESET_IDS)[number]);
      expect(c).toEqual({ ...neutralControls(BASE, 7), ...patch });
    }
  });

  it("los presets no se acumulan: aplicar uno después de otro solo deja el último", () => {
    const first = applyStressPreset(BASE, MOVED, "sale-20");
    expect(applyStressPreset(BASE, first, "delay-6")).toEqual({
      ...neutralControls(BASE, 7),
      delayMonths: 6,
    });
  });
});
