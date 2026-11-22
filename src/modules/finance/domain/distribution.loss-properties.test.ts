import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { usd, type Money } from "@/shared/domain/money";
import {
  calculateDistribution,
  type DistributionInput,
  type DistributionOutcome,
  type LossDistribution,
} from "./distribution";
import { calculateHolderPayout } from "./holder-payout";

const RUNS = { numRuns: 1000 };
const amount = fc.integer({ min: 0, max: 1_000_000_000 });
const basis = fc.constantFrom("projection" as const, "realized" as const);
const terms = fc.integer({ min: 1, max: 1_000 }).chain((total) =>
  fc.record({
    total: fc.constant(total),
    placed: fc.integer({ min: 0, max: total }),
    unitPrice: fc.integer({ min: 1, max: 1_000_000 }),
  }),
);

type Raw = Record<"P" | "C" | "F" | "O" | "total" | "placed" | "unitPrice", number>;

/** Venta válida al liquidar: O ≤ P (W5-2). Excedente de cualquier signo. */
const saleRaw: fc.Arbitrary<Raw> = fc
  .record({ P: amount, C: amount, F: amount, o: fc.nat(), t: terms })
  .map(({ P, o, t, ...m }) => ({ P, O: P === 0 ? 0 : o % (P + 1), ...m, ...t }));

/** Venta con pérdida: P = C + F + O − L, L ≥ 1, O ≤ P. */
const lossRaw: fc.Arbitrary<Raw> = saleRaw.filter((r) => r.P - r.C - r.F - r.O < 0);

function build(raw: Raw, b: DistributionInput["basis"]): DistributionInput {
  return {
    basis: b,
    salePrice: usd(raw.P),
    acquisitionCost: usd(raw.C),
    recoveryBudget: usd(raw.F),
    saleCosts: usd(raw.O),
    participations: { total: raw.total, placed: raw.placed, unitPrice: usd(raw.unitPrice) },
  };
}

function run(input: DistributionInput): DistributionOutcome {
  const r = calculateDistribution(input);
  if (!r.ok) throw new Error(`entrada inválida en el generador: ${r.error.code}`);
  return r.value;
}

function lossOf(input: DistributionInput): LossDistribution {
  const o = run(input);
  if (o.kind !== "loss") throw new Error("se esperaba pérdida");
  return o;
}

/** Devolución por participación de cualquier resultado: unitPrice (+ ganancia aparte) o la de pérdida. */
function returnPer(o: DistributionOutcome): number {
  return o.kind === "loss" ? o.returnPerParticipation.cents : o.participations.unitPrice.cents;
}

const c = (m: Money): number => m.cents;

describe("finance · invariantes de pérdida ADR-019 (fast-check)", () => {
  it("I10 · kind = loss ⇔ excedente < 0", () => {
    fc.assert(
      fc.property(saleRaw, basis, (raw, b) => {
        const o = run(build(raw, b));
        expect(o.kind === "loss").toBe(raw.P - raw.C - raw.F - raw.O < 0);
        expect(c(o.surplus)).toBe(raw.P - raw.C - raw.F - raw.O);
      }),
      RUNS,
    );
  });

  it("I11 · lo devuelto a externos y empresa cuadra con P − O al centavo", () => {
    fc.assert(
      fc.property(lossRaw, basis, (raw, b) => {
        const d = lossOf(build(raw, b));
        expect(c(d.returned.external) + c(d.returned.company)).toBe(raw.P - raw.O);
        expect(c(d.returned.external)).toBe(c(d.returnPerParticipation) * raw.placed);
      }),
      RUNS,
    );
  });

  it("I12 · la pérdida se reparte completa: externa + empresa = L", () => {
    fc.assert(
      fc.property(lossRaw, basis, (raw, b) => {
        const d = lossOf(build(raw, b));
        expect(c(d.loss)).toBe(-c(d.surplus));
        expect(c(d.externalLoss) + c(d.companyLoss)).toBe(c(d.loss));
        expect(c(d.externalLoss)).toBe(c(d.lossPerParticipation) * raw.placed);
        const per = Math.floor(c(d.investorsLossPool) / raw.total);
        expect(per * raw.total + c(d.roundingResidue)).toBe(c(d.investorsLossPool));
        expect(c(d.capExcess)).toBe((per - Math.min(per, raw.unitPrice)) * raw.total);
      }),
      RUNS,
    );
  });

  it("I13 · ninguna participación pierde más que su precio ni recibe más que él", () => {
    fc.assert(
      fc.property(lossRaw, basis, (raw, b) => {
        const d = lossOf(build(raw, b));
        expect(c(d.lossPerParticipation)).toBeGreaterThanOrEqual(0);
        expect(c(d.lossPerParticipation)).toBeLessThanOrEqual(raw.unitPrice);
        expect(c(d.returnPerParticipation)).toBeGreaterThanOrEqual(0);
        expect(c(d.returnPerParticipation) + c(d.lossPerParticipation)).toBe(raw.unitPrice);
        // El espejo (25 % redondeado a favor del inversionista) es el máximo que puede perder sin borde W5-1.
        if (c(d.proceedsShortfall) === 0) {
          expect(c(d.lossPerParticipation) * raw.total).toBeLessThanOrEqual(c(d.investorsLossPool));
        }
      }),
      RUNS,
    );
  });

  it("I14 · cobro por titular: nunca negativo y capital devuelto + pérdida = aporte", () => {
    fc.assert(
      fc.property(saleRaw, basis, fc.nat(), (raw, b, seed) => {
        fc.pre(raw.placed >= 1);
        const held = 1 + (seed % raw.placed);
        const r = calculateHolderPayout(run(build(raw, b)), held);
        if (!r.ok) throw new Error(r.error.code);
        const p = r.value;
        expect(c(p.total)).toBeGreaterThanOrEqual(0);
        expect(c(p.gain)).toBeGreaterThanOrEqual(0);
        expect(c(p.loss)).toBeLessThanOrEqual(c(p.capital));
        expect(c(p.capitalReturned) + c(p.loss)).toBe(c(p.capital));
        expect(c(p.total)).toBe(c(p.capitalReturned) + c(p.gain));
        expect(c(p.gain) > 0 && c(p.loss) > 0).toBe(false);
      }),
      RUNS,
    );
  });

  it("I15 · con O ≤ P la empresa nunca recibe un monto negativo (W5-1 = b)", () => {
    fc.assert(
      fc.property(lossRaw, basis, (raw, b) => {
        const d = lossOf(build(raw, b));
        expect(c(d.returned.company)).toBeGreaterThanOrEqual(0);
        expect(c(d.proceedsShortfall)).toBeGreaterThanOrEqual(0);
        if (c(d.proceedsShortfall) > 0) {
          expect(c(d.returned.company)).toBeLessThan(Math.max(1, raw.placed));
        }
      }),
      RUNS,
    );
  });

  it("I16 · subir P nunca baja la devolución por participación", () => {
    fc.assert(
      fc.property(saleRaw, basis, fc.integer({ min: 1, max: 1e9 }), (raw, b, delta) => {
        const lo = run(build(raw, b));
        const hi = run(build({ ...raw, P: raw.P + delta }, b));
        expect(returnPer(hi)).toBeGreaterThanOrEqual(returnPer(lo));
      }),
      RUNS,
    );
  });
});
