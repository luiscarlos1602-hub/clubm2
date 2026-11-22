import type { ProjectRepository } from "@/modules/projects";
import type { RepositoryWriteErrorCode } from "@/shared/domain/repository-write";
import { err, type DomainError, type Result } from "@/shared/domain/result";
import type { ParticipationClass } from "../domain/participation";
import { checkParticipationClass } from "../domain/participation-consistency";
import type { ParticipationClassWriter } from "./ports";

export type SaveParticipationClassErrorCode =
  | "PROJECT_NOT_FOUND"
  | "INVALID_PARTICIPATION_CLASS"
  | RepositoryWriteErrorCode;
export type SaveParticipationClass = (
  cls: ParticipationClass,
) => Promise<Result<ParticipationClass, DomainError<SaveParticipationClassErrorCode>>>;

/**
 * W-1. Valida con `checkParticipationClass` y que el proyecto exista, y guarda.
 * F = total × precio (contra la economía de finance) lo valida la ficha completa de W-2.
 */
export function createSaveParticipationClass(deps: {
  readonly projects: Pick<ProjectRepository, "findById">;
  readonly classes: ParticipationClassWriter;
}): SaveParticipationClass {
  return async (cls) => {
    if ((await deps.projects.findById(cls.projectId)) === null) {
      return err("PROJECT_NOT_FOUND", `no existe el proyecto ${cls.projectId}`);
    }
    const checked = checkParticipationClass(cls);
    if (!checked.ok) return checked;
    return deps.classes.save(cls);
  };
}
