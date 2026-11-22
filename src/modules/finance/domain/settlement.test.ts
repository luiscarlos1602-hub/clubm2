import { describe, expect, it } from "vitest";
import type { ProjectId } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usd, usdUnits } from "@/shared/domain/money";
import { calculateDistribution } from "./distribution";
import { createSettlement, type RealizedDistributionInput, type SettlementId } from "./settlement";

const ID: SettlementId = asId("stl_test_01");
const PROJECT: ProjectId = asId("prj_test_01");
const SETTLED_ON = "2026-07-05" as IsoDate;

/** Casos de docs/02 §4 en centavos: precio 10.000 ¢, total 100, C = F = 1.000.000 ¢. */
function realized(salePrice: number, saleCosts: number, placed: number): RealizedDistributionInput {
  return {
    basis: "realized",
    salePrice: usd(salePrice),
    acquisitionCost: usd(1_000_000),
    recoveryBudget: usd(1_000_000),
    saleCosts: usd(saleCosts),
    participations: { total: 100, placed, unitPrice: usd(10_000) },
  };
}

function settle(input: RealizedDistributionInput) {
  return createSettlement({ id: ID, projectId: PROJECT, settledOn: SETTLED_ON, input });
}

describe("finance · createSettlement", () => {
  it("Liquidación · C1 realizada igual al motor", () => {
    const input = realized(4_000_000, 0, 100);
    const r = settle(input);
    const engine = calculateDistribution(input);
    if (!r.ok || !engine.ok) throw new Error("se esperaba ok");

    expect(r.value.id).toBe(ID);
    expect(r.value.projectId).toBe(PROJECT);
    expect(r.value.settledOn).toBe(SETTLED_ON);
    expect(r.value.input).toEqual(input);
    expect(r.value.distribution).toEqual(engine.value);
    const d = r.value.distribution;
    expect(d.basis).toBe("realized");
    if (d.kind !== "distributed") throw new Error("se esperaba reparto");
    expect(d.toExternal).toEqual(usd(500_000));
    expect(d.companyDirect).toEqual(usd(1_500_000));
  });

  it("Liquidación · C6 realizada 63/100 igual al motor", () => {
    const r = settle(realized(4_000_000, 0, 63));
    if (!r.ok || r.value.distribution.kind !== "distributed") throw new Error("se esperaba reparto");
    expect(r.value.distribution.toExternal).toEqual(usd(315_000));
    expect(r.value.distribution.companyFromFund).toEqual(usd(185_000));
  });

  it("Liquidación · residuo K1 queda en la distribución guardada", () => {
    // Plan 003 §3.7, M2-001: P 79.500, C 55.000, F 10.000, O 2.400,37, 88/100.
    const input: RealizedDistributionInput = {
      basis: "realized",
      salePrice: usdUnits(79_500),
      acquisitionCost: usdUnits(55_000),
      recoveryBudget: usdUnits(10_000),
      saleCosts: usd(240_037),
      participations: { total: 100, placed: 88, unitPrice: usdUnits(100) },
    };
    const r = settle(input);
    if (!r.ok || r.value.distribution.kind !== "distributed") throw new Error("se esperaba reparto");
    const d = r.value.distribution;
    expect(d.surplus).toEqual(usd(1_209_963));
    expect(d.fund).toEqual(usd(302_490));
    expect(d.perParticipation).toEqual(usd(3_024));
    expect(d.roundingResidue).toEqual(usd(90));
    expect(d.toExternal).toEqual(usd(266_112));
    expect(d.companyFromFund).toEqual(usd(36_378));
    expect(d.companyDirect).toEqual(usd(907_473));
  });

  it("Liquidación · C5 con pérdida se liquida (ADR-019)", () => {
    const input = realized(1_900_000, 0, 100);
    const r = settle(input);
    const engine = calculateDistribution(input);
    if (!r.ok || !engine.ok) throw new Error("se esperaba ok");
    expect(r.value.distribution).toEqual(engine.value);
    const d = r.value.distribution;
    if (d.kind !== "loss") throw new Error("se esperaba pérdida");
    expect(d.basis).toBe("realized");
    expect(d.returned).toEqual({ external: usd(975_000), company: usd(925_000) });
  });

  it("Liquidación · excedente cero se liquida devolviendo el aporte (C10)", () => {
    const r = settle(realized(2_000_000, 0, 100));
    expect(r.ok && r.value.distribution.kind).toBe("distributed");
  });

  it("Liquidación · entrada inválida propaga el código del motor", () => {
    const r = settle(realized(4_000_000, 0, 101));
    expect(r.ok ? null : r.error.code).toBe("PLACED_OUT_OF_RANGE");
  });

  it("Liquidación · basis siempre realized (el tipo lo exige)", () => {
    const projection = { ...realized(4_000_000, 0, 100), basis: "projection" as const };
    createSettlement({
      id: ID,
      projectId: PROJECT,
      settledOn: SETTLED_ON,
      // @ts-expect-error una proyección no puede liquidarse
      input: projection,
    });
    expect(true).toBe(true);
  });
});
