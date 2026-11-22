import { describe, expect, it, vi } from "vitest";
import type { ProjectListing } from "@/modules/participations";
import { usd, usdUnits } from "@/shared/domain/money";
import type { ProjectDetail } from "../domain/project-detail";
import type { SimulationBase } from "../domain/simulator";
import { createGetHoldingProjections } from "./get-holding-projections";

// M2-006 (34,30 por participación) y una base sin excedente.
const M2_006: SimulationBase = {
  salePrice: usdUnits(76_000),
  acquisitionCost: usdUnits(50_000),
  recoveryBudget: usdUnits(10_000),
  saleCosts: usdUnits(2_280),
  total: 100,
  unitPrice: usdUnits(100),
  placed: 63,
  targetTermMonths: 3,
};
const LOSS: SimulationBase = { ...M2_006, salePrice: usdUnits(10_000) };

const listing = (code: string, slug: string) => ({ code, slug }) as unknown as ProjectListing;
const detail = (base: SimulationBase) => ({ simulation: { base } }) as unknown as ProjectDetail;

function deps() {
  const bySlug: Record<string, ProjectDetail> = {
    "m2-006-chacao": detail(M2_006),
    "m2-002-perdida": detail(LOSS),
  };
  const getProjectDetail = vi.fn(async (slug: string) => bySlug[slug] ?? null);
  return {
    listMarketplace: async () => [
      listing("M2-006", "m2-006-chacao"),
      listing("M2-002", "m2-002-perdida"),
    ],
    getProjectDetail,
  };
}

describe("getHoldingProjections", () => {
  it("proyecta cada tenencia con el motor y suma con sumMoney", async () => {
    const get = createGetHoldingProjections(deps());
    const r = await get([
      { code: "M2-006", quantity: 2 },
      { code: "M2-002", quantity: 1 },
    ]);
    expect(r.byCode).toEqual({ "M2-006": usd(6_860), "M2-002": null });
    expect(r.total).toEqual(usd(6_860));
  });

  it("un código desconocido → null sin pedir la ficha", async () => {
    const d = deps();
    const r = await createGetHoldingProjections(d)([{ code: "M2-999", quantity: 1 }]);
    expect(r.byCode).toEqual({ "M2-999": null });
    expect(d.getProjectDetail).not.toHaveBeenCalled();
  });

  it("si todas son null, total es null; sin pedidos, vacío", async () => {
    const get = createGetHoldingProjections(deps());
    expect((await get([{ code: "M2-002", quantity: 1 }])).total).toBeNull();
    expect(await get([])).toEqual({ byCode: {}, total: null });
  });
});
