import type { ProjectProcess } from "../domain/process";
import type { Project, ProjectId, Property, PropertyId } from "../domain/project";
import type { ProjectRisks } from "../domain/project-risk";
import type { ProjectUpdate } from "../domain/project-update";
import type { PropertyProfile } from "../domain/property-profile";

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

/** Puerto de lectura del contenido publicado de la ficha (P4): perfil, proceso, actualizaciones y riesgos. */
export interface ProjectContentRepository {
  profileOf(propertyId: PropertyId): Promise<PropertyProfile | null>;
  processOf(projectId: ProjectId): Promise<ProjectProcess | null>;
  /** Sin orden garantizado: ordena el dominio. */
  updatesOf(projectId: ProjectId): Promise<readonly ProjectUpdate[]>;
  risksOf(projectId: ProjectId): Promise<ProjectRisks | null>;
}
