import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import {
  applyStressPreset,
  neutralControls,
  simulate,
  type SimulatorBase,
} from "./simulate";

// Entradas de C1 y C6 (docs/02 §4): P 40.000 · C 10.000 · F 10.000 · O 0 · 100 × USD 100.
const CANONICAL: SimulatorBase = {
  salePrice: usdUnits(40_000),
  acquisitionCost: usdUnits(10_000),
  recoveryBudget: usdUnits(10_000),
  saleCosts: usd(0),
  total: 100,
  unitPrice: usdUnits(100),
  placed: 100,
  targetTermMonths: 3,
};

describe("simulador de la ficha contra el motor", () => {
  it("C1: colocación 100 → excedente 20.000, fondo 5.000, 50 por participación, cobro 100 + 50", () => {
    const r = simulate(CANONICAL, neutralControls(CANONICAL, 1));
    expect(r.outcome.kind).toBe("payout");
    if (r.outcome.kind !== "payout") return;
    const { distribution: d, payout } = r.outcome;
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

  it("C6: colocación 63 → externos 3.150, empresa por fondo 1.850, empresa 75 % 15.000", () => {
    const base = { ...CANONICAL, placed: 63 };
    const r = simulate(base, neutralControls(base, 1));
    expect(r.outcome.kind).toBe("payout");
    if (r.outcome.kind !== "payout") return;
    const { distribution: d, payout } = r.outcome;
    expect(d.toExternal).toEqual(usdUnits(3_150));
    expect(d.companyFromFund).toEqual(usdUnits(1_850));
    expect(d.companyDirect).toEqual(usdUnits(15_000));
    expect(payout.total).toEqual(usdUnits(150));
  });

  it("C5: en pérdida no hay reparto ni cobro", () => {
    const base = { ...CANONICAL, salePrice: usdUnits(19_000) };
    expect(simulate(base, neutralControls(base)).outcome.kind).toBe("no_distribution");
  });

  it("estrés: venta −20 % sobre 40.000 deja 32.000 y excedente 12.000", () => {
    const r = simulate(CANONICAL, applyStressPreset(CANONICAL, neutralControls(CANONICAL), "sale-20"));
    expect(r.salePrice).toEqual(usdUnits(32_000));
    if (r.outcome.kind !== "payout") throw new Error("se esperaba reparto");
    expect(r.outcome.distribution.surplus).toEqual(usdUnits(12_000));
  });

  it("estrés: obra +50 % lleva F a 15.000; retraso solo alarga el plazo", () => {
    const works = simulate(CANONICAL, applyStressPreset(CANONICAL, neutralControls(CANONICAL), "works-50"));
    expect(works.recoveryBudget).toEqual(usdUnits(15_000));
    const delay = simulate(CANONICAL, applyStressPreset(CANONICAL, neutralControls(CANONICAL), "delay-6"));
    expect(delay.termMonths).toBe(9);
    if (delay.outcome.kind !== "payout") throw new Error("se esperaba reparto");
    expect(delay.outcome.distribution.surplus).toEqual(usdUnits(20_000));
  });

  it("estrés: colocación 0 % no deja cobro externo y el fondo queda en la empresa (C3)", () => {
    const r = simulate(CANONICAL, applyStressPreset(CANONICAL, neutralControls(CANONICAL), "placement-0"));
    expect(r.outcome.kind).toBe("no_placement");
    if (r.outcome.kind !== "no_placement") return;
    expect(r.outcome.distribution.toExternal).toEqual(usd(0));
    expect(r.outcome.distribution.companyFromFund).toEqual(usdUnits(5_000));
  });

  it("invariante: fondo + empresa = excedente al centavo", () => {
    const r = simulate(CANONICAL, { ...neutralControls(CANONICAL, 7), salePct: -5, overrunPct: 10 });
    if (r.outcome.kind !== "payout") throw new Error("se esperaba reparto");
    const d = r.outcome.distribution;
    expect(d.toExternal.cents + d.companyTotal.cents).toBe(d.surplus.cents);
  });
});
