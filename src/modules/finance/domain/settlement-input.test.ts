import { describe, expect, it } from "vitest";
import type { ProjectId } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usd, usdUnits } from "@/shared/domain/money";
import { calculateDistribution } from "./distribution";
import type { ProjectEconomics } from "./project-economics";
import type { ProjectSale } from "./project-sale";
import { buildRealizedInput } from "./settlement-input";

const PID = asId("prj_test_01") as ProjectId;
const ECONOMICS: ProjectEconomics = {
  projectId: PID,
  acquisitionCost: usdUnits(38_000),
  recoveryBudget: usdUnits(10_000),
  targetSalePrice: usdUnits(58_000),
  estimatedSaleCosts: usdUnits(1_740),
};
const SALE: ProjectSale = {
  projectId: PID,
  salePrice: usdUnits(47_000),
  saleCosts: usdUnits(1_000),
  signedOn: isoDate("2026-11-22"),
};
/** Una clase trae más campos que los términos: no deben filtrarse a la liquidación guardada. */
const CLASS = { id: "pcl_x", projectId: PID, total: 100, placed: 100, unitPrice: usdUnits(100) };

describe("buildRealizedInput (W-5, CA13)", () => {
  it("P y O de la venta real; C y F de la economía; términos de la clase; basis realized", () => {
    expect(buildRealizedInput({ sale: SALE, economics: ECONOMICS, terms: CLASS })).toEqual({
      basis: "realized",
      salePrice: usdUnits(47_000),
      acquisitionCost: usdUnits(38_000),
      recoveryBudget: usdUnits(10_000),
      saleCosts: usdUnits(1_000),
      participations: { total: 100, placed: 100, unitPrice: usdUnits(100) },
    });
  });

  it("recorrido E2E M2-004 · P 47.000 · O 1.000 → pierde 5,00 y devuelve 95,00 por participación", () => {
    const r = calculateDistribution(buildRealizedInput({ sale: SALE, economics: ECONOMICS, terms: CLASS }));
    if (!r.ok || r.value.kind !== "loss") throw new Error("se esperaba pérdida");
    expect(r.value.loss).toEqual(usdUnits(2_000));
    expect(r.value.lossPerParticipation).toEqual(usd(500));
    expect(r.value.returnPerParticipation).toEqual(usd(9_500));
  });
});
