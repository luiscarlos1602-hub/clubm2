// API pública de projects. Sin ruedas: viven en ./backoffice.ts (ADR-004).
export type {
  ProjectId,
  PropertyId,
  ProjectCode,
  Property,
  PropertyKind,
  ProjectTimeline,
  Project,
} from "./domain/project";
export type { ProjectStatus } from "./domain/project-status";
export { parseProjectCode } from "./domain/project";
export {
  PROJECT_STATUSES,
  PROJECT_TRANSITIONS,
  canTransition,
  transitionStatus,
  isTerminalStatus,
  changeProjectStatus,
} from "./domain/project-status";
export { checkProjectConsistency } from "./domain/project-consistency";
