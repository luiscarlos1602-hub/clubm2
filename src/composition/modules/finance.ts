import type { DemoStore } from "@/shared/infrastructure/demo-store";
import type { ProjectEconomicsRepository, SettlementRepository } from "@/modules/finance/application/ports";
import {
  createProjectEconomicsMockRepository,
  createSettlementMockRepository,
} from "@/modules/finance/infrastructure/finance.mock-repository";
import type { DemoSnapshot } from "../demo-snapshot";

export type FinanceModule = {
  readonly economicsRepository: ProjectEconomicsRepository;
  readonly settlementRepository: SettlementRepository;
};

export function registerFinance(store: DemoStore<DemoSnapshot>): FinanceModule {
  const source = { read: () => store.read().finance };
  return {
    economicsRepository: createProjectEconomicsMockRepository(source),
    settlementRepository: createSettlementMockRepository(source),
  };
}
