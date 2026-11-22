export type {
  ValueBasis,
  DistributionShares,
  ParticipationTerms,
  DistributionInput,
  DistributionInputErrorCode,
  CapitalReturn,
  Distribution,
  NoDistribution,
  DistributionOutcome,
} from "./domain/distribution";
export { DEFAULT_DISTRIBUTION_SHARES, calculateDistribution } from "./domain/distribution";
export { validateDistributionInput } from "./domain/validate-distribution-input";
export type { HolderPayout } from "./domain/holder-payout";
export { calculateHolderPayout } from "./domain/holder-payout";
