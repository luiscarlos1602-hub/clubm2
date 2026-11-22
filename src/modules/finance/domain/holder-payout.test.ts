import { describe, expect, it } from "vitest";
import { usd } from "@/shared/domain/money";
import {
  calculateDistribution,
  type DistributionInput,
  type DistributionOutcome,
} from "./distribution";
import { calculateHolderPayout } from "./holder-payout";

function outcome(
  salePrice: number,
  placed: number,
  basis: DistributionInput["basis"] = "projection",
): DistributionOutcome {
  const r = calculateDistribution({
    basis,
    salePrice: usd(salePrice),
    acquisitionCost: usd(1_000_000),
    recoveryBudget: usd(1_000_000),
    saleCosts: usd(0),
    participations: { total: 100, placed, unitPrice: usd(10_000) },
  });
  if (!r.ok) throw new Error(r.error.code);
  return r.value;
}

const C1 = outcome(4_000_000, 100);
const C5 = outcome(1_900_000, 100);
const C6 = outcome(4_000_000, 63);

function codeOf(o: DistributionOutcome, held: number): string | null {
  const r = calculateHolderPayout(o, held);
  return r.ok ? null : r.error.code;
}

describe("finance · calculateHolderPayout", () => {
  it("Cobro ilustrativo C1 · 1 participación = 100 capital + 50 ganancia", () => {
    expect(calculateHolderPayout(C1, 1)).toEqual({
      ok: true,
      value: {
        basis: "projection",
        held: 1,
        result: "gain",
        capital: usd(10_000),
        loss: usd(0),
        capitalReturned: usd(10_000),
        gain: usd(5_000),
        total: usd(15_000),
      },
    });
  });

  it("Cobro · conserva la base realizada", () => {
    const r = calculateHolderPayout(outcome(4_000_000, 100, "realized"), 1);
    expect(r.ok && r.value.basis).toBe("realized");
  });

  it("Cobro · C6 con todas las colocadas suma lo de los externos", () => {
    const r = calculateHolderPayout(C6, 63);
    expect(r.ok && r.value).toMatchObject({
      capital: usd(630_000),
      gain: usd(315_000),
      total: usd(945_000),
    });
  });

  it("Cobro C5 · pérdida: 1 participación devuelve 97,50 y pierde 2,50 (ADR-019)", () => {
    expect(calculateHolderPayout(C5, 1)).toEqual({
      ok: true,
      value: {
        basis: "projection",
        held: 1,
        result: "loss",
        capital: usd(10_000),
        loss: usd(250),
        capitalReturned: usd(9_750),
        gain: usd(0),
        total: usd(9_750),
      },
    });
  });

  it("Cobro C10 · excedente cero: recupera el aporte sin ganancia", () => {
    const r = calculateHolderPayout(outcome(2_000_000, 100), 4);
    expect(r.ok && r.value).toMatchObject({
      result: "break_even",
      capital: usd(40_000),
      loss: usd(0),
      capitalReturned: usd(40_000),
      gain: usd(0),
      total: usd(40_000),
    });
  });

  it("Cobro · venta en 0 (borde W5-1): la devolución mínima es 0, nunca negativa", () => {
    const r = calculateHolderPayout(outcome(0, 100), 3);
    expect(r.ok && r.value).toMatchObject({
      result: "loss",
      capital: usd(30_000),
      loss: usd(30_000),
      capitalReturned: usd(0),
      total: usd(0),
    });
  });

  it("Cobro · en pérdida también exige held ≤ colocadas", () => {
    expect(codeOf(outcome(1_900_000, 40), 41)).toBe("HELD_OUT_OF_RANGE");
  });

  it("Cobro · más participaciones que colocadas", () => {
    expect(codeOf(C6, 64)).toBe("HELD_OUT_OF_RANGE");
  });

  it.each([0, -1, 1.5, Number.NaN])("Cobro · held = %s → HELD_OUT_OF_RANGE", (held) => {
    expect(codeOf(C1, held)).toBe("HELD_OUT_OF_RANGE");
  });

  it("Cobro · C3 sin colocadas no admite titulares", () => {
    expect(codeOf(outcome(4_000_000, 0), 1)).toBe("HELD_OUT_OF_RANGE");
  });
});
