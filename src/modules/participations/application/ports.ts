import type { ProjectId } from "@/modules/projects";
import type { SaveResult } from "@/shared/domain/repository-write";
import type { HolderId, Participation, ParticipationClass } from "../domain/participation";

/** Puerto de lectura de clases de participación. Las escrituras van por `ParticipationClassWriter` (W-1). */
export interface ParticipationClassRepository {
  list(): Promise<readonly ParticipationClass[]>;
  findByProject(projectId: ProjectId): Promise<ParticipationClass | null>;
}

/** Puerto de lectura de tenencias. */
export interface ParticipationRepository {
  /** Orden por `subscribedOn` ascendente. */
  listByHolder(holderId: HolderId): Promise<readonly Participation[]>;
}

/**
 * Escritura de la clase de participación (W-1): una por proyecto; `save` inserta o reemplaza por `id`.
 * INVALID_RECORD si no pasa el esquema; DUPLICATE si otra clase ya es de ese proyecto. Si rechaza, no cambia nada.
 */
export interface ParticipationClassWriter {
  save(cls: ParticipationClass): SaveResult<ParticipationClass>;
}
