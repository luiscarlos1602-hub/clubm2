import type { Project, ProjectId, Property, PropertyId } from "../domain/project";

/** Puerto de lectura de proyectos. En F1-4 no hay escrituras (las añaden B3/B4). */
export interface ProjectRepository {
  /** Orden por `code` ascendente. */
  list(): Promise<readonly Project[]>;
  findById(id: ProjectId): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
}

/** Puerto de lectura de inmuebles. */
export interface PropertyRepository {
  list(): Promise<readonly Property[]>;
  findById(id: PropertyId): Promise<Property | null>;
}
