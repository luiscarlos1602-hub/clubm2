import {
  checkProjectProcess,
  toProcessTimeline,
  type ProcessStageTimeline,
} from "../domain/process";
import type { ProjectContentRepository, ProjectRepository } from "./ports";

export type GetProjectProcess = (code: string) => Promise<readonly ProcessStageTimeline[] | null>;
export type GetProjectProcessDeps = {
  readonly projects: Pick<ProjectRepository, "list">;
  readonly content: Pick<ProjectContentRepository, "processOf">;
};

/**
 * Única fuente del tablero de proceso (ficha, panel, portafolio y backoffice).
 * async. null si no hay proyecto con ese código, si acquiredOn es null o si no hay proceso.
 * Si el proceso no pasa checkProjectProcess → rechaza (dato corrupto).
 */
export function createGetProjectProcess(deps: GetProjectProcessDeps): GetProjectProcess {
  return async (code) => {
    const projects = await deps.projects.list();
    const project = projects.find((p) => p.code === code);
    const acquiredOn = project?.timeline.acquiredOn ?? null;
    if (project === undefined || acquiredOn === null) return null;
    const process = await deps.content.processOf(project.id);
    if (process === null) return null;
    const checked = checkProjectProcess(process);
    if (!checked.ok) throw new Error(`proceso ${code}: ${checked.error.code}`);
    return toProcessTimeline(acquiredOn, checked.value);
  };
}
