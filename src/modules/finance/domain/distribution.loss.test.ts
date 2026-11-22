import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import {
  calculateDistribution,
  type Distribution,
  type DistributionInput,
  type LossDistribution,
} from "./distribution";

/** Casos de docs/02 §4 (ADR-019) en centavos: precio 10.000 ¢, total 100. */
function input(p: {
  P: number;
  C?: number;
  F?: number;
  O?: number;
  placed?: number;
}): DistributionInput {
  return {
    basis: "realized",
    salePrice: usd(p.P),
    acquisitionCost: usd(p.C ?? 1_000_000),
    recoveryBudget: usd(p.F ?? 1_000_000),
    saleCosts: usd(p.O ?? 0),
    participations: { total: 100, placed: p.placed ?? 100, unitPrice: usd(10_000) },
  };
}

function loss(i: DistributionInput): LossDistribution {
  const r = calculateDistribution(i);
  if (!r.ok || r.value.kind !== "loss") throw new Error("se esperaba pérdida");
  return r.value;
}

function distributed(i: DistributionInput): Distribution {
  const r = calculateDistribution(i);
  if (!r.ok || r.value.kind !== "distributed") throw new Error("se esperaba reparto");
  return r.value;
}

type Expected = {
  loss: number;
  pool: number;
  lossPer: number;
  residue: number;
  capExcess: number;
  shortfall: number;
  returnPer: number;
  external: number;
  company: number;
  externalLoss: number;
  companyLoss: number;
};

function expectLoss(d: LossDistribution, e: Expected): void {
  expect(d.surplus).toEqual(usd(-e.loss));
  expect(d.loss).toEqual(usd(e.loss));
  expect(d.investorsLossPool).toEqual(usd(e.pool));
  expect(d.lossPerParticipation).toEqual(usd(e.lossPer));
  expect(d.roundingResidue).toEqual(usd(e.residue));
  expect(d.capExcess).toEqual(usd(e.capExcess));
  expect(d.proceedsShortfall).toEqual(usd(e.shortfall));
  expect(d.returnPerParticipation).toEqual(usd(e.returnPer));
  expect(d.returned).toEqual({ external: usd(e.external), company: usd(e.company) });
  expect(d.externalLoss).toEqual(usd(e.externalLoss));
  expect(d.companyLoss).toEqual(usd(e.companyLoss));
}

describe("finance · pérdidas espejo 25/75 (ADR-019, docs/02 §4)", () => {
  it("C5 · P 19.000 → pérdida 1.000, 2,50 por participación, devolución 97,50", () => {
    const d = loss(input({ P: 1_900_000 }));
    expectLoss(d, {
      loss: 100_000,
      pool: 25_000,
      lossPer: 250,
      residue: 0,
      capExcess: 0,
      shortfall: 0,
      returnPer: 9_750,
      external: 975_000,
      company: 925_000,
      externalLoss: 25_000,
      companyLoss: 75_000,
    });
    expect(d.basis).toBe("realized");
    expect(d.participations).toEqual({
      total: 100,
      placed: 100,
      retained: 0,
      unitPrice: usd(10_000),
    });
    expect(d.capital).toEqual({ external: usd(1_000_000), company: usd(1_000_000) });
  });

  it("C7 · colocación parcial 40/100 → externos 3.900, empresa 15.100", () => {
    const d = loss(input({ P: 1_900_000, placed: 40 }));
    expectLoss(d, {
      loss: 100_000,
      pool: 25_000,
      lossPer: 250,
      residue: 0,
      capExcess: 0,
      shortfall: 0,
      returnPer: 9_750,
      external: 390_000,
      company: 1_510_000,
      externalLoss: 10_000,
      companyLoss: 90_000,
    });
    expect(d.capital).toEqual({ external: usd(400_000), company: usd(1_600_000) });
  });

  it("C8 · tope: la pérdida agota el aporte, el exceso lo absorbe la empresa", () => {
    const d = loss(input({ P: 6_000_000, C: 10_000_000 }));
    expectLoss(d, {
      loss: 5_000_000,
      pool: 1_250_000,
      lossPer: 10_000,
      residue: 0,
      capExcess: 250_000,
      shortfall: 0,
      returnPer: 0,
      external: 0,
      company: 6_000_000,
      externalLoss: 1_000_000,
      companyLoss: 4_000_000,
    });
  });

  it("C9 · residuo de redondeo del 25 % a la empresa (K1 en pérdida)", () => {
    const d = loss(input({ P: 1_900_000, O: 40 }));
    expectLoss(d, {
      loss: 100_040,
      pool: 25_010,
      lossPer: 250,
      residue: 10,
      capExcess: 0,
      shortfall: 0,
      returnPer: 9_750,
      external: 975_000,
      company: 924_960,
      externalLoss: 25_000,
      companyLoss: 75_040,
    });
  });

  it("C10 · excedente cero: se recupera el aporte, sin ganancia", () => {
    const d = distributed(input({ P: 2_000_000 }));
    expect(d.surplus).toEqual(usd(0));
    for (const m of [d.fund, d.perParticipation, d.roundingResidue, d.toExternal, d.companyTotal]) {
      expect(m).toEqual(usd(0));
    }
    expect(d.capital).toEqual({ external: usdUnits(10_000), company: usdUnits(10_000) });
  });

  it("C11 · borde W5-1 (b): la venta no alcanza, externos reciben todo P − O y la empresa 0", () => {
    const d = loss(input({ P: 500_000 }));
    expectLoss(d, {
      loss: 1_500_000,
      pool: 375_000,
      lossPer: 5_000,
      residue: 0,
      capExcess: 0,
      shortfall: 125_000,
      returnPer: 5_000,
      external: 500_000,
      company: 0,
      externalLoss: 500_000,
      companyLoss: 1_000_000,
    });
  });

  it("Borde W5-1 · el residuo de repartir P − O entre colocadas va a la empresa", () => {
    // P − O = 10,01 entre 3 colocadas: 3,33 cada una, 0,02 a la empresa (espejo pedía 50,03).
    const d = loss(input({ P: 1_001, placed: 3 }));
    expect(d.returnPerParticipation).toEqual(usd(333));
    expect(d.returned).toEqual({ external: usd(999), company: usd(2) });
    expect(d.proceedsShortfall).toEqual(usd((5_003 - 333) * 3));
  });

  it("Borde · sin colocadas la empresa recibe todo P − O", () => {
    const d = loss(input({ P: 1_900_000, placed: 0 }));
    expect(d.returned).toEqual({ external: usd(0), company: usd(1_900_000) });
    expect(d.externalLoss).toEqual(usd(0));
    expect(d.companyLoss).toEqual(usd(100_000));
  });

  it("Borde · pérdida de 1 centavo: el 25 % redondeado hacia abajo no toca al inversionista", () => {
    const d = loss(input({ P: 1_999_999 }));
    expect(d.investorsLossPool).toEqual(usd(0));
    expect(d.lossPerParticipation).toEqual(usd(0));
    expect(d.returnPerParticipation).toEqual(usd(10_000));
    expect(d.companyLoss).toEqual(usd(1));
  });
});
