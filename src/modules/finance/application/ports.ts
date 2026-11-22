import type { Project, ProjectId } from "@/modules/projects";
import type { ProjectBudget } from "../domain/budget";
import type { ProjectSheet } from "../domain/project-sheet";
import type { ProjectEconomics } from "../domain/project-economics";
import type { ProjectSale } from "../domain/project-sale";
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
 * no lo comprueba porque es otro slice: lo cubre el caso de uso). Si rechaza, el almacén queda igual.
 */
export interface ProjectEconomicsWriter {
  save(economics: ProjectEconomics): SaveResult<ProjectEconomics>;
}

/**
 * Escritura del presupuesto por líneas (W-1): uno por proyecto; `save` inserta o reemplaza por `projectId`.
 * INVALID_RECORD si no pasa el esquema; REFERENCE_NOT_FOUND si el proyecto no tiene economía guardada.
 * Si rechaza, el almacén queda igual: el presupuesto anterior queda entero (en Supabase, reemplazo en una transacción).
 */
export interface ProjectBudgetWriter {
  save(budget: ProjectBudget): SaveResult<ProjectBudget>;
}

/**
 * Escritura de la ficha completa (W-2): inmueble, proyecto, perfil, proceso, riesgos, clase, economía,
 * presupuesto e imágenes, todo o nada. Alta o edición según exista el proyecto por id.
 * DUPLICATE si el código o el slug ya los usa otro proyecto; INVALID_RECORD si una parte no pasa el esquema.
 * Si rechaza, el almacén queda igual (en local, el escritor de composition; en Supabase, una RPC transaccional, DB-4).
 */
export interface ProjectSheetWriter {
  save(sheet: ProjectSheet): SaveResult<ProjectSheet>;
}

/** Puerto de lectura de ventas reales (W-5): una por proyecto, no se corrige. */
export interface ProjectSaleRepository {
  list(): Promise<readonly ProjectSale[]>;
  findByProject(projectId: ProjectId): Promise<ProjectSale | null>;
}

/**
 * Escritura atómica de la venta (W-5): guarda la venta y el proyecto ya en `sold`, o nada.
 * DUPLICATE si el proyecto ya tiene venta; REFERENCE_NOT_FOUND si el proyecto no existe;
 * INVALID_RECORD si la venta o el proyecto no pasan el esquema. Si rechaza, nada cambia
 * (en local, el escritor de composition sobre dos slices; en Supabase, una RPC transaccional, DB-4).
 */
export interface ProjectSaleWriter {
  record(args: { readonly project: Project; readonly sale: ProjectSale }): SaveResult<ProjectSale>;
}

/**
 * Escritura atómica de la liquidación (W-5): guarda la liquidación y el proyecto en `settled`, o nada.
 * DUPLICATE si ya hay liquidación; REFERENCE_NOT_FOUND si el proyecto no existe o no tiene venta;
 * INVALID_RECORD por esquema. Si rechaza, nada cambia.
 */
export interface SettlementWriter {
  settle(args: { readonly project: Project; readonly settlement: Settlement }): SaveResult<Settlement>;
}
