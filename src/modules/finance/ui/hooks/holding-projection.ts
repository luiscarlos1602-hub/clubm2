"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { Money } from "@/shared/domain/money";
import type { HoldingProjectionRequest, HoldingProjections } from "../../application/get-holding-projections";
import { projectHoldingGain } from "../../domain/holding-projection";
import type { ProjectDetail } from "../../domain/project-detail";

/** Ganancia proyectada de `held` participaciones en el escenario base: la misma que muestra el simulador de la ficha. */
export function projectHolding(detail: ProjectDetail, held: number): Money | null {
  return projectHoldingGain(detail.simulation.base, held);
}

/** Proyección base de cada tenencia en curso (caso de uso del container). Solo en el cliente. */
export function useHoldingProjections(requests: readonly HoldingProjectionRequest[]): UseQueryResult<HoldingProjections, Error> {
  const container = useContainer();
  const key = requests.map((r) => `${r.code}:${r.quantity}`).join(",");
  return useQuery<HoldingProjections, Error>({
    queryKey: ["finance", "holding-projections", key],
    retry: false,
    queryFn: () => container.finance.getHoldingProjections(requests),
  });
}
