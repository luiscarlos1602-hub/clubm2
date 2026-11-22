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
export type { ProjectStatus, CreatableStatus } from "./domain/project-status";
export { parseProjectCode } from "./domain/project";
export {
  CREATABLE_STATUSES,
  PROJECT_STATUSES,
  PROJECT_TRANSITIONS,
  canTransition,
  transitionStatus,
  isTerminalStatus,
  changeProjectStatus,
  manualNextStages,
  SETTLEMENT_STAGES,
} from "./domain/project-status";
export { checkProjectConsistency, checkProperty } from "./domain/project-consistency";
export type { PublicStage } from "./domain/public-stage";
export { PUBLIC_STAGES, toPublicStage, isPublishedStatus } from "./domain/public-stage";
export { TARGET_TERM_MONTHS } from "./domain/target-term";
export type {
  ProjectRepository,
  PropertyRepository,
  ProjectWriter,
  PropertyWriter,
} from "./application/ports";
export type {
  SaveProject,
  SaveProjectErrorCode,
  SaveProperty,
  SavePropertyErrorCode,
} from "./application/save-project";
// P4 · ficha: slug, perfil, proceso, actualizaciones y riesgos (plan 006 §3.2). Sin niveles ni ruedas.
export { PROJECT_SLUG_PATTERN, isProjectSlug } from "./domain/project-slug";
export type { PropertyProfile } from "./domain/property-profile";
export type {
  ProcessStageKind,
  ProcessStepStatus,
  ProcessStep,
  ProjectProcess,
  ProcessStageTimeline,
  ProcessErrorCode,
} from "./domain/process";
export {
  PROCESS_STAGE_KINDS,
  PROCESS_STEP_STATUSES,
  checkProjectProcess,
  toProcessTimeline,
} from "./domain/process";
export type { ProjectUpdateId, ProjectUpdate } from "./domain/project-update";
export { sortUpdatesNewestFirst } from "./domain/project-update";
export type { ProjectRiskKind, ProjectRisks } from "./domain/project-risk";
export { PROJECT_RISK_KINDS, normalizeRiskKinds } from "./domain/project-risk";
export type {
  ProjectContentRepository,
  ProjectContentWriter,
  ProjectMediaRepository,
  ProjectMediaWriter,
  ReferenceImageOption,
} from "./application/ports";
export type { GetProjectProcess } from "./application/get-project-process";
// W-2 · alta de inmueble (plan 011 §3): código, slug e imágenes.
export { nextProjectCode, buildProjectSlug } from "./domain/project-code";
export type { ProjectImageKind, ProjectImage } from "./domain/project-image";
export {
  PROJECT_IMAGE_KINDS,
  referenceImageUrl,
  referenceImageAlt,
  imagesFromChoices,
  referenceImagesFor,
  resolveProjectImages,
} from "./domain/project-image";
// W-3 · cambio de etapa real (B2 y B3).
export type {
  ChangeProjectStage,
  ChangeProjectStageErrorCode,
  PublishGuard,
} from "./application/change-project-stage";
