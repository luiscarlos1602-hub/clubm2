import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import { applyStressPreset } from "./stress-presets";
import {
  neutralControls,
  simulateProjection,
  type SimulationBase,
  type SimulationResult,
} from "./simulator";

// Entradas de C1 (docs/02 §4): P 40.000 · C 10.000 · F 10.000 · O 0 · 100 × USD 100.
const C1: SimulationBase = {
  salePrice: usdUnits(40_000),
  acquisitionCost: usdUnits(10_000),
  recoveryBudget: usdUnits(10_000),
  saleCosts: usd(0),
  total: 100,
  unitPrice: usdUnits(100),
  placed: 100,
  targetTermMonths: 3,
};

function payoutOf(r: SimulationResult) {
  if (r.outcome.kind !== "payout") throw new Error(`se esperaba payout y llegó ${r.outcome.kind}`);
  return r.outcome;
}

describe("simulateProjection contra el motor (CA5, docs/02 §4)", () => {
  it("C1: colocación 100 → excedente 20.000 · fondo 5.000 · 50 por participación · cobro 100 + 50", () => {
    const r = simulateProjection(C1, neutralControls(C1));
    expect(r.basis).toBe("projection");
    const { distribution: d, payout } = payoutOf(r);
    expect(d.basis).toBe("projection");
    expect(d.surplus).toEqual(usdUnits(20_000));
    expect(d.fund).toEqual(usdUnits(5_000));
    expect(d.perParticipation).toEqual(usdUnits(50));
    expect(d.toExternal).toEqual(usdUnits(5_000));
    expect(d.companyFromFund).toEqual(usd(0));
    expect(d.companyDirect).toEqual(usdUnits(15_000));
    expect(payout.capital).toEqual(usdUnits(100));
    expect(payout.gain).toEqual(usdUnits(50));
    expect(payout.total).toEqual(usdUnits(150));
  });

  it("C2: colocación 50 → externos 2.500 · empresa del fondo 2.500", () => {
    const base = { ...C1, placed: 50 };
    const { distribution: d } = payoutOf(simulateProjection(base, neutralControls(base)));
    expect(d.toExternal).toEqual(usdUnits(2_500));
    expect(d.companyFromFund).toEqual(usdUnits(2_500));
  });

  it("C3: colocación 0 (preset placement-0) → no_placement · externos 0 · empresa del fondo 5.000", () => {
    const r = simulateProjection(C1, applyStressPreset(C1, neutralControls(C1), "placement-0"));
    expect(r.heldUsed).toBe(0);
    expect(r.outcome.kind).toBe("no_placement");
    if (r.outcome.kind !== "no_placement" || r.outcome.distribution.kind !== "distributed") return;
    expect(r.outcome.distribution.toExternal).toEqual(usd(0));
    expect(r.outcome.distribution.companyFromFund).toEqual(usdUnits(5_000));
    expect(r.outcome.distribution.companyDirect).toEqual(usdUnits(15_000));
  });

  it("C4: P 30.000 y O 1.000 → 22,50 por participación", () => {
    const base = { ...C1, salePrice: usdUnits(30_000), saleCosts: usdUnits(1_000) };
    const { distribution: d, payout } = payoutOf(simulateProjection(base, neutralControls(base)));
    expect(d.surplus).toEqual(usdUnits(9_000));
    expect(d.fund).toEqual(usdUnits(2_250));
    expect(d.perParticipation).toEqual(usd(2_250));
    expect(d.companyDirect).toEqual(usdUnits(6_750));
    expect(payout.gain).toEqual(usd(2_250));
  });

  it("C5: P 19.000 → loss · pérdida 1.000 · 2,50 por participación · devuelve 97,50 (ADR-019)", () => {
    const base = { ...C1, salePrice: usdUnits(19_000) };
    const r = simulateProjection(base, neutralControls(base));
    expect(r.outcome.kind).toBe("loss");
    if (r.outcome.kind !== "loss") return;
    expect(r.outcome.distribution.surplus).toEqual(usdUnits(-1_000));
    expect(r.outcome.distribution.lossPerParticipation).toEqual(usd(250));
    expect(r.outcome.payout).toMatchObject({
      result: "loss",
      loss: usd(250),
      capitalReturned: usd(9_750),
      gain: usd(0),
      total: usd(9_750),
    });
  });

  it("C5 sin colocadas → no_placement con la pérdida calculada", () => {
    const base = { ...C1, salePrice: usdUnits(19_000), placed: 0 };
    const r = simulateProjection(base, neutralControls(base));
    expect(r.outcome.kind).toBe("no_placement");
    if (r.outcome.kind !== "no_placement") return;
    expect(r.outcome.distribution.kind).toBe("loss");
  });

  it("C6: colocación 63 → externos 3.150 · empresa del fondo 1.850 · empresa 75 % 15.000 · cobro 150", () => {
    const base = { ...C1, placed: 63 };
    const { distribution: d, payout } = payoutOf(simulateProjection(base, neutralControls(base)));
    expect(d.toExternal).toEqual(usdUnits(3_150));
    expect(d.companyFromFund).toEqual(usdUnits(1_850));
    expect(d.companyDirect).toEqual(usdUnits(15_000));
    expect(payout.total).toEqual(usdUnits(150));
  });
});

