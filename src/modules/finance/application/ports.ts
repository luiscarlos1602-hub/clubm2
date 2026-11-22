import type { ProjectId } from "@/modules/projects";
import type { ProjectBudget } from "../domain/budget";
import type { ProjectEconomics } from "../domain/project-economics";
import type { Settlement } from "../domain/settlement";
import type { SaveResult } from "@/shared/domain/repository-write";

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

/**
 * Escritura de la economía base (W-1): una por proyecto; `save` inserta o reemplaza por `projectId`.
 * INVALID_RECORD si no pasa el esquema; REFERENCE_NOT_FOUND si el proyecto no existe (FK en Supabase; el mock
 * no lo comprueba porque es otro slice: lo cubre el caso de uso). Si rechaza, no cambia nada.
 */
export interface ProjectEconomicsWriter {
  save(economics: ProjectEconomics): SaveResult<ProjectEconomics>;
}

/**
 * Escritura del presupuesto por líneas (W-1): uno por proyecto; `save` inserta o reemplaza por `projectId`.
 * INVALID_RECORD si no pasa el esquema; REFERENCE_NOT_FOUND si el proyecto no tiene economía guardada.
 * Si rechaza, no cambia nada: el presupuesto anterior queda entero (en Supabase, reemplazo en una transacción).
 */
export interface ProjectBudgetWriter {
  save(budget: ProjectBudget): SaveResult<ProjectBudget>;
}
