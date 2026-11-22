import { sliceOf, type DemoStore } from "@/shared/infrastructure/demo-store";
import type {
  ProjectContentRepository,
  ProjectContentWriter,
  ProjectMediaRepository,
  ProjectMediaWriter,
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
import { createProjectContentMockWriter } from "@/modules/projects/infrastructure/projects.content-writer";
import {
  createProjectMediaMockRepository,
  createProjectMediaMockWriter,
} from "@/modules/projects/infrastructure/projects.media";
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
import {
  createChangeProjectStage,
  type ChangeProjectStage,
  type PublishGuard,
} from "@/modules/projects/application/change-project-stage";
import type { Clock } from "@/shared/domain/clock";
import type { DemoSnapshot } from "../demo-snapshot";

export type ProjectsModule = {
  readonly projectRepository: ProjectRepository;
  readonly propertyRepository: PropertyRepository;
  readonly contentRepository: ProjectContentRepository;
  readonly getProjectProcess: GetProjectProcess;
  /** W-2: imágenes y escritura de contenido (los usa el escritor de ficha de composition). */
  readonly mediaRepository: ProjectMediaRepository;
  readonly contentWriter: ProjectContentWriter;
  readonly mediaWriter: ProjectMediaWriter;
  /** W-1: escrituras validadas por el dominio. */
  readonly saveProject: SaveProject;
  readonly saveProperty: SaveProperty;
  /** W-3: cambio de etapa real (B2 y B3); los requisitos de publicación llegan de finance. */
  readonly changeProjectStage: ChangeProjectStage;
};

export function registerProjects(
  store: DemoStore<DemoSnapshot>,
  deps: { readonly clock: Clock; readonly publishGuard: PublishGuard },
): ProjectsModule {
  const source = sliceOf(store, "projects");
  const projectRepository = createProjectMockRepository(source);
  const projectStore = { ...projectRepository, ...createProjectMockWriter(source) };
  const contentRepository = createProjectContentMockRepository(source);
  return {
    projectRepository,
    propertyRepository: createPropertyMockRepository(source),
    contentRepository,
    mediaRepository: createProjectMediaMockRepository(source),
    contentWriter: createProjectContentMockWriter(source),
    mediaWriter: createProjectMediaMockWriter(source),
    getProjectProcess: createGetProjectProcess({ projects: projectRepository, content: contentRepository }),
    saveProject: createSaveProject({ projects: projectStore }),
    saveProperty: createSaveProperty({ properties: createPropertyMockWriter(source) }),
    changeProjectStage: createChangeProjectStage({
      projects: projectStore,
      clock: deps.clock,
      publishGuard: deps.publishGuard,
    }),
  };
}
