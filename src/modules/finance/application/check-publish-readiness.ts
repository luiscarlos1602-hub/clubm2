import type { Project } from "@/modules/projects";
import type { DomainError } from "@/shared/domain/result";
import type { ProjectSheetIssue } from "../domain/project-sheet";
import { checkSheetPublishable } from "../domain/sheet-publish-readiness";
import type { GetProjectSheet } from "./get-project-sheet";

/** Firma compatible con `PublishGuard` de projects (composition la inyecta en `changeProjectStage`). */
export type CheckPublishReadiness = (
  next: Project,
) => Promise<readonly (ProjectSheetIssue | DomainError<"SHEET_NOT_FOUND">)[]>;

/**
 * W-3 · cierra la deuda [W-2 · para W-3]: acquired → funding exige los requisitos S4 "para publicar"
 * de la ficha guardada, igual que el asistente. Nunca lanza: una ficha que no se puede leer cuenta como pendiente.
 */
export function createCheckPublishReadiness(deps: {
  readonly getSheet: GetProjectSheet;
}): CheckPublishReadiness {
  return async (next) => {
    try {
      const sheet = await deps.getSheet(next.slug);
      if (sheet === null) return [{ code: "SHEET_NOT_FOUND", detail: `sin ficha para ${next.slug}` }];
      return checkSheetPublishable({ ...sheet, project: next });
    } catch (e) {
      return [{ code: "SHEET_NOT_FOUND", detail: e instanceof Error ? e.message : String(e) }];
    }
  };
}
