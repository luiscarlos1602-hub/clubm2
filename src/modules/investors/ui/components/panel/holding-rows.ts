import type { ProjectListing } from "@/modules/participations";
import { profitRateLabel } from "@/modules/finance/ui";
import type { Money } from "@/shared/domain/money";
import { EXAMPLE_HOLDINGS, type ExampleHolding } from "./examples";

export type HoldingRow = {
  readonly holding: ExampleHolding;
  /** null si el marketplace no trae ese código (se muestra solo el código). */
  readonly listing: ProjectListing | null;
  /** Proyección base calculada por finance; null si no aplica o aún no llega. */
  readonly projection: Money | null;
  /** "34,5 %" sobre el capital de la tenencia (motor: calculateProfitRate); null si no hay ganancia. */
  readonly realizedRate: string | null;
  readonly projectionRate: string | null;
};

/** Une cada tenencia de ejemplo con su proyecto del marketplace y su proyección por código. Solo une, no calcula. */
export function joinHoldings(
  listings: readonly ProjectListing[],
  projections: Readonly<Record<string, Money | null>> = {},
): readonly HoldingRow[] {
  return EXAMPLE_HOLDINGS.map((holding) => {
    const projection = projections[holding.code] ?? null;
    return {
      holding,
      listing: listings.find((l) => l.code === holding.code) ?? null,
      projection,
      realizedRate: profitRateLabel(holding.realized, holding.capital),
      projectionRate: profitRateLabel(projection, holding.capital),
    };
  });
}
