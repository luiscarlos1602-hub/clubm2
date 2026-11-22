import type { ProjectRepository } from "@/modules/projects";
import type { RepositoryWriteErrorCode } from "@/shared/domain/repository-write";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import { checkProjectBudget, type BudgetErrorCode, type ProjectBudget } from "../domain/budget";
import { checkProjectEconomics, type ProjectEconomics } from "../domain/project-economics";
import type { ProjectBudgetWriter, ProjectEconomicsRepository, ProjectEconomicsWriter } from "./ports";

export type SaveProjectEconomicsInput = {
  readonly economics: ProjectEconomics;
  readonly budget: ProjectBudget;
};
export type SaveProjectEconomicsErrorCode =
  | "PROJECT_NOT_FOUND"
  | "INVALID_ECONOMICS"
  | BudgetErrorCode
  | RepositoryWriteErrorCode;
export type SaveProjectEconomics = (
  input: SaveProjectEconomicsInput,
) => Promise<Result<SaveProjectEconomicsInput, DomainError<SaveProjectEconomicsErrorCode>>>;

export type SaveProjectEconomicsDeps = {
  readonly projects: Pick<ProjectRepository, "findById">;
  readonly economics: ProjectEconomicsWriter & Pick<ProjectEconomicsRepository, "findByProject">;
  readonly budgets: ProjectBudgetWriter;
};

/**
 * W-1. Economía y presupuesto se guardan juntos: así cambiar F nunca deja un presupuesto que no la suma.
 * Valida todo antes de escribir. Si el presupuesto se rechaza tras guardar la economía, restaura la economía
 * anterior (si no había, la economía nueva queda sin presupuesto y el error se devuelve). En Supabase será
 * atómico con la RPC `save_project_sheet` (DB-4).
 */
export function createSaveProjectEconomics(deps: SaveProjectEconomicsDeps): SaveProjectEconomics {
  return async (input) => {
    const { economics, budget } = input;
    if ((await deps.projects.findById(economics.projectId)) === null) {
      return err("PROJECT_NOT_FOUND", `no existe el proyecto ${economics.projectId}`);
    }
    const checkedEconomics = checkProjectEconomics(economics);
    if (!checkedEconomics.ok) return checkedEconomics;
    const checkedBudget = checkProjectBudget(budget, economics);
    if (!checkedBudget.ok) return checkedBudget;

    const previous = await deps.economics.findByProject(economics.projectId);
    const savedEconomics = await deps.economics.save(economics);
    if (!savedEconomics.ok) return savedEconomics;
    const savedBudget = await deps.budgets.save(budget);
    if (!savedBudget.ok) {
      if (previous !== null) await deps.economics.save(previous);
      return savedBudget;
    }
    return ok({ economics: savedEconomics.value, budget: savedBudget.value });
  };
}
