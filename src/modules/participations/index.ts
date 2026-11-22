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
export type { ListingPhase, ProjectListing, MarketplaceSource } from "./domain/marketplace-listing";
export { LISTING_PHASES, buildMarketplaceListing } from "./domain/marketplace-listing";
export type { MarketplaceFilter, LocationFilter, LocationOption, MarketplaceCriteria } from "./domain/marketplace-filters";
export {
  MARKETPLACE_FILTERS,
  DEFAULT_CRITERIA,
  matchesStageFilter,
  filterListings,
  listLocationOptions,
  locationKey,
  resolveLocation,
} from "./domain/marketplace-filters";
export type { ListMarketplace, ListMarketplaceDeps } from "./application/list-marketplace";
export { ProjectMarketplace, type ProjectMarketplaceProps } from "./ui/components/investor/ProjectMarketplace";
