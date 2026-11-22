import type { ParticipationClassRepository } from "@/modules/participations"; // SOLO import type (D2)
import {
  resolveProjectImages,
  type ProjectContentRepository,
  type ProjectMediaRepository,
  type ProjectRepository,
  type PropertyRepository,
} from "@/modules/projects";
import type { ProjectSheet } from "../domain/project-sheet";
import type { ProjectBudgetRepository, ProjectEconomicsRepository } from "./ports";

export type GetProjectSheet = (slug: string) => Promise<ProjectSheet | null>;

export type GetProjectSheetDeps = {
  readonly projects: Pick<ProjectRepository, "findBySlug">;
  readonly properties: Pick<PropertyRepository, "findById">;
  readonly content: ProjectContentRepository;
  readonly classes: Pick<ParticipationClassRepository, "findByProject">;
  readonly economics: Pick<ProjectEconomicsRepository, "findByProject">;
  readonly budgets: ProjectBudgetRepository;
  readonly media: Pick<ProjectMediaRepository, "imagesOf">;
};

function required<T>(value: T | null, slug: string, what: string): T {
  if (value === null) throw new Error(`ficha ${slug}: falta ${what}`);
  return value;
}

/**
 * Carga la ficha editable de un proyecto por slug (cualquier etapa, también internas).
 * Sin slug conocido: null. Imágenes: las guardadas o, si no hay, las SVG de referencia por código (semillas).
 * Perfil, proceso, riesgos y clase pueden faltar (null); inmueble, economía y presupuesto son obligatorios.
 */
export function createGetProjectSheet(deps: GetProjectSheetDeps): GetProjectSheet {
  return async (slug) => {
    const project = await deps.projects.findBySlug(slug);
    if (project === null) return null;
    const id = project.id;
    const [property, profile, process, risks, participationClass, economics, budget, stored] =
      await Promise.all([
        deps.properties.findById(project.propertyId),
        deps.content.profileOf(project.propertyId),
        deps.content.processOf(id),
        deps.content.risksOf(id),
        deps.classes.findByProject(id),
        deps.economics.findByProject(id),
        deps.budgets.findByProject(id),
        deps.media.imagesOf(id),
      ]);
    return {
      property: required(property, slug, "el inmueble"),
      project,
      profile,
      process,
      risks,
      participationClass,
      economics: required(economics, slug, "la economía"),
      budget: required(budget, slug, "el presupuesto"),
      images: resolveProjectImages(project, stored),
    };
  };
}
