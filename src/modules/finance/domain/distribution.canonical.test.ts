import { describe, expect, it } from "vitest";
import { usd } from "@/shared/domain/money";
import {
  calculateDistribution,
  type Distribution,
  type DistributionInput,
  type DistributionOutcome,
} from "./distribution";

/** Casos de docs/02 §4 en centavos: precio 10.000 ¢, total 100, C = F = 1.000.000 ¢. */
function input(salePrice: number, saleCosts: number, placed: number): DistributionInput {
  return {
    basis: "projection",
    salePrice: usd(salePrice),
    acquisitionCost: usd(1_000_000),
    recoveryBudget: usd(1_000_000),
    saleCosts: usd(saleCosts),
    participations: { total: 100, placed, unitPrice: usd(10_000) },
  };
}

function outcomeOf(i: DistributionInput): DistributionOutcome {
  const r = calculateDistribution(i);
  if (!r.ok) throw new Error(`entrada inválida: ${r.error.code}`);
  return r.value;
}

function distributed(i: DistributionInput): Distribution {
  const o = outcomeOf(i);
  if (o.kind !== "distributed") throw new Error("se esperaba reparto");
  return o;
}

type Expected = {
  surplus: number;
  fund: number;
  perParticipation: number;
  toExternal: number;
  companyFromFund: number;
  companyDirect: number;
  capitalExternal: number;
  capitalCompany: number;
};

function expectDistribution(d: Distribution, e: Expected): void {
  expect(d.surplus).toEqual(usd(e.surplus));
  expect(d.fund).toEqual(usd(e.fund));
  expect(d.perParticipation).toEqual(usd(e.perParticipation));
  expect(d.toExternal).toEqual(usd(e.toExternal));
  expect(d.companyFromFund).toEqual(usd(e.companyFromFund));
  expect(d.companyDirect).toEqual(usd(e.companyDirect));
  expect(d.capital.external).toEqual(usd(e.capitalExternal));
  expect(d.capital.company).toEqual(usd(e.capitalCompany));
  expect(d.roundingResidue).toEqual(usd(0));
  expect(d.companyTotal).toEqual(usd(e.companyDirect + e.companyFromFund));
}

describe("finance · casos canónicos (docs/02 §4)", () => {
  it("C1 · colocación total 100/100", () => {
    const d = distributed(input(4_000_000, 0, 100));
    expectDistribution(d, {
      surplus: 2_000_000,
      fund: 500_000,
      perParticipation: 5_000,
      toExternal: 500_000,
      companyFromFund: 0,
      companyDirect: 1_500_000,
      capitalExternal: 1_000_000,
      capitalCompany: 1_000_000,
    });
    expect(d.basis).toBe("projection");
    expect(d.participations).toEqual({
      total: 100,
      placed: 100,
      retained: 0,
      unitPrice: usd(10_000),
    });
  });

  it("C2 · colocación parcial 50/100", () => {
    const d = distributed(input(4_000_000, 0, 50));
    expectDistribution(d, {
      surplus: 2_000_000,
      fund: 500_000,
      perParticipation: 5_000,
      toExternal: 250_000,
      companyFromFund: 250_000,
      companyDirect: 1_500_000,
      capitalExternal: 500_000,
      capitalCompany: 1_500_000,
    });
    expect(d.participations.retained).toBe(50);
  });

  it("C3 · sin colocación 0/100", () => {
    expectDistribution(distributed(input(4_000_000, 0, 0)), {
      surplus: 2_000_000,
      fund: 500_000,
      perParticipation: 5_000,
      toExternal: 0,
      companyFromFund: 500_000,
      companyDirect: 1_500_000,
      capitalExternal: 0,
      capitalCompany: 2_000_000,
    });
  });

  it("C4 · venta con costos de 1.000", () => {
    expectDistribution(distributed(input(3_000_000, 100_000, 100)), {
      surplus: 900_000,
      fund: 225_000,
      perParticipation: 2_250,
      toExternal: 225_000,
      companyFromFund: 0,
      companyDirect: 675_000,
      capitalExternal: 1_000_000,
      capitalCompany: 1_000_000,
    });
  });

  it("C5 · excedente negativo → pérdida espejo 25/75 (detalle en distribution.loss.test.ts)", () => {
    const o = outcomeOf(input(1_900_000, 0, 100));
    expect(o.kind).toBe("loss");
    expect(o.surplus).toEqual(usd(-100_000));
  });

  it("C6 · colocación 63/100", () => {
    expectDistribution(distributed(input(4_000_000, 0, 63)), {
      surplus: 2_000_000,
      fund: 500_000,
      perParticipation: 5_000,
      toExternal: 315_000,
      companyFromFund: 185_000,
      companyDirect: 1_500_000,
      capitalExternal: 630_000,
      capitalCompany: 1_370_000,
    });
  });
});

describe("finance · redondeo y bordes", () => {
  it("K1 · residuo de redondeo a la empresa", () => {
    const d = distributed(input(3_000_004, 100_000, 100));
    expect(d.surplus).toEqual(usd(900_004));
    expect(d.fund).toEqual(usd(225_001));
    expect(d.perParticipation).toEqual(usd(2_250));
    expect(d.toExternal).toEqual(usd(225_000));
    expect(d.roundingResidue).toEqual(usd(1));
    expect(d.companyFromFund).toEqual(usd(1));
    expect(d.companyDirect).toEqual(usd(675_003));
    expect(d.companyTotal).toEqual(usd(675_004));
  });

  it("K1 · fondo menor a un centavo", () => {
    const d = distributed(input(2_000_001, 0, 100));
    expect(d.surplus).toEqual(usd(1));
    expect(d.fund).toEqual(usd(0));
    expect(d.perParticipation).toEqual(usd(0));
    expect(d.toExternal).toEqual(usd(0));
    expect(d.roundingResidue).toEqual(usd(0));
    expect(d.companyDirect).toEqual(usd(1));
    expect(d.companyTotal).toEqual(usd(1));
  });

  it("Borde · excedente cero: reparto en 0, cada titular recupera su aporte (C10)", () => {
    const d = distributed(input(2_000_000, 0, 100));
    expect(d.surplus).toEqual(usd(0));
    expect(d.fund).toEqual(usd(0));
    expect(d.companyTotal).toEqual(usd(0));
  });

  it("Borde · la base realizada se conserva en la salida", () => {
    const o = outcomeOf({ ...input(4_000_000, 0, 100), basis: "realized" });
    expect(o.basis).toBe("realized");
  });

  it("Borde · entrada inválida devuelve Result.err sin lanzar", () => {
    const r = calculateDistribution({ ...input(4_000_000, 0, 100), saleCosts: usd(-1) });
    expect(r).toEqual({ ok: false, error: expect.objectContaining({ code: "NEGATIVE_AMOUNT" }) });
  });
});
