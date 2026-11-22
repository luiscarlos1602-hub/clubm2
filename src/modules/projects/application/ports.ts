import type { ProjectProcess } from "../domain/process";
import type { Project, ProjectId, Property, PropertyId } from "../domain/project";
import type { ProjectRisks } from "../domain/project-risk";
import type { ProjectImage, ProjectImageKind } from "../domain/project-image";
import type { ProjectUpdate } from "../domain/project-update";
import type { PropertyProfile } from "../domain/property-profile";
import type { SaveResult } from "@/shared/domain/repository-write";

/** Puerto de lectura de proyectos. Las escrituras van por `ProjectWriter` (W-1). */
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

/**
 * Puerto de escritura de proyectos (W-1). `save` inserta o reemplaza por `id`.
 * Rechaza con INVALID_RECORD si no pasa el esquema, DUPLICATE si otro proyecto ya usa el código o el slug,
 * REFERENCE_NOT_FOUND si `propertyId` no existe. Si rechaza, no cambia nada.
 * No valida reglas de negocio: eso lo hace el caso de uso (`saveProject`).
 */
export interface ProjectWriter {
  save(project: Project): SaveResult<Project>;
}

/** Puerto de escritura de inmuebles (W-1). `save` inserta o reemplaza por `id`; INVALID_RECORD si no pasa el esquema. Si rechaza, no cambia nada. */
export interface PropertyWriter {
  save(property: Property): SaveResult<Property>;
}

/**
 * Puerto de escritura del contenido de la ficha (W-2). Upsert por `propertyId` (perfil) o `projectId` (proceso y riesgos).
 * INVALID_RECORD si no pasa el esquema; REFERENCE_NOT_FOUND si el inmueble o proyecto no existe. Si rechaza, no cambia nada.
 * No valida reglas de negocio (eso lo hace `buildProjectSheet`).
 */
export interface ProjectContentWriter {
  saveProfile(profile: PropertyProfile): SaveResult<PropertyProfile>;
  saveProcess(process: ProjectProcess): SaveResult<ProjectProcess>;
  saveRisks(risks: ProjectRisks): SaveResult<ProjectRisks>;
}

/** Imagen disponible para elegir en el asistente. Mock: SVG de `public/images/proyectos/`; DB-3: el bucket. */
export type ReferenceImageOption = {
  readonly url: string;
  readonly kind: ProjectImageKind;
  readonly label: string;
};

/** Puerto de lectura de imágenes (W-2). `imagesOf` devuelve solo las guardadas; el respaldo por código lo resuelve `resolveProjectImages`. */
export interface ProjectMediaRepository {
  imagesOf(projectId: ProjectId): Promise<readonly ProjectImage[]>;
  referenceLibrary(): Promise<readonly ReferenceImageOption[]>;
}

/**
 * Puerto de escritura de imágenes (W-2). `replaceImages` reemplaza el juego entero del proyecto (vacío = quitarlas).
 * DUPLICATE si hay dos del mismo `kind`; INVALID_RECORD por esquema; REFERENCE_NOT_FOUND si el proyecto no existe
 * o alguna imagen pertenece a otro proyecto. Si rechaza, no cambia nada.
 */
export interface ProjectMediaWriter {
  replaceImages(projectId: ProjectId, images: readonly ProjectImage[]): SaveResult<readonly ProjectImage[]>;
}
