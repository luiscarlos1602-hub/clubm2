import type { DemoStore } from "@/shared/infrastructure/demo-store";
import { HOLDING_LIMITS } from "@/modules/participations/domain/participation";
import {
  createGetHoldingProjections,
  type GetHoldingProjections,
} from "@/modules/finance/application/get-holding-projections";
import { createGetProjectDetail, type GetProjectDetail } from "@/modules/finance/application/get-project-detail";
import type {
  ProjectBudgetRepository,
  ProjectEconomicsRepository,
  SettlementRepository,
} from "@/modules/finance/application/ports";
import {
  createProjectBudgetMockRepository,
  createProjectEconomicsMockRepository,
  createSettlementMockRepository,
} from "@/modules/finance/infrastructure/finance.mock-repository";
import type { DemoSnapshot } from "../demo-snapshot";
import type { ParticipationsModule } from "./participations";
import type { ProjectsModule } from "./projects";

export type FinanceModule = {
  readonly economicsRepository: ProjectEconomicsRepository;
  readonly settlementRepository: SettlementRepository;
  readonly budgetRepository: ProjectBudgetRepository;
  readonly getProjectDetail: GetProjectDetail;
  readonly getHoldingProjections: GetHoldingProjections;
};

export function registerFinance(
  store: DemoStore<DemoSnapshot>,
  deps: {
    readonly projects: Pick<ProjectsModule, "projectRepository" | "propertyRepository" | "contentRepository">;
    readonly participations: Pick<ParticipationsModule, "classRepository" | "listMarketplace">;
  },
): FinanceModule {
  const source = { read: () => store.read().finance };
  const economicsRepository = createProjectEconomicsMockRepository(source);
  const settlementRepository = createSettlementMockRepository(source);
  const budgetRepository = createProjectBudgetMockRepository(source);
  const getProjectDetail = createGetProjectDetail({
    listMarketplace: deps.participations.listMarketplace,
    projects: deps.projects.projectRepository,
    properties: deps.projects.propertyRepository,
    content: deps.projects.contentRepository,
    classes: deps.participations.classRepository,
    economics: economicsRepository,
    budgets: budgetRepository,
    settlements: settlementRepository,
    holdingMax: HOLDING_LIMITS.max,
  });
  return {
    economicsRepository,
    settlementRepository,
    budgetRepository,
    getProjectDetail,
    getHoldingProjections: createGetHoldingProjections({
      listMarketplace: deps.participations.listMarketplace,
      getProjectDetail,
    }),
  };
}
