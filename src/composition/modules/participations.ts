import type { DemoStore } from "@/shared/infrastructure/demo-store";
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
import type { DemoSnapshot } from "../demo-snapshot";
import type { ProjectsModule } from "./projects";

export type ParticipationsModule = {
  readonly classRepository: ParticipationClassRepository;
  readonly participationRepository: ParticipationRepository;
  readonly listMarketplace: ListMarketplace;
};

export function registerParticipations(
  store: DemoStore<DemoSnapshot>,
  projects: Pick<ProjectsModule, "projectRepository" | "propertyRepository">,
): ParticipationsModule {
  const source = { read: () => store.read().participations };
  const classRepository = createParticipationClassMockRepository(source);
  return {
    classRepository,
    participationRepository: createParticipationMockRepository(source),
    listMarketplace: createListMarketplace({
      projects: projects.projectRepository,
      properties: projects.propertyRepository,
      classes: classRepository,
    }),
  };
}
