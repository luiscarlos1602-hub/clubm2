"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { ProjectListing } from "../../domain/marketplace-listing";

export const MARKETPLACE_QUERY_KEY = ["participations", "marketplace"] as const;

/** Lee la lista del container solo en el cliente (el demo-store vive en localStorage).
 *  Sin reintentos automáticos: la lectura es local y el usuario tiene "Reintentar". */
export function useMarketplace(): UseQueryResult<readonly ProjectListing[], Error> {
  const container = useContainer();
  return useQuery<readonly ProjectListing[], Error>({
    queryKey: MARKETPLACE_QUERY_KEY,
    queryFn: () => container.participations.listMarketplace(),
    retry: false,
  });
}
