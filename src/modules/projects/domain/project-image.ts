import type { Project, ProjectId } from "./project";

/** Imágenes de la ficha (plan 011 §3). Galería llega con DB-3, junto con `id` y `position`. */
export const PROJECT_IMAGE_KINDS = ["before", "after", "projection"] as const;
export type ProjectImageKind = (typeof PROJECT_IMAGE_KINDS)[number];

/** Una por tipo. `isReference: true` = ilustración de referencia (rótulo obligatorio "Imagen de referencia"). */
export type ProjectImage = {
  readonly projectId: ProjectId;
  readonly kind: ProjectImageKind;
  readonly url: string;
  readonly alt: string;
  readonly isReference: boolean;
};

/** Nombre de archivo de cada tipo en `public/images/proyectos/<código>/`. */
const REFERENCE_FILE: Readonly<Record<ProjectImageKind, string>> = Object.freeze({
  before: "antes",
  after: "despues",
  projection: "proyeccion",
});

/** Texto alternativo de una ilustración de referencia (D10). */
const REFERENCE_ALT: Readonly<Record<ProjectImageKind, string>> = Object.freeze({
  before: "Ilustración de referencia del inmueble antes de la reforma",
  after: "Ilustración de referencia del inmueble después de la reforma",
  projection: "Ilustración de referencia de la proyección de la reforma",
});

type ProjectRef = Pick<Project, "id" | "code">;

export function referenceImageUrl(code: string, kind: ProjectImageKind): string {
  return `/images/proyectos/${code.toLowerCase()}/${REFERENCE_FILE[kind]}.svg`;
}

export function referenceImageAlt(kind: ProjectImageKind): string {
  return REFERENCE_ALT[kind];
}

/** Las tres SVG por código: respaldo de las semillas y de proyectos sin imágenes guardadas. */
export function referenceImagesFor(project: ProjectRef): readonly ProjectImage[] {
  return PROJECT_IMAGE_KINDS.map((kind) => ({
    projectId: project.id,
    kind,
    url: referenceImageUrl(project.code, kind),
    alt: referenceImageAlt(kind),
    isReference: true,
  }));
}

/** Las guardadas (en el orden de PROJECT_IMAGE_KINDS) si hay alguna; si no, el respaldo por código. */
export function resolveProjectImages(
  project: ProjectRef,
  stored: readonly ProjectImage[],
): readonly ProjectImage[] {
  if (stored.length === 0) return referenceImagesFor(project);
  const rank = (kind: ProjectImageKind): number => PROJECT_IMAGE_KINDS.indexOf(kind);
  return [...stored].sort((a, b) => rank(a.kind) - rank(b.kind));
}

/** Imágenes elegidas de la biblioteca local (`public/images/proyectos/`): siempre de referencia (D10). */
export function imagesFromChoices(
  projectId: ProjectId,
  choices: readonly { readonly kind: ProjectImageKind; readonly url: string }[],
): readonly ProjectImage[] {
  const rank = (kind: ProjectImageKind): number => PROJECT_IMAGE_KINDS.indexOf(kind);
  return [...choices]
    .sort((a, b) => rank(a.kind) - rank(b.kind))
    .map((c) => ({
      projectId,
      kind: c.kind,
      url: c.url.trim(),
      alt: referenceImageAlt(c.kind),
      isReference: true,
    }));
}
