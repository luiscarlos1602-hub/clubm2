import type { DemoStore } from "@/shared/infrastructure/demo-store";
import type {
  ProjectContentRepository,
  ProjectRepository,
  PropertyRepository,
} from "@/modules/projects/application/ports";
import {
  createGetProjectProcess,
  type GetProjectProcess,
} from "@/modules/projects/application/get-project-process";
import {
  createProjectContentMockRepository,
  createProjectMockRepository,
  createPropertyMockRepository,
} from "@/modules/projects/infrastructure/projects.mock-repository";
import type { DemoSnapshot } from "../demo-snapshot";

export type ProjectsModule = {
  readonly projectRepository: ProjectRepository;
  readonly propertyRepository: PropertyRepository;
  readonly contentRepository: ProjectContentRepository;
  readonly getProjectProcess: GetProjectProcess;
};

export function registerProjects(store: DemoStore<DemoSnapshot>): ProjectsModule {
  const source = { read: () => store.read().projects };
  const projectRepository = createProjectMockRepository(source);
  const contentRepository = createProjectContentMockRepository(source);
  return {
    projectRepository,
    propertyRepository: createPropertyMockRepository(source),
    contentRepository,
    getProjectProcess: createGetProjectProcess({ projects: projectRepository, content: contentRepository }),
  };
}
