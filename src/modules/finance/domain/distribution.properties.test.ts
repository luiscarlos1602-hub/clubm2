import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { usd, type Money } from "@/shared/domain/money";
import { complementPercentage, percentage } from "@/shared/domain/percentage";
import {
  calculateDistribution,
  type Distribution,
  type DistributionInput,
  type DistributionOutcome,
  type DistributionShares,
} from "./distribution";

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
const shares: fc.Arbitrary<DistributionShares> = fc
  .integer({ min: 0, max: 10_000 })
  .map((bps) => ({ fund: percentage(bps), company: complementPercentage(percentage(bps)) }));

type Amounts = Record<"P" | "C" | "F" | "O", number>;
type Raw = Amounts & Record<"total" | "placed" | "unitPrice", number>;

function build(raw: Raw, b: DistributionInput["basis"], s?: DistributionShares): DistributionInput {
  return {
    basis: b,
    salePrice: usd(raw.P),
    acquisitionCost: usd(raw.C),
    recoveryBudget: usd(raw.F),
    saleCosts: usd(raw.O),
    participations: { total: raw.total, placed: raw.placed, unitPrice: usd(raw.unitPrice) },
    ...(s ? { shares: s } : {}),
  };
}

/** Cualquier entrada válida (excedente de cualquier signo). */
const anyRaw: fc.Arbitrary<Raw> = fc
  .record({ P: amount, C: amount, F: amount, O: amount, t: terms })
  .map(({ t, ...m }) => ({ ...m, ...t }));

/** Entrada con excedente ≥ 0: P = C + F + O + s, s ≥ 0 (excedente 0 = reparto en 0, C10). */
const positiveRaw: fc.Arbitrary<Raw> = fc
  .record({ C: amount, F: amount, O: amount, s: fc.integer({ min: 0, max: 1e9 }), t: terms })
  .map(({ C, F, O, s, t }) => ({ P: C + F + O + s, C, F, O, ...t }));

function run(input: DistributionInput): DistributionOutcome {
  const r = calculateDistribution(input);
  if (!r.ok) throw new Error(`entrada inválida en el generador: ${r.error.code}`);
  return r.value;
}

function distributed(input: DistributionInput): Distribution {
  const o = run(input);
  if (o.kind !== "distributed") throw new Error("se esperaba reparto");
  return o;
}

const c = (m: Money): number => m.cents;

describe("finance · invariantes del motor (fast-check)", () => {
  it("I1 · el excedente se reparte completo al centavo", () => {
    fc.assert(
      fc.property(positiveRaw, basis, (raw, b) => {
        const d = distributed(build(raw, b));
        expect(c(d.toExternal) + c(d.companyFromFund) + c(d.companyDirect)).toBe(c(d.surplus));
      }),
      RUNS,
    );
  });

  it("I2 · el fondo se reparte completo", () => {
    fc.assert(
      fc.property(positiveRaw, basis, (raw, b) => {
        const d = distributed(build(raw, b));
        expect(c(d.toExternal) + c(d.companyFromFund)).toBe(c(d.fund));
        expect(c(d.companyTotal)).toBe(c(d.companyDirect) + c(d.companyFromFund));
      }),
      RUNS,
    );
  });

  it("I3 · capitales + excedente + costos = venta", () => {
    fc.assert(
      fc.property(positiveRaw, basis, (raw, b) => {
        const F = raw.total * raw.unitPrice;
        const d = distributed(build({ ...raw, F, P: raw.P - raw.F + F }, b));
        expect(c(d.capital.external) + c(d.capital.company) + c(d.surplus) + raw.O).toBe(
          raw.P - raw.F + F,
        );
      }),
      RUNS,
    );
  });

  it("I4 · ningún monto negativo ni fraccionario", () => {
    fc.assert(
      fc.property(positiveRaw, basis, (raw, b) => {
        const d = distributed(build(raw, b));
        const all = [
          d.surplus,
          d.fund,
          d.perParticipation,
          d.roundingResidue,
          d.toExternal,
          d.companyFromFund,
          d.companyDirect,
          d.companyTotal,
          d.capital.external,
          d.capital.company,
        ];
        for (const m of all) {
          expect(Number.isSafeInteger(m.cents)).toBe(true);
          expect(m.cents).toBeGreaterThanOrEqual(0);
        }
      }),
      RUNS,
    );
  });

  it("I5 · más colocadas no reduce a los externos", () => {
    fc.assert(
      fc.property(positiveRaw, basis, (raw, b) => {
        fc.pre(raw.placed < raw.total);
        const before = distributed(build(raw, b));
        const after = distributed(build({ ...raw, placed: raw.placed + 1 }, b));
        expect(c(after.toExternal)).toBeGreaterThanOrEqual(c(before.toExternal));
        expect(c(after.companyFromFund)).toBeLessThanOrEqual(c(before.companyFromFund));
      }),
      RUNS,
    );
  });

  it("I6 · excedente < 0 → pérdida; excedente ≥ 0 → reparto (ADR-019)", () => {
    fc.assert(
      fc.property(fc.oneof(anyRaw, positiveRaw), basis, (raw, b) => {
        const o = run(build(raw, b));
        expect(o.kind === "loss").toBe(raw.P - raw.C - raw.F - raw.O < 0);
        expect(c(o.surplus)).toBe(raw.P - raw.C - raw.F - raw.O);
      }),
      RUNS,
    );
  });

  it("I7 · K1 residuo acotado", () => {
    fc.assert(
      fc.property(positiveRaw, basis, (raw, b) => {
        const d = distributed(build(raw, b));
        expect(c(d.perParticipation) * raw.total + c(d.roundingResidue)).toBe(c(d.fund));
        expect(c(d.roundingResidue)).toBeGreaterThanOrEqual(0);
        expect(c(d.roundingResidue)).toBeLessThan(raw.total);
      }),
      RUNS,
    );
  });

  it("I8 · el fondo es el 25 % redondeado hacia abajo", () => {
    fc.assert(
      fc.property(positiveRaw, basis, (raw, b) => {
        const d = distributed(build(raw, b));
        expect(c(d.fund) * 10_000).toBeLessThanOrEqual(c(d.surplus) * 2_500);
        expect(c(d.surplus) * 2_500).toBeLessThan((c(d.fund) + 1) * 10_000);
      }),
      RUNS,
    );
  });

  it("I9 · la colocación no cambia excedente ni fondo", () => {
    fc.assert(
      fc.property(positiveRaw, basis, shares, fc.nat(), (raw, b, s, seed) => {
        const otherPlaced = seed % (raw.total + 1);
        const a = distributed(build(raw, b, s));
        const z = distributed(build({ ...raw, placed: otherPlaced }, b, s));
        expect(z.surplus).toEqual(a.surplus);
        expect(z.fund).toEqual(a.fund);
        expect(z.perParticipation).toEqual(a.perParticipation);
        expect(z.companyDirect).toEqual(a.companyDirect);
        for (const d of [a, z]) {
          expect(c(d.toExternal) + c(d.companyFromFund) + c(d.companyDirect)).toBe(c(d.surplus));
        }
      }),
      RUNS,
    );
  });
});
