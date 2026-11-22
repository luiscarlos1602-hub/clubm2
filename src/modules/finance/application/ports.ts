import type { ProjectId } from "@/modules/projects";
import type { ProjectBudget } from "../domain/budget";
import type { ProjectEconomics } from "../domain/project-economics";
import type { Settlement } from "../domain/settlement";

/** Puerto de lectura de la economía base de cada proyecto (proyección). */
export interface ProjectEconomicsRepository {
  list(): Promise<readonly ProjectEconomics[]>;
  findByProject(projectId: ProjectId): Promise<ProjectEconomics | null>;
}

/** Puerto de lectura de liquidaciones realizadas. En F1-4 no hay escrituras (B5). */
export interface SettlementRepository {
  list(): Promise<readonly Settlement[]>;
  findByProject(projectId: ProjectId): Promise<Settlement | null>;
}

/** Puerto de lectura del presupuesto integral F por líneas (lo presupuestado; B3/B5 añaden lo devengado). */
export interface ProjectBudgetRepository {
  findByProject(projectId: ProjectId): Promise<ProjectBudget | null>;
}
