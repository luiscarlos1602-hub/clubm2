import type { ListMarketplace } from "@/modules/participations"; // SOLO import type (D2)
import { sumMoney, type Money } from "@/shared/domain/money";
import { projectHoldingGain } from "../domain/holding-projection";
import type { GetProjectDetail } from "./get-project-detail";

export type HoldingProjectionRequest = { readonly code: string; readonly quantity: number };
export type HoldingProjections = {
  /** Código → ganancia proyectada; null = sin reparto o sin ficha. */
  readonly byCode: Readonly<Record<string, Money | null>>;
  /** sumMoney de los no-null; null si no hay ninguno. */
  readonly total: Money | null;
};
export type GetHoldingProjections = (
  requests: readonly HoldingProjectionRequest[],
) => Promise<HoldingProjections>;

/** Proyección base de cada tenencia en curso, con la misma cuenta de la ficha (projectHoldingGain). */
export function createGetHoldingProjections(deps: {
  readonly listMarketplace: ListMarketplace;
  readonly getProjectDetail: GetProjectDetail;
}): GetHoldingProjections {
  return async (requests) => {
    const listings = await deps.listMarketplace();
    const entries = await Promise.all(
      requests.map(async ({ code, quantity }) => {
        const listing = listings.find((l) => l.code === code);
        const detail = listing === undefined ? null : await deps.getProjectDetail(listing.slug);
        return [
          code,
          detail === null ? null : projectHoldingGain(detail.simulation.base, quantity),
        ] as const;
      }),
    );
    const values = entries.flatMap(([, m]) => (m === null ? [] : [m]));
    return {
      byCode: Object.fromEntries(entries),
      total: values.length > 0 ? sumMoney(values) : null,
    };
  };
}
