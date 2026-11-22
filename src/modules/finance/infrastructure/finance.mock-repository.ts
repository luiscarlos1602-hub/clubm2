import type { SliceReader } from "@/shared/infrastructure/demo-store";
import type {
  ProjectBudgetRepository,
  ProjectEconomicsRepository,
  ProjectSaleRepository,
  SettlementRepository,
} from "../application/ports";
import type { FinanceSlice } from "./seed";

export function createProjectEconomicsMockRepository(
  source: SliceReader<FinanceSlice>,
): ProjectEconomicsRepository {
  return {
    list: () => Promise.resolve([...source.read().economics]),
    findByProject: (projectId) =>
      Promise.resolve(source.read().economics.find((e) => e.projectId === projectId) ?? null),
  };
}

export function createSettlementMockRepository(source: SliceReader<FinanceSlice>): SettlementRepository {
  return {
    list: () => Promise.resolve([...source.read().settlements]),
    findByProject: (projectId) =>
      Promise.resolve(source.read().settlements.find((s) => s.projectId === projectId) ?? null),
  };
}

export function createProjectBudgetMockRepository(source: SliceReader<FinanceSlice>): ProjectBudgetRepository {
  return {
    findByProject: (projectId) =>
      Promise.resolve(source.read().budgets.find((b) => b.projectId === projectId) ?? null),
  };
}

export function createProjectSaleMockRepository(source: SliceReader<FinanceSlice>): ProjectSaleRepository {
  return {
    list: () => Promise.resolve([...source.read().sales]),
    findByProject: (projectId) =>
      Promise.resolve(source.read().sales.find((x) => x.projectId === projectId) ?? null),
  };
}
