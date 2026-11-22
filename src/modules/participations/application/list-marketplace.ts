import type { ProjectMediaRepository, ProjectRepository, PropertyRepository } from "@/modules/projects";
import { buildMarketplaceListing, type ProjectListing } from "../domain/marketplace-listing";
import type { ParticipationClassRepository } from "./ports";

export type ListMarketplaceDeps = {
  readonly projects: Pick<ProjectRepository, "list">;
  readonly properties: Pick<PropertyRepository, "list">;
  readonly classes: Pick<ParticipationClassRepository, "list">;
  readonly media: Pick<ProjectMediaRepository, "imagesOf">;
};
export type ListMarketplace = () => Promise<readonly ProjectListing[]>;

/**
 * `async`: un throw síncrono de un repositorio se convierte en rechazo (lo muestra ErrorState).
 * Lee los repositorios con Promise.all (más las imágenes guardadas de cada proyecto) y delega en buildMarketplaceListing.
 */
export function createListMarketplace(deps: ListMarketplaceDeps): ListMarketplace {
  return async () => {
    const [projects, properties, classes] = await Promise.all([
      deps.projects.list(),
      deps.properties.list(),
      deps.classes.list(),
    ]);
    const images = (await Promise.all(projects.map((p) => deps.media.imagesOf(p.id)))).flat();
    return buildMarketplaceListing({ projects, properties, classes, images });
  };
}
