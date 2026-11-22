import type { DomainError, Result } from "@/shared/domain/result";
import { err } from "@/shared/domain/result";
import type { RepositoryWriteErrorCode } from "@/shared/domain/repository-write";
import type { Project, Property } from "../domain/project";
import { checkProjectConsistency, checkProperty } from "../domain/project-consistency";
import { isProjectSlug } from "../domain/project-slug";
import type { ProjectRepository, ProjectWriter, PropertyWriter } from "./ports";

export type SaveProjectErrorCode =
  | "INCONSISTENT_TIMELINE"
  | "INVALID_PROJECT_SLUG"
  | "INVALID_PROJECT_NAME"
  | "STATUS_CHANGE_NOT_ALLOWED"
  | RepositoryWriteErrorCode;
export type SaveProject = (project: Project) => Promise<Result<Project, DomainError<SaveProjectErrorCode>>>;

/**
 * W-1. Alta o edición de los datos del proyecto: valida con el dominio (fechas según estado, slug, nombre) y guarda.
 * Editar no cambia la etapa: si el proyecto ya existe con otro `status` → STATUS_CHANGE_NOT_ALLOWED; los cambios
 * de etapa pasan por `changeProjectStatus` (W-3). Nunca lanza.
 */
export function createSaveProject(deps: {
  readonly projects: ProjectWriter & Pick<ProjectRepository, "findById">;
}): SaveProject {
  return async (project) => {
    if (project.name.trim() === "") return err("INVALID_PROJECT_NAME", "el nombre es obligatorio");
    if (!isProjectSlug(project.slug)) {
      return err("INVALID_PROJECT_SLUG", "el slug debe ir en minúsculas, con guiones (kebab-case)");
    }
    const consistent = checkProjectConsistency(project);
    if (!consistent.ok) return consistent;
    const stored = await deps.projects.findById(project.id);
    if (stored !== null && stored.status !== project.status) {
      return err("STATUS_CHANGE_NOT_ALLOWED", "la etapa se cambia desde su propio paso, no al editar");
    }
    return deps.projects.save(project);
  };
}

export type SavePropertyErrorCode = "INVALID_PROPERTY" | RepositoryWriteErrorCode;
export type SaveProperty = (property: Property) => Promise<Result<Property, DomainError<SavePropertyErrorCode>>>;

/** W-1. Valida con `checkProperty` y guarda. Nunca lanza. */
export function createSaveProperty(deps: { readonly properties: PropertyWriter }): SaveProperty {
  return async (property) => {
    const checked = checkProperty(property);
    if (!checked.ok) return checked;
    return deps.properties.save(property);
  };
}
