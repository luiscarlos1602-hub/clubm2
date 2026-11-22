import type { DemoStore } from "@/shared/infrastructure/demo-store";
import type { ProjectRepository, PropertyRepository } from "@/modules/projects/application/ports";
import {
  createProjectMockRepository,
  createPropertyMockRepository,
} from "@/modules/projects/infrastructure/projects.mock-repository";
import type { DemoSnapshot } from "../demo-snapshot";

export type ProjectsModule = {
  readonly projectRepository: ProjectRepository;
  readonly propertyRepository: PropertyRepository;
};

export function registerProjects(store: DemoStore<DemoSnapshot>): ProjectsModule {
  const source = { read: () => store.read().projects };
  return {
    projectRepository: createProjectMockRepository(source),
    propertyRepository: createPropertyMockRepository(source),
  };
}
