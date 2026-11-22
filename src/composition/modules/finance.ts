import { brand } from "@/shared/config/brand";
import type { Clock } from "@/shared/domain/clock";
import type { IdGenerator } from "@/shared/domain/id";
import { checkParticipationClass } from "@/modules/participations";
import { sliceOf, type DemoStore } from "@/shared/infrastructure/demo-store";
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
import {
  createProjectBudgetMockWriter,
  createProjectEconomicsMockWriter,
} from "@/modules/finance/infrastructure/finance.mock-writer";
import {
  createSaveProjectEconomics,
  type SaveProjectEconomics,
} from "@/modules/finance/application/save-project-economics";
import { createGetProjectSheet, type GetProjectSheet } from "@/modules/finance/application/get-project-sheet";
import { createSaveProjectSheet, type SaveProjectSheet } from "@/modules/finance/application/save-project-sheet";
import { createDemoProjectSheetWriter } from "../project-sheet.demo-writer";
import type { DemoSnapshot } from "../demo-snapshot";
import type { ParticipationsModule } from "./participations";
import type { ProjectsModule } from "./projects";

export type FinanceModule = {
  readonly economicsRepository: ProjectEconomicsRepository;
  readonly settlementRepository: SettlementRepository;
  readonly budgetRepository: ProjectBudgetRepository;
  readonly getProjectDetail: GetProjectDetail;
  readonly getHoldingProjections: GetHoldingProjections;
  /** W-1: economía y presupuesto juntos. */
  readonly saveProjectEconomics: SaveProjectEconomics;
  /** W-2: ficha de inmueble por slug (cualquier etapa) y su guardado atómico. */
  readonly getProjectSheet: GetProjectSheet;
  readonly saveProjectSheet: SaveProjectSheet;
};

export function registerFinance(
  store: DemoStore<DemoSnapshot>,
  deps: {
    readonly projects: Pick<
      ProjectsModule,
      "projectRepository" | "propertyRepository" | "contentRepository" | "mediaRepository"
    >;
    readonly participations: Pick<ParticipationsModule, "classRepository" | "listMarketplace">;
    readonly clock: Clock;
    readonly ids: IdGenerator;
  },
): FinanceModule {
  const source = sliceOf(store, "finance");
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
  const getProjectSheet = createGetProjectSheet({
    projects: deps.projects.projectRepository,
    properties: deps.projects.propertyRepository,
    content: deps.projects.contentRepository,
    classes: deps.participations.classRepository,
    economics: economicsRepository,
    budgets: budgetRepository,
    media: deps.projects.mediaRepository,
  });
  return {
    getProjectSheet,
    saveProjectSheet: createSaveProjectSheet({
      getSheet: getProjectSheet,
      projects: deps.projects.projectRepository,
      writer: createDemoProjectSheetWriter(store),
      ids: deps.ids,
      clock: deps.clock,
      codePrefix: brand.shortName,
      checkParticipationClass,
    }),
    economicsRepository,
    settlementRepository,
    budgetRepository,
    getProjectDetail,
    getHoldingProjections: createGetHoldingProjections({
      listMarketplace: deps.participations.listMarketplace,
      getProjectDetail,
    }),
    saveProjectEconomics: createSaveProjectEconomics({
      projects: deps.projects.projectRepository,
      economics: { ...economicsRepository, ...createProjectEconomicsMockWriter(source) },
      budgets: createProjectBudgetMockWriter(source),
    }),
  };
}