describe("estrés sobre C1 (maestro §7)", () => {
  it("sale-20 → P 32.000 y excedente 12.000", () => {
    const r = simulateProjection(C1, applyStressPreset(C1, neutralControls(C1), "sale-20"));
    expect(r.salePrice).toEqual(usdUnits(32_000));
    expect(payoutOf(r).distribution.surplus).toEqual(usdUnits(12_000));
  });

  it("sobrecosto +50 % se aplica a todo F (decisión del usuario, Q5 abierta) → F' 15.000", () => {
    const r = simulateProjection(C1, { ...neutralControls(C1), worksOverrunBps: 5000 });
    expect(r.worksOverrun).toEqual(usdUnits(5_000));
    expect(r.recoveryBudget).toEqual(usdUnits(15_000));
    expect(payoutOf(r).distribution.surplus).toEqual(usdUnits(15_000));
  });

  it("delay-6 → plazo 9 meses con el excedente igual [SUPUESTO Q2]", () => {
    const r = simulateProjection(C1, applyStressPreset(C1, neutralControls(C1), "delay-6"));
    expect(r.termMonths).toBe(9);
    expect(payoutOf(r).distribution.surplus).toEqual(usdUnits(20_000));
  });

  it("held > colocadas → heldUsed = colocadas [SUPUESTO P4-12]", () => {
    const base = { ...C1, placed: 3 };
    const r = simulateProjection(base, { ...neutralControls(base), held: 5 });
    expect(r.heldUsed).toBe(3);
    expect(payoutOf(r).payout.gain).toEqual(usdUnits(150));
  });
});

// M2-006 (semilla chacao_02): P 76.000 · C 50.000 · F 10.000 · O 2.280 · 63 de 100 colocadas.
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

describe("cifras de la ficha M2-006 (CA3)", () => {
  it("estado inicial → ganancia USD 34,30 · cobro USD 134,30", () => {
    const { payout } = payoutOf(simulateProjection(M2_006, neutralControls(M2_006)));
    expect(payout.gain).toEqual(usd(3_430));
    expect(payout.total).toEqual(usd(13_430));
  });

  it("sale-20 → pérdida (escenario); placement-0 → sin colocación", () => {
    const sale = simulateProjection(
      M2_006,
      applyStressPreset(M2_006, neutralControls(M2_006), "sale-20"),
    );
    expect(sale.outcome.kind).toBe("loss");
    const none = simulateProjection(
      M2_006,
      applyStressPreset(M2_006, neutralControls(M2_006), "placement-0"),
    );
    expect(none.outcome.kind).toBe("no_placement");
  });

  it("sobrecosto +20 % sobre F → USD 29,30 (como la maqueta)", () => {
    const r = simulateProjection(M2_006, { ...neutralControls(M2_006), worksOverrunBps: 2000 });
    expect(payoutOf(r).payout.gain).toEqual(usd(2_930));
  });

  it("delay-6 → 9 meses y la ganancia sigue en USD 34,30", () => {
    const r = simulateProjection(
      M2_006,
      applyStressPreset(M2_006, neutralControls(M2_006), "delay-6"),
    );
    expect(r.termMonths).toBe(9);
    expect(payoutOf(r).payout.gain).toEqual(usd(3_430));
  });
});
