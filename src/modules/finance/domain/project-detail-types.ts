import type { ParticipationClass, ProjectListing } from "@/modules/participations"; // SOLO import type (D2)
import type {
  ProcessStageTimeline,
  Project,
  ProjectProcess,
  ProjectRiskKind,
  ProjectRisks,
  ProjectUpdate,
  Property,
  PropertyProfile,
} from "@/modules/projects";
import type { BudgetBreakdown, BudgetErrorCode, ProjectBudget } from "./budget";
import type { HolderPayout } from "./holder-payout";
import type { ProjectEconomics } from "./project-economics";
import type { ScenarioRow } from "./scenarios";
import type { Settlement } from "./settlement";
import type { SimulationBase } from "./simulator";

/** D5: open = simulador + escenarios · fixed_projection = solo escenarios · realized = resultado realizado. */
export type DetailMode = "open" | "fixed_projection" | "realized";

export type ProjectDetail = {
  readonly listing: ProjectListing;
  readonly property: Property;
  readonly profile: PropertyProfile;
  readonly participationClass: ParticipationClass;
  readonly economics: ProjectEconomics;
  readonly settlement: Settlement | null;
  readonly mode: DetailMode;
  readonly budget: BudgetBreakdown;
  readonly simulation: {
    readonly base: SimulationBase;
    /** D4: open → min(holdingMax, disponibles); resto → min(holdingMax, colocadas). 0 = sin cupos. */
    readonly maxHeld: number;
    /** Para el control: { min: 1, max: max(1, maxHeld) }. */
    readonly heldRange: { readonly min: 1; readonly max: number };
  };
  /** [] en realized. */
  readonly scenarios: readonly ScenarioRow[];
  /** Solo en realized: calculateHolderPayout(settlement.distribution, 1). */
  readonly realized: HolderPayout | null;
  /** null sin proceso publicado. */
  readonly process: readonly ProcessStageTimeline[] | null;
  /** Más reciente primero. */
  readonly updates: readonly ProjectUpdate[];
  /** Normalizados (sin duplicados, en orden canónico). */
  readonly risks: readonly ProjectRiskKind[];
};

export type ProjectDetailSource = {
  readonly listing: ProjectListing;
  readonly project: Project;
  readonly property: Property;
  readonly profile: PropertyProfile;
  readonly participationClass: ParticipationClass;
  readonly economics: ProjectEconomics;
  readonly budget: ProjectBudget;
  readonly settlement: Settlement | null;
  readonly process: ProjectProcess | null;
  readonly updates: readonly ProjectUpdate[];
  readonly risks: ProjectRisks | null;
  /** HOLDING_LIMITS.max inyectado desde composition (D2). */
  readonly holdingMax: number;
};

export type ProjectDetailErrorCode =
  BudgetErrorCode | "PROJECT_MISMATCH" | "MISSING_SETTLEMENT" | "INVALID_PROCESS";
