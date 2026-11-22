import type { ProjectId } from "@/modules/projects";
import type { HolderId, Participation, ParticipationClass } from "../domain/participation";

/** Puerto de lectura de clases de participación. En F1-4 no hay escrituras (P5). */
export interface ParticipationClassRepository {
  list(): Promise<readonly ParticipationClass[]>;
  findByProject(projectId: ProjectId): Promise<ParticipationClass | null>;
}

/** Puerto de lectura de tenencias. */
export interface ParticipationRepository {
  /** Orden por `subscribedOn` ascendente. */
  listByHolder(holderId: HolderId): Promise<readonly Participation[]>;
}
