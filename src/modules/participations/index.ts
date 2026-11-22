// API pública de participations (plan 003 §3.2).
export type {
  HolderId,
  ParticipationClassId,
  ParticipationId,
  ParticipationClass,
  ParticipationStatus,
  Participation,
} from "./domain/participation";
export { PARTICIPATION_STATUSES, HOLDING_LIMITS } from "./domain/participation";
export { checkParticipationClass, checkHoldings } from "./domain/participation-consistency";
