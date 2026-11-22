import { describe, expect, it } from "vitest";
import type { Project } from "@/modules/projects";
import { usdUnits } from "@/shared/domain/money";
import { err } from "@/shared/domain/result";
import { memorySlice } from "@/shared/infrastructure/demo-store";
import { createProjectBudgetMockRepository, createProjectEconomicsMockRepository } from "./finance.mock-repository";
import { createProjectBudgetMockWriter, createProjectEconomicsMockWriter } from "./finance.mock-writer";
import type { FinanceSlice } from "./seed";
import { CONTRACT_PROJECT_ID, contractBudget, contractEconomics } from "../application/finance-repository.contract";
import { createSaveProjectEconomics } from "../application/save-project-economics";

function setup(projectExists = true, failBudget = false) {
  const slice = memorySlice<FinanceSlice>({ economics: [], settlements: [], budgets: [], sales: [] });
  const save = createSaveProjectEconomics({
    projects: { findById: (id) => Promise.resolve(projectExists && id === CONTRACT_PROJECT_ID ? ({ id } as Project) : null) },
    economics: { ...createProjectEconomicsMockRepository(slice), ...createProjectEconomicsMockWriter(slice) },
    budgets: failBudget ? { save: () => Promise.resolve(err("INVALID_RECORD")) } : createProjectBudgetMockWriter(slice),
  });
  return {
    save,
    economics: createProjectEconomicsMockRepository(slice),
    budgets: createProjectBudgetMockRepository(slice),
  };
}

describe("saveProjectEconomics (W-1)", () => {
  it("guarda economía y presupuesto juntos", async () => {
    const s = setup();
    const r = await s.save({ economics: contractEconomics, budget: contractBudget });
    expect(r.ok).toBe(true);
    expect(await s.economics.findByProject(CONTRACT_PROJECT_ID)).toEqual(contractEconomics);
    expect(await s.budgets.findByProject(CONTRACT_PROJECT_ID)).toEqual(contractBudget);
  });

  it("cambiar F exige un presupuesto que la sume (BUDGET_TOTAL_MISMATCH) y no escribe nada", async () => {
    const s = setup();
    await s.save({ economics: contractEconomics, budget: contractBudget });
    const r = await s.save({ economics: { ...contractEconomics, recoveryBudget: usdUnits(12_000) }, budget: contractBudget });
    expect(!r.ok && r.error.code).toBe("BUDGET_TOTAL_MISMATCH");
    expect(await s.economics.findByProject(CONTRACT_PROJECT_ID)).toEqual(contractEconomics);
  });

  it.each([
    ["INVALID_ECONOMICS", { acquisitionCost: usdUnits(0) }],
    ["INVALID_ECONOMICS", { targetSalePrice: usdUnits(0) }],
    ["INVALID_ECONOMICS", { estimatedSaleCosts: { cents: -1, currency: "USD" } }],
  ] as const)("rechaza con %s", async (code, change) => {
    const s = setup();
    const r = await s.save({ economics: { ...contractEconomics, ...change }, budget: contractBudget });
    expect(!r.ok && r.error.code).toBe(code);
    expect(await s.economics.findByProject(CONTRACT_PROJECT_ID)).toBeNull();
  });

  it("presupuesto de otro proyecto → PROJECT_MISMATCH; proyecto inexistente → PROJECT_NOT_FOUND", async () => {
    const other = { ...contractBudget, projectId: "prj_otro_01" as typeof CONTRACT_PROJECT_ID };
    const mismatch = await setup().save({ economics: contractEconomics, budget: other });
    expect(!mismatch.ok && mismatch.error.code).toBe("PROJECT_MISMATCH");
    const missing = await setup(false).save({ economics: contractEconomics, budget: contractBudget });
    expect(!missing.ok && missing.error.code).toBe("PROJECT_NOT_FOUND");
  });

  it("acepta una proyección con pérdida (P < C + F + O): se muestra como escenario, no se bloquea", async () => {
    const s = setup();
    const loss = { ...contractEconomics, targetSalePrice: usdUnits(65_000) };
    expect((await s.save({ economics: loss, budget: contractBudget })).ok).toBe(true);
    expect(await s.economics.findByProject(CONTRACT_PROJECT_ID)).toEqual(loss);
  });
});

describe("saveProjectEconomics · fallo del presupuesto tras guardar la economía", () => {
  it("restaura la economía anterior", async () => {
    // economía ya guardada; el writer de presupuesto rechaza
    const slice = memorySlice<FinanceSlice>({ economics: [contractEconomics], settlements: [], budgets: [], sales: [] });
    const save = createSaveProjectEconomics({
      projects: { findById: (id) => Promise.resolve({ id } as Project) },
      economics: { ...createProjectEconomicsMockRepository(slice), ...createProjectEconomicsMockWriter(slice) },
      budgets: { save: () => Promise.resolve(err("INVALID_RECORD")) },
    });
    const changed = { ...contractEconomics, targetSalePrice: usdUnits(90_000) };
    const r = await save({ economics: changed, budget: contractBudget });
    expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
    expect(slice.read().economics).toEqual([contractEconomics]);
  });
});
