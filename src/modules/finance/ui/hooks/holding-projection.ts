"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import { sumMoney, type Money } from "@/shared/domain/money";
import { toSimulatorBase } from "./project-figures";
import { neutralControls, simulate } from "./simulate";
import { loadProjectDetail, type ProjectDetailData } from "./use-project-detail";

/** Ganancia proyectada de `held` participaciones en el escenario base: la misma que muestra el simulador de la ficha.
 *  null si no hay reparto del fondo (o la tenencia no es válida). */
export function projectHolding(data: ProjectDetailData, held: number): Money | null {
  const base = toSimulatorBase(data);
  const { outcome } = simulate(base, neutralControls(base, held));
  return outcome.kind === "payout" ? outcome.payout.gain : null;
}

export type HoldingProjectionRequest = { readonly code: string; readonly quantity: number };
export type HoldingProjections = {
  /** Código → ganancia proyectada (null si no hay reparto). */
  readonly byCode: Readonly<Record<string, Money | null>>;
  /** Suma de las proyecciones disponibles; null si ninguna. */
  readonly total: Money | null;
};

/** Proyección base de cada tenencia en curso, con el mismo cálculo de la ficha. Solo en el cliente. */
export function useHoldingProjections(requests: readonly HoldingProjectionRequest[]): UseQueryResult<HoldingProjections, Error> {
  const container = useContainer();
  const key = requests.map((r) => `${r.code}:${r.quantity}`).join(",");
  return useQuery<HoldingProjections, Error>({
    queryKey: ["finance", "holding-projections", key],
    retry: false,
    queryFn: async () => {
      const listings = await container.participations.listMarketplace();
      const entries = await Promise.all(
        requests.map(async ({ code, quantity }) => {
          const listing = listings.find((l) => l.code === code);
          const data = listing ? await loadProjectDetail(container, listing.slug) : null;
          return [code, data ? projectHolding(data, quantity) : null] as const;
        }),
      );
      const values = entries.flatMap(([, m]) => (m ? [m] : []));
      return { byCode: Object.fromEntries(entries), total: values.length > 0 ? sumMoney(values) : null };
    },
  });
}
