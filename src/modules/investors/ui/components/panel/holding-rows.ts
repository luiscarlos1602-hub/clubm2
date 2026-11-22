import type { ProjectListing } from "@/modules/participations";
import type { Money } from "@/shared/domain/money";
import { EXAMPLE_HOLDINGS, type ExampleHolding } from "./examples";

export type HoldingRow = {
  readonly holding: ExampleHolding;
  /** null si el marketplace no trae ese código (se muestra solo el código). */
  readonly listing: ProjectListing | null;
  /** Proyección base calculada por finance; null si no aplica o aún no llega. */
  readonly projection: Money | null;
};

/** Une cada tenencia de ejemplo con su proyecto del marketplace y su proyección por código. Solo une, no calcula. */
export function joinHoldings(
  listings: readonly ProjectListing[],
  projections: Readonly<Record<string, Money | null>> = {},
): readonly HoldingRow[] {
  return EXAMPLE_HOLDINGS.map((holding) => ({
    holding,
    listing: listings.find((l) => l.code === holding.code) ?? null,
    projection: projections[holding.code] ?? null,
  }));
}
