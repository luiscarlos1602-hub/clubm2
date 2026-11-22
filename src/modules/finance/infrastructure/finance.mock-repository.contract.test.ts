import { asId } from "@/shared/domain/id";
import { isoDate } from "@/shared/domain/calendar-date";
import { usdUnits } from "@/shared/domain/money";
import { memorySlice, type SliceStore } from "@/shared/infrastructure/demo-store";
import { describeFinanceRepositoryContract } from "../application/finance-repository.contract";
import { createProjectBudgetMockRepository, createProjectEconomicsMockRepository } from "./finance.mock-repository";
import { createProjectBudgetMockWriter, createProjectEconomicsMockWriter } from "./finance.mock-writer";
import { buildFinanceSeed, type FinanceSlice } from "./seed";

function subject(slice: SliceStore<FinanceSlice>) {
  return {
    economics: { ...createProjectEconomicsMockRepository(slice), ...createProjectEconomicsMockWriter(slice) },
    budgets: { ...createProjectBudgetMockRepository(slice), ...createProjectBudgetMockWriter(slice) },
  };
}

const terms = { total: 100, placed: 100, unitPrice: usdUnits(100) };
describeFinanceRepositoryContract("mock vacío", () => subject(memorySlice({ economics: [], settlements: [], budgets: [] })));
describeFinanceRepositoryContract("mock con semillas", () =>
  subject(
    memorySlice(
      buildFinanceSeed({
        settled: [{ projectId: asId<"Project">("prj_chacao_01"), settledOn: isoDate("2026-02-05"), terms }],
      }),
    ),
  ),
);
