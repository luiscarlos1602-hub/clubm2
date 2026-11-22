import { sliceOf, type DemoStore } from "@/shared/infrastructure/demo-store";
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
import {
  createProjectMockWriter,
  createPropertyMockWriter,
} from "@/modules/projects/infrastructure/projects.mock-writer";
import {
  createSaveProject,
  createSaveProperty,
  type SaveProject,
  type SaveProperty,
} from "@/modules/projects/application/save-project";
import type { DemoSnapshot } from "../demo-snapshot";

export type ProjectsModule = {
  readonly projectRepository: ProjectRepository;
  readonly propertyRepository: PropertyRepository;
  readonly contentRepository: ProjectContentRepository;
  readonly getProjectProcess: GetProjectProcess;
  /** W-1: escrituras validadas por el dominio. */
  readonly saveProject: SaveProject;
  readonly saveProperty: SaveProperty;
};

export function registerProjects(store: DemoStore<DemoSnapshot>): ProjectsModule {
  const source = sliceOf(store, "projects");
  const projectRepository = createProjectMockRepository(source);
  const contentRepository = createProjectContentMockRepository(source);
  return {
    projectRepository,
    propertyRepository: createPropertyMockRepository(source),
    contentRepository,
    getProjectProcess: createGetProjectProcess({ projects: projectRepository, content: contentRepository }),
    saveProject: createSaveProject({ projects: createProjectMockWriter(source) }),
    saveProperty: createSaveProperty({ properties: createPropertyMockWriter(source) }),
  };
}
