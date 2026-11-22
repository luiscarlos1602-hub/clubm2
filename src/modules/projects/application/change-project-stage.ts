import type { Clock } from "@/shared/domain/clock";
import type { RepositoryWriteErrorCode } from "@/shared/domain/repository-write";
import { err, type DomainError, type Result } from "@/shared/domain/result";
import type { Project, ProjectId } from "../domain/project";
import { checkProjectConsistency } from "../domain/project-consistency";
import {
  SETTLEMENT_STAGES,
  changeProjectStatus,
  type ProjectStatus,
} from "../domain/project-status";
import { isPublishedStatus } from "../domain/public-stage";
import type { ProjectRepository, ProjectWriter } from "./ports";

/**
 * Requisitos para publicar (S4) del proyecto ya con su nueva etapa. Vacío = listo.
 * La inyecta composition desde finance (la ficha completa vive allí); projects no importa finance.
 */
export type PublishGuard = (next: Project) => Promise<readonly DomainError[]>;

export type ChangeProjectStageErrorCode =
  | "PROJECT_NOT_FOUND"
  | "STAGE_RESERVED_FOR_SETTLEMENT"
  | "INVALID_TRANSITION"
  | "DATE_OUT_OF_ORDER"
  | "INCONSISTENT_TIMELINE"
  | "NOT_READY_TO_PUBLISH"
  | RepositoryWriteErrorCode;

export type ChangeProjectStage = (
  projectId: ProjectId,
  to: ProjectStatus,
) => Promise<Result<Project, DomainError<ChangeProjectStageErrorCode>>>;

/**
 * W-3. Cambia la etapa con `changeProjectStatus` (fecha efectiva = hoy del `Clock`; → acquired sella la compra),
 * comprueba la coherencia y, al pasar de interna a publicada (acquired → funding), los requisitos S4.
 * Venta y liquidación quedan para W-5 (STAGE_RESERVED_FOR_SETTLEMENT). Guarda con `ProjectWriter`. Nunca lanza.
 */
export function createChangeProjectStage(deps: {
  readonly projects: ProjectWriter & Pick<ProjectRepository, "findById">;
  readonly clock: Clock;
  readonly publishGuard: PublishGuard;
}): ChangeProjectStage {
  return async (projectId, to) => {
    if ((SETTLEMENT_STAGES as readonly ProjectStatus[]).includes(to)) {
      return err("STAGE_RESERVED_FOR_SETTLEMENT", "la venta y la liquidación se registran en W-5");
    }
    const project = await deps.projects.findById(projectId);
    if (project === null) return err("PROJECT_NOT_FOUND", `no existe el proyecto ${projectId}`);

    const changed = changeProjectStatus(project, to, deps.clock.today());
    if (!changed.ok) return changed;
    const consistent = checkProjectConsistency(changed.value);
    if (!consistent.ok) return consistent;

    if (!isPublishedStatus(project.status) && isPublishedStatus(to)) {
      const missing = await deps.publishGuard(changed.value);
      if (missing.length > 0) {
        return err("NOT_READY_TO_PUBLISH", missing.map((m) => m.detail ?? m.code).join("; "));
      }
    }
    return deps.projects.save(changed.value);
  };
}
