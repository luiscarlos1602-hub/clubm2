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
export type { PublicStage } from "./domain/public-stage";
export { PUBLIC_STAGES, toPublicStage, isPublishedStatus } from "./domain/public-stage";
export { TARGET_TERM_MONTHS } from "./domain/target-term";
export type { ProjectRepository, PropertyRepository } from "./application/ports";
