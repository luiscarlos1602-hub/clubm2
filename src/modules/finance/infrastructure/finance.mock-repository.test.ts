import { describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import { isoDate } from "@/shared/domain/calendar-date";
import { usdUnits } from "@/shared/domain/money";
import { createProjectEconomicsMockRepository, createSettlementMockRepository } from "./finance.mock-repository";
import { buildFinanceSeed } from "./seed";

const terms = (placed: number) => ({ total: 100, placed, unitPrice: usdUnits(100) });
const slice = buildFinanceSeed({
  settled: [
    { projectId: asId<"Project">("prj_palos_grandes_01"), settledOn: isoDate("2026-01-05"), terms: terms(88) },
    { projectId: asId<"Project">("prj_chacao_01"), settledOn: isoDate("2026-02-05"), terms: terms(100) },
  ],
});
const source = { read: () => slice };

describe("Repos mock de finance", () => {
  it("economía: list y findByProject", async () => {
    const repo = createProjectEconomicsMockRepository(source);
    expect(await repo.list()).toHaveLength(7);
    expect((await repo.findByProject(asId<"Project">("prj_chacao_02")))?.acquisitionCost).toEqual(usdUnits(50_000));
    expect(await repo.findByProject(asId<"Project">("prj_nada_01"))).toBeNull();
  });

  it("liquidaciones: list y findByProject", async () => {
    const repo = createSettlementMockRepository(source);
    expect(await repo.list()).toHaveLength(2);
    expect((await repo.findByProject(asId<"Project">("prj_chacao_01")))?.distribution.kind).toBe("distributed");
    expect(await repo.findByProject(asId<"Project">("prj_hatillo_01"))).toBeNull();
  });
});
