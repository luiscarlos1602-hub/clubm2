import type { ParticipationClassRepository } from "@/modules/participations"; // SOLO import type (D2)
import type { ProjectId, ProjectRepository } from "@/modules/projects";
import { changeProjectStatus, checkProjectConsistency } from "@/modules/projects";
import type { Clock } from "@/shared/domain/clock";
import type { IdGenerator } from "@/shared/domain/id";
import type { RepositoryWriteErrorCode } from "@/shared/domain/repository-write";
import { err, type DomainError, type Result } from "@/shared/domain/result";
import type { DistributionInputErrorCode } from "../domain/distribution";
import { buildRealizedInput } from "../domain/settlement-input";
import { createSettlement, type Settlement, type SettlementId } from "../domain/settlement";
import type {
  ProjectEconomicsRepository,
  ProjectSaleRepository,
  SettlementRepository,
  SettlementWriter,
} from "./ports";

export type SettleProjectErrorCode =
  | "PROJECT_NOT_FOUND"
  | "NOT_SOLD"
  | "ALREADY_SETTLED"
  | "SALE_NOT_FOUND"
  | "ECONOMICS_NOT_FOUND"
  | "CLASS_NOT_FOUND"
  | DistributionInputErrorCode
  | "INVALID_TRANSITION"
  | "DATE_OUT_OF_ORDER"
  | "INCONSISTENT_TIMELINE"
  | RepositoryWriteErrorCode;

export type SettleProject = (projectId: ProjectId) => Promise<Result<Settlement, DomainError<SettleProjectErrorCode>>>;

/**
 * W-5. Liquida un proyecto vendido: arma la entrada con `buildRealizedInput` (venta real + economía + clase al
 * liquidar), calcula con el motor (ganancia, cero o pérdida) y guarda la liquidación con el proyecto en `settled`,
 * en un solo guardado atómico. `settledOn` = hoy del Clock (CA13). Nunca lanza.
 */
export function createSettleProject(deps: {
  readonly projects: Pick<ProjectRepository, "findById">;
  readonly sales: ProjectSaleRepository;
  readonly settlements: SettlementRepository & SettlementWriter;
  readonly economics: Pick<ProjectEconomicsRepository, "findByProject">;
  readonly classes: Pick<ParticipationClassRepository, "findByProject">;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}): SettleProject {
  return async (projectId) => {
    const project = await deps.projects.findById(projectId);
    if (project === null) return err("PROJECT_NOT_FOUND", `no existe el proyecto ${projectId}`);
    if (project.status === "settled" || (await deps.settlements.findByProject(projectId)) !== null) {
      return err("ALREADY_SETTLED", `el proyecto ${project.code} ya está liquidado`);
    }
    if (project.status !== "sold") return err("NOT_SOLD", `el proyecto ${project.code} está en ${project.status}`);

    const sale = await deps.sales.findByProject(projectId);
    if (sale === null) return err("SALE_NOT_FOUND", `el proyecto ${project.code} no tiene venta registrada`);
    const economics = await deps.economics.findByProject(projectId);
    if (economics === null) return err("ECONOMICS_NOT_FOUND", `el proyecto ${project.code} no tiene economía`);
    const cls = await deps.classes.findByProject(projectId);
    if (cls === null) return err("CLASS_NOT_FOUND", `el proyecto ${project.code} no tiene clase de participación`);

    const today = deps.clock.today();
    const settlement = createSettlement({
      id: deps.ids.next<"Settlement">("stl") as SettlementId,
      projectId,
      settledOn: today,
      input: buildRealizedInput({
        sale,
        economics,
        terms: { total: cls.total, placed: cls.placed, unitPrice: cls.unitPrice },
      }),
    });
    if (!settlement.ok) return settlement;

    const changed = changeProjectStatus(project, "settled", today);
    if (!changed.ok) return changed;
    const consistent = checkProjectConsistency(changed.value);
    if (!consistent.ok) return consistent;

    return deps.settlements.settle({ project: changed.value, settlement: settlement.value });
  };
}
