import type { ParticipationClass } from "@/modules/participations"; // SOLO import type (D2)
import type { ProjectRepository } from "@/modules/projects";
import type { Clock } from "@/shared/domain/clock";
import type { DomainError, Result } from "@/shared/domain/result";
import type { IdGenerator } from "@/shared/domain/id";
import type { RepositoryWriteError } from "@/shared/domain/repository-write";
import { buildProjectSheet } from "../domain/build-project-sheet";
import type { ProjectSheet, ProjectSheetInput, ProjectSheetIssue } from "../domain/project-sheet";
import type { GetProjectSheet } from "./get-project-sheet";
import type { ProjectSheetWriter } from "./ports";

export type SaveProjectSheetError = ProjectSheetIssue | RepositoryWriteError;
/** `slug` null = alta; con slug = edición de ese proyecto. */
export type SaveProjectSheet = (
  input: ProjectSheetInput,
  slug: string | null,
) => Promise<Result<ProjectSheet, readonly SaveProjectSheetError[]>>;

export type SaveProjectSheetDeps = {
  readonly getSheet: GetProjectSheet;
  readonly projects: Pick<ProjectRepository, "list">;
  readonly writer: ProjectSheetWriter;
  readonly ids: IdGenerator;
  readonly clock: Clock;
  /** brand.shortName, inyectado desde composition. */
  readonly codePrefix: string;
  /** participations.checkParticipationClass, inyectada desde composition (D2). */
  readonly checkParticipationClass: (
    c: ParticipationClass,
  ) => Result<ParticipationClass, DomainError>;
};

/**
 * W-2. Alta o edición de la ficha: carga la existente (si hay slug), arma el contexto con el reloj y los ids
 * inyectados, llama a `buildProjectSheet` (reúne todos los errores) y solo si pasa escribe todo o nada.
 */
export function createSaveProjectSheet(deps: SaveProjectSheetDeps): SaveProjectSheet {
  return async (input, slug) => {
    const existing = slug === null ? null : await deps.getSheet(slug);
    if (slug !== null && existing === null) {
      return {
        ok: false,
        error: [{ code: "REFERENCE_NOT_FOUND", detail: `no existe el proyecto ${slug}` }],
      };
    }
    const existingCodes = (await deps.projects.list()).map((p) => p.code);
    const built = buildProjectSheet(input, {
      existing,
      existingCodes,
      codePrefix: deps.codePrefix,
      today: deps.clock.today(),
      ids: {
        projectId: deps.ids.next<"Project">("prj"),
        propertyId: deps.ids.next<"Property">("prp"),
        classId: deps.ids.next<"ParticipationClass">("cls"),
      },
      checkParticipationClass: deps.checkParticipationClass,
    });
    if (!built.ok) return built;
    const saved = await deps.writer.save(built.value);
    return saved.ok ? saved : { ok: false, error: [saved.error] };
  };
}
