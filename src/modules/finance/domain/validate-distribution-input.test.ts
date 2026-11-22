import { describe, expect, it } from "vitest";
import { MAX_MONEY_CENTS, usd } from "@/shared/domain/money";
import { percentage } from "@/shared/domain/percentage";
import type { DistributionInput } from "./distribution";
import { validateDistributionInput } from "./validate-distribution-input";

const base: DistributionInput = {
  basis: "projection",
  salePrice: usd(4_000_000),
  acquisitionCost: usd(1_000_000),
  recoveryBudget: usd(1_000_000),
  saleCosts: usd(0),
  participations: { total: 100, placed: 100, unitPrice: usd(10_000) },
};

function codeOf(input: DistributionInput): string | null {
  const r = validateDistributionInput(input);
  return r.ok ? null : r.error.code;
}

function withParticipations(p: Partial<DistributionInput["participations"]>): DistributionInput {
  return { ...base, participations: { ...base.participations, ...p } };
}

describe("finance · validateDistributionInput", () => {
  it("acepta la entrada base y la devuelve sin cambios", () => {
    expect(validateDistributionInput(base)).toEqual({ ok: true, value: base });
  });

  it.each(["salePrice", "acquisitionCost", "recoveryBudget", "saleCosts"] as const)(
    "monto negativo en %s → NEGATIVE_AMOUNT",
    (field) => {
      expect(codeOf({ ...base, [field]: usd(-1) })).toBe("NEGATIVE_AMOUNT");
    },
  );

  it("monto mayor al techo → AMOUNT_TOO_LARGE", () => {
    expect(codeOf({ ...base, salePrice: usd(MAX_MONEY_CENTS + 1) })).toBe("AMOUNT_TOO_LARGE");
  });

  it("monto en el techo exacto es válido", () => {
    expect(codeOf({ ...base, salePrice: usd(MAX_MONEY_CENTS) })).toBeNull();
  });

  it("monto no entero (Money construido a mano) → AMOUNT_TOO_LARGE, sin lanzar", () => {
    expect(codeOf({ ...base, saleCosts: { cents: 1.5, currency: "USD" } })).toBe(
      "AMOUNT_TOO_LARGE",
    );
    expect(codeOf({ ...base, saleCosts: { cents: Number.NaN, currency: "USD" } })).toBe(
      "AMOUNT_TOO_LARGE",
    );
  });

  it("total 0 → INVALID_PARTICIPATION_TOTAL", () => {
    expect(codeOf(withParticipations({ total: 0, placed: 0 }))).toBe("INVALID_PARTICIPATION_TOTAL");
  });

  it("total 1,5 → INVALID_PARTICIPATION_TOTAL", () => {
    expect(codeOf(withParticipations({ total: 1.5, placed: 1 }))).toBe(
      "INVALID_PARTICIPATION_TOTAL",
    );
  });

  it("colocadas 101 con total 100 → PLACED_OUT_OF_RANGE", () => {
    expect(codeOf(withParticipations({ placed: 101 }))).toBe("PLACED_OUT_OF_RANGE");
  });

  it("colocadas −1 → PLACED_OUT_OF_RANGE", () => {
    expect(codeOf(withParticipations({ placed: -1 }))).toBe("PLACED_OUT_OF_RANGE");
  });

  it("colocadas no enteras → PLACED_OUT_OF_RANGE", () => {
    expect(codeOf(withParticipations({ placed: 50.5 }))).toBe("PLACED_OUT_OF_RANGE");
  });

  it("precio 0 → NON_POSITIVE_UNIT_PRICE", () => {
    expect(codeOf(withParticipations({ unitPrice: usd(0) }))).toBe("NON_POSITIVE_UNIT_PRICE");
  });

  it("precio mayor al techo → AMOUNT_TOO_LARGE", () => {
    expect(codeOf(withParticipations({ unitPrice: usd(MAX_MONEY_CENTS + 1) }))).toBe(
      "AMOUNT_TOO_LARGE",
    );
  });

  it("total × precio mayor al techo → AMOUNT_TOO_LARGE", () => {
    expect(
      codeOf(withParticipations({ total: 1_000, placed: 0, unitPrice: usd(MAX_MONEY_CENTS) })),
    ).toBe("AMOUNT_TOO_LARGE");
  });

  it("shares 2500/7000 → INVALID_SHARES", () => {
    const shares = { fund: percentage(2500), company: percentage(7000) };
    expect(codeOf({ ...base, shares })).toBe("INVALID_SHARES");
  });

  it("shares fuera de 0..10.000 → INVALID_SHARES", () => {
    const shares = { fund: percentage(-2500), company: percentage(12_500) };
    expect(codeOf({ ...base, shares })).toBe("INVALID_SHARES");
  });

  it("shares 2500/7500 ok", () => {
    const shares = { fund: percentage(2500), company: percentage(7500) };
    expect(codeOf({ ...base, shares })).toBeNull();
  });
});
