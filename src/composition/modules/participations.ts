import { sliceOf, type DemoStore } from "@/shared/infrastructure/demo-store";
import type {
  ParticipationClassRepository,
  ParticipationRepository,
} from "@/modules/participations/application/ports";
import {
  createListMarketplace,
  type ListMarketplace,
} from "@/modules/participations/application/list-marketplace";
import {
  createParticipationClassMockRepository,
  createParticipationMockRepository,
} from "@/modules/participations/infrastructure/participations.mock-repository";
import { createParticipationClassMockWriter } from "@/modules/participations/infrastructure/participations.mock-writer";
import {
  createSaveParticipationClass,
  type SaveParticipationClass,
} from "@/modules/participations/application/save-participation-class";
import type { DemoSnapshot } from "../demo-snapshot";
import type { ProjectsModule } from "./projects";

export type ParticipationsModule = {
  readonly classRepository: ParticipationClassRepository;
  readonly participationRepository: ParticipationRepository;
  readonly listMarketplace: ListMarketplace;
  /** W-1. */
  readonly saveParticipationClass: SaveParticipationClass;
};

export function registerParticipations(
  store: DemoStore<DemoSnapshot>,
  projects: Pick<ProjectsModule, "projectRepository" | "propertyRepository">,
): ParticipationsModule {
  const source = sliceOf(store, "participations");
  const classRepository = createParticipationClassMockRepository(source);
  return {
    classRepository,
    participationRepository: createParticipationMockRepository(source),
    listMarketplace: createListMarketplace({
      projects: projects.projectRepository,
      properties: projects.propertyRepository,
      classes: classRepository,
    }),
    saveParticipationClass: createSaveParticipationClass({
      projects: projects.projectRepository,
      classes: createParticipationClassMockWriter(source),
    }),
  };
}
