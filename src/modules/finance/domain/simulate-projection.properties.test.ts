import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { MAX_MONEY_CENTS, usd } from "@/shared/domain/money";
import {
  SIMULATION_RANGES,
  normalizeControls,
  simulateProjection,
  type SimulationBase,
  type SimulationControls,
} from "./simulator";

const amount = fc.integer({ min: 0, max: 50_000_000_00 }).map(usd);

const validBase: fc.Arbitrary<SimulationBase> = fc
  .record({
    total: fc.integer({ min: 1, max: 200 }),
    unitPriceCents: fc.integer({ min: 1, max: 100_000_00 }),
    placedRatio: fc.double({ min: 0, max: 1, noNaN: true }),
    salePrice: amount,
    acquisitionCost: amount,
    saleCosts: amount,
    targetTermMonths: fc.integer({ min: 0, max: 24 }),
  })
  .map((r) => ({
    salePrice: r.salePrice,
    acquisitionCost: r.acquisitionCost,
    // F = total × precio, como en el maestro (habilita el invariante de capitales).
    recoveryBudget: usd(r.total * r.unitPriceCents),
    saleCosts: r.saleCosts,
    total: r.total,
    unitPrice: usd(r.unitPriceCents),
    placed: Math.floor(r.placedRatio * r.total),
    targetTermMonths: r.targetTermMonths,
  }));

/** Incluye valores fuera de rango, no enteros, NaN e infinitos. */
const wild = fc.oneof(
  fc.integer({ min: -100_000, max: 100_000 }),
  fc.double({ min: -1e6, max: 1e6 }),
  fc.constantFrom(Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0),
);

const anyControls: fc.Arbitrary<SimulationControls> = fc.record({
  saleAdjustmentBps: wild,
  worksOverrunBps: wild,
  delayMonths: wild,
  placed: wild,
  held: wild,
});

describe("simulateProjection · propiedades (fast-check)", () => {
  it("nunca lanza, ni con controles ni con bases arbitrarias", () => {
    const anyMoney = fc.oneof(
      amount,
      wild.map((cents) => ({ cents, currency: "USD" as const })),
    );
    const anyBase = fc.record({
      salePrice: anyMoney,
      acquisitionCost: anyMoney,
      recoveryBudget: anyMoney,
      saleCosts: anyMoney,
      total: wild,
      unitPrice: anyMoney,
      placed: wild,
      targetTermMonths: wild,
    });
    fc.assert(
      fc.property(fc.oneof(validBase, anyBase), anyControls, (base, c) => {
        expect(() => simulateProjection(base, c)).not.toThrow();
      }),
    );
  });

  it("con payout: externos + empresa = excedente y capitales + excedente + O = P' al centavo", () => {
    fc.assert(
      fc.property(validBase, anyControls, (base, c) => {
        const r = simulateProjection(base, c);
        if (r.outcome.kind !== "payout") return;
        const d = r.outcome.distribution;
        expect(d.toExternal.cents + d.companyTotal.cents).toBe(d.surplus.cents);
        if (r.worksOverrun.cents === 0) {
          const back =
            d.capital.external.cents +
            d.capital.company.cents +
            d.surplus.cents +
            base.saleCosts.cents;
          expect(back).toBe(r.salePrice.cents);
        }
        expect(d.toExternal.cents).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it("heldUsed ≤ colocadas, plazo = objetivo + retraso y F' ≥ F", () => {
    fc.assert(
      fc.property(validBase, anyControls, (base, c) => {
        const n = normalizeControls(base, base.total, c);
        const r = simulateProjection(base, c);
        expect(r.heldUsed).toBeLessThanOrEqual(n.placed);
        expect(r.termMonths).toBe(base.targetTermMonths + n.delayMonths);
        expect(r.recoveryBudget.cents).toBeGreaterThanOrEqual(base.recoveryBudget.cents);
        expect(r.recoveryBudget.cents).toBeLessThanOrEqual(MAX_MONEY_CENTS * 2);
      }),
    );
  });

  it("normalizeControls es idempotente y respeta los rangos", () => {
    fc.assert(
      fc.property(validBase, fc.integer({ min: 1, max: 50 }), anyControls, (base, heldMax, c) => {
        const once = normalizeControls(base, heldMax, c);
        expect(normalizeControls(base, heldMax, once)).toEqual(once);
        const { saleAdjustmentBps: s, worksOverrunBps: w, delayMonths: m } = SIMULATION_RANGES;
        expect(once.saleAdjustmentBps).toBeGreaterThanOrEqual(s.min);
        expect(once.saleAdjustmentBps).toBeLessThanOrEqual(s.max);
        expect(once.worksOverrunBps).toBeGreaterThanOrEqual(w.min);
        expect(once.worksOverrunBps).toBeLessThanOrEqual(w.max);
        expect(once.delayMonths).toBeGreaterThanOrEqual(m.min);
        expect(once.delayMonths).toBeLessThanOrEqual(m.max);
        expect(once.placed).toBeGreaterThanOrEqual(0);
        expect(once.placed).toBeLessThanOrEqual(base.total);
        expect(once.held).toBeGreaterThanOrEqual(1);
        expect(once.held).toBeLessThanOrEqual(heldMax);
        for (const v of Object.values(once)) expect(Number.isSafeInteger(v)).toBe(true);
      }),
    );
  });

  it("más colocadas ⇒ externos no disminuye (monotonía)", () => {
    fc.assert(
      fc.property(
        validBase,
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        (base, a, b) => {
          const [lo, hi] = [Math.min(a, b, base.total), Math.min(Math.max(a, b), base.total)];
          const neutral = { saleAdjustmentBps: 0, worksOverrunBps: 0, delayMonths: 0, held: 1 };
          const rLo = simulateProjection(base, { ...neutral, placed: lo });
          const rHi = simulateProjection(base, { ...neutral, placed: hi });
          if (rLo.outcome.kind === "invalid" || rLo.outcome.kind === "no_distribution") return;
          if (rHi.outcome.kind === "invalid" || rHi.outcome.kind === "no_distribution") return;
          expect(rHi.outcome.distribution.toExternal.cents).toBeGreaterThanOrEqual(
            rLo.outcome.distribution.toExternal.cents,
          );
        },
      ),
    );
  });

  it("el resultado no contiene ruedas (ADR-004)", () => {
    fc.assert(
      fc.property(validBase, anyControls, (base, c) => {
        expect(JSON.stringify(simulateProjection(base, c))).not.toMatch(/wheel|rueda|stalled/i);
      }),
      { numRuns: 50 },
    );
  });
});
