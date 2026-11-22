import type { ListingPhase } from "@/modules/participations"; // SOLO import type (D2)
import {
  TARGET_TERM_MONTHS,
  checkProjectProcess,
  normalizeRiskKinds,
  sortUpdatesNewestFirst,
  toProcessTimeline,
} from "@/modules/projects";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import { buildBudgetBreakdown, checkProjectBudget } from "./budget";
import { calculateHolderPayout } from "./holder-payout";
import type {
  DetailMode,
  ProjectDetail,
  ProjectDetailErrorCode,
  ProjectDetailSource,
} from "./project-detail-types";
import { buildScenarios } from "./scenarios";
import type { SimulationBase } from "./simulator";

export type {
  DetailMode,
  ProjectDetail,
  ProjectDetailErrorCode,
  ProjectDetailSource,
} from "./project-detail-types";

type DetailError = DomainError<ProjectDetailErrorCode>;

function modeOf(phase: ListingPhase): DetailMode {
  if (phase === "open") return "open";
  return phase === "finished" ? "realized" : "fixed_projection";
}

/** Todos los projectId/propertyId deben coincidir con la tarjeta y el proyecto. */
function idsMatch(s: ProjectDetailSource): boolean {
  const id = s.project.id;
  const ownedByProject = [
    s.listing.projectId,
    s.participationClass.projectId,
    s.economics.projectId,
    s.budget.projectId,
    s.settlement?.projectId ?? id,
    s.process?.projectId ?? id,
    s.risks?.projectId ?? id,
    ...s.updates.map((u) => u.projectId),
  ];
  return (
    ownedByProject.every((p) => p === id) &&
    s.property.id === s.project.propertyId &&
    s.profile.propertyId === s.property.id
  );
}

function simulationBaseOf(s: ProjectDetailSource): SimulationBase {
  const { economics, participationClass: c, listing } = s;
  return {
    salePrice: economics.targetSalePrice,
    acquisitionCost: economics.acquisitionCost,
    recoveryBudget: economics.recoveryBudget,
    saleCosts: economics.estimatedSaleCosts,
    total: c.total,
    unitPrice: c.unitPrice,
    placed: c.placed,
    targetTermMonths: listing.targetTermMonths ?? TARGET_TERM_MONTHS,
  };
}

/** D4: 1…holdingMax por persona; en colocación abierta, no más que las disponibles. 0 = sin cupos. */
function maxHeldOf(s: ProjectDetailSource): number {
  const cap =
    s.listing.phase === "open" ? s.listing.participations.available : s.participationClass.placed;
  return cap < 1 ? 0 : Math.min(s.holdingMax, cap);
}

function check(s: ProjectDetailSource): DetailError | null {
  if (!idsMatch(s))
    return { code: "PROJECT_MISMATCH", detail: "la ficha mezcla datos de proyectos distintos" };
  const budget = checkProjectBudget(s.budget, s.economics);
  if (!budget.ok) return budget.error;
  if (s.process !== null && !checkProjectProcess(s.process).ok) {
    return { code: "INVALID_PROCESS", detail: "el proceso publicado no es coherente" };
  }
  if (s.listing.phase === "finished" && s.settlement === null) {
    return { code: "MISSING_SETTLEMENT", detail: "un proyecto finalizado necesita su liquidación" };
  }
  return null;
}

/** La ficha se arma aquí (D5). Pura, nunca lanza. */
export function buildProjectDetail(s: ProjectDetailSource): Result<ProjectDetail, DetailError> {
  const error = check(s);
  if (error !== null) return err(error.code, error.detail);

  const mode = modeOf(s.listing.phase);
  const base = simulationBaseOf(s);
  const maxHeld = maxHeldOf(s);
  const payout =
    mode === "realized" && s.settlement !== null
      ? calculateHolderPayout(s.settlement.distribution, 1)
      : null;

  return ok({
    listing: s.listing,
    property: s.property,
    profile: s.profile,
    participationClass: s.participationClass,
    economics: s.economics,
    settlement: s.settlement,
    mode,
    budget: buildBudgetBreakdown(s.economics, s.budget),
    simulation: { base, maxHeld, heldRange: { min: 1, max: Math.max(1, maxHeld) } },
    scenarios: mode === "realized" ? [] : buildScenarios(base),
    realized: payout !== null && payout.ok ? payout.value : null,
    process: s.process === null ? null : toProcessTimeline(s.listing.acquiredOn, s.process),
    updates: sortUpdatesNewestFirst(s.updates),
    risks: s.risks === null ? [] : normalizeRiskKinds(s.risks.kinds),
  });
}
