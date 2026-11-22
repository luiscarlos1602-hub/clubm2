"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Container } from "@/composition/container";
import { useContainer } from "@/composition/providers";
import type { ProjectDetail } from "../../domain/project-detail";

export const projectDetailQueryKey = (slug: string) => ["finance", "project-detail", slug] as const;

/** Compatibilidad (tests de paridad): delega en el caso de uso del container. null = sin ficha. */
export function loadProjectDetail(container: Container, slug: string): Promise<ProjectDetail | null> {
  return container.finance.getProjectDetail(slug);
}

/** Lee la ficha del container solo en el cliente (el demo-store vive en localStorage). */
export function useProjectDetail(slug: string): UseQueryResult<ProjectDetail | null, Error> {
  const container = useContainer();
  return useQuery<ProjectDetail | null, Error>({
    queryKey: projectDetailQueryKey(slug),
    retry: false,
    queryFn: () => loadProjectDetail(container, slug),
  });
}
