export type {
  ValueBasis,
  DistributionShares,
  ParticipationTerms,
  DistributionInput,
  DistributionInputErrorCode,
  CapitalReturn,
  Distribution,
  NoDistribution,
  DistributionOutcome,
} from "./domain/distribution";
export { DEFAULT_DISTRIBUTION_SHARES, calculateDistribution } from "./domain/distribution";
export { validateDistributionInput } from "./domain/validate-distribution-input";
export type { HolderPayout } from "./domain/holder-payout";
export { calculateHolderPayout } from "./domain/holder-payout";
export type { ProjectEconomics } from "./domain/project-economics";
export type {
  SettlementId,
  RealizedDistributionInput,
  Settlement,
  SettlementErrorCode,
} from "./domain/settlement";
export { createSettlement } from "./domain/settlement";
export type { ProfitRateErrorCode } from "./domain/profit-rate";
export { calculateProfitRate } from "./domain/profit-rate";
// P4 · ficha interconectada (plan 006 §3.3–3.4). Sigue sin exportar UI (ADR-012).
export type {
  BudgetCategory,
  BudgetItem,
  BudgetLine,
  ProjectBudget,
  BudgetErrorCode,
  BudgetBreakdown,
} from "./domain/budget";
export {
  BUDGET_CATEGORIES,
  BUDGET_ITEMS,
  BUDGET_ITEM_CATEGORY,
  checkProjectBudget,
  worksSubtotal,
  buildBudgetBreakdown,
} from "./domain/budget";
export type {
  SimulationBase,
  SimulationControls,
  SimulationOutcome,
  SimulationResult,
} from "./domain/simulator";
export { SIMULATION_RANGES, neutralControls, normalizeControls, simulateProjection } from "./domain/simulator";
export type { StressPresetId } from "./domain/stress-presets";
export { STRESS_PRESET_IDS, STRESS_PRESETS, applyStressPreset } from "./domain/stress-presets";
export type { ScenarioId, ScenarioRow } from "./domain/scenarios";
export { SCENARIO_IDS, SCENARIO_ASSUMPTIONS, buildScenarios } from "./domain/scenarios";
export { estimateReservation, reservationAmount, projectHoldingGain } from "./domain/holding-projection";
export type { DetailMode, ProjectDetail, ProjectDetailErrorCode } from "./domain/project-detail";
export { buildProjectDetail } from "./domain/project-detail";
export type { ProjectBudgetRepository } from "./application/ports";
export type { GetProjectDetail } from "./application/get-project-detail";
export type {
  GetHoldingProjections,
  HoldingProjectionRequest,
  HoldingProjections,
} from "./application/get-holding-projections";
