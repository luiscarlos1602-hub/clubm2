"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { MARKETPLACE_QUERY_KEY, type ProjectListing } from "@/modules/participations";
import { useContainer } from "@/composition/providers";

/** Misma consulta que el marketplace (comparte caché): nombres, zonas y slugs de los proyectos. */
export function usePanelListings(): UseQueryResult<readonly ProjectListing[], Error> {
  const container = useContainer();
  return useQuery<readonly ProjectListing[], Error>({
    queryKey: MARKETPLACE_QUERY_KEY,
    queryFn: () => container.participations.listMarketplace(),
    retry: false,
  });
}
