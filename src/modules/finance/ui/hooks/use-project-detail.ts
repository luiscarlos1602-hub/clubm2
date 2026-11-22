"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Container } from "@/composition/container";
import { useContainer } from "@/composition/providers";
import type { ParticipationClass, ProjectListing } from "@/modules/participations";
import type { Property } from "@/modules/projects";
import type { ProjectEconomics } from "../../domain/project-economics";
import type { Settlement } from "../../domain/settlement";
import {
  PROJECT_EXAMPLES,
  isPublishedProjectSlug,
  type ProjectExample,
} from "../components/investor/examples";

export type ProjectDetailData = {
  readonly listing: ProjectListing;
  readonly property: Property;
  readonly participationClass: ParticipationClass;
  readonly economics: ProjectEconomics;
  /** Solo en proyectos finalizados. */
  readonly settlement: Settlement | null;
  readonly example: ProjectExample;
};

export const projectDetailQueryKey = (slug: string) => ["finance", "project-detail", slug] as const;

/** Arma la ficha desde el container. null = slug sin ficha (no publicable o inexistente). */
export async function loadProjectDetail(container: Container, slug: string): Promise<ProjectDetailData | null> {
  if (!isPublishedProjectSlug(slug)) return null;
  const listings = await container.participations.listMarketplace();
  const listing = listings.find((l) => l.slug === slug);
  if (listing === undefined) return null;
  const [project, participationClass, economics, settlement] = await Promise.all([
    container.projects.projectRepository.findById(listing.projectId),
    container.participations.classRepository.findByProject(listing.projectId),
    container.finance.economicsRepository.findByProject(listing.projectId),
    container.finance.settlementRepository.findByProject(listing.projectId),
  ]);
  if (project === null || participationClass === null || economics === null) return null;
  const property = await container.projects.propertyRepository.findById(project.propertyId);
  if (property === null) return null;
  return { listing, property, participationClass, economics, settlement, example: PROJECT_EXAMPLES[slug] };
}

/** Lee la ficha del container solo en el cliente (el demo-store vive en localStorage). */
export function useProjectDetail(slug: string): UseQueryResult<ProjectDetailData | null, Error> {
  const container = useContainer();
  return useQuery<ProjectDetailData | null, Error>({
    queryKey: projectDetailQueryKey(slug),
    retry: false,
    queryFn: () => loadProjectDetail(container, slug),
  });
}
