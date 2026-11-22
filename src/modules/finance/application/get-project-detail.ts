import type { ListMarketplace, ParticipationClassRepository } from "@/modules/participations"; // SOLO import type (D2)
import type {
  ProjectContentRepository,
  ProjectRepository,
  PropertyRepository,
} from "@/modules/projects";
import { buildProjectDetail, type ProjectDetail } from "../domain/project-detail";
import type {
  ProjectBudgetRepository,
  ProjectEconomicsRepository,
  SettlementRepository,
} from "./ports";

export type GetProjectDetail = (slug: string) => Promise<ProjectDetail | null>;
export type GetProjectDetailDeps = {
  readonly listMarketplace: ListMarketplace;
  readonly projects: Pick<ProjectRepository, "findById">;
  readonly properties: Pick<PropertyRepository, "findById">;
  readonly content: ProjectContentRepository;
  readonly classes: Pick<ParticipationClassRepository, "findByProject">;
  readonly economics: Pick<ProjectEconomicsRepository, "findByProject">;
  readonly budgets: ProjectBudgetRepository;
  readonly settlements: Pick<SettlementRepository, "findByProject">;
  /** HOLDING_LIMITS.max inyectado desde composition (D2). */
  readonly holdingMax: number;
};

function required<T>(value: T | null, slug: string, what: string): T {
  if (value === null) throw new Error(`ficha ${slug}: falta ${what}`);
  return value;
}

/**
 * async (un throw síncrono de un repo se convierte en rechazo).
 * 1) listMarketplace() y búsqueda por slug → si no está: null (no consulta nada más).
 * 2) Promise.all(project, class, economics, budget, settlement, process, updates, risks); después, property y profile.
 * 3) Si falta un obligatorio o buildProjectDetail da err → rechaza con Error(`ficha ${slug}: ${code}`).
 */
export function createGetProjectDetail(deps: GetProjectDetailDeps): GetProjectDetail {
  return async (slug) => {
    const listings = await deps.listMarketplace();
    const listing = listings.find((l) => l.slug === slug);
    if (listing === undefined) return null;

    const id = listing.projectId;
    const [project, participationClass, economics, budget, settlement, process, updates, risks] =
      await Promise.all([
        deps.projects.findById(id),
        deps.classes.findByProject(id),
        deps.economics.findByProject(id),
        deps.budgets.findByProject(id),
        deps.settlements.findByProject(id),
        deps.content.processOf(id),
        deps.content.updatesOf(id),
        deps.content.risksOf(id),
      ]);
    const foundProject = required(project, slug, "el proyecto");
    const [property, profile] = await Promise.all([
      deps.properties.findById(foundProject.propertyId),
      deps.content.profileOf(foundProject.propertyId),
    ]);

    const built = buildProjectDetail({
      listing,
      project: foundProject,
      property: required(property, slug, "el inmueble"),
      profile: required(profile, slug, "el perfil del inmueble"),
      participationClass: required(participationClass, slug, "la clase de participaciones"),
      economics: required(economics, slug, "la economía"),
      budget: required(budget, slug, "el presupuesto"),
      settlement,
      process,
      updates,
      risks,
      holdingMax: deps.holdingMax,
    });
    if (!built.ok) throw new Error(`ficha ${slug}: ${built.error.code}`);
    return built.value;
  };
}
