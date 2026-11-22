"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import { classifyProjectWheel, type WheelClassification } from "../../../domain/classify-wheel";
import type { Project, Property } from "../../../domain/project";

export type ProjectRow = {
  readonly project: Project;
  readonly property: Property | null;
  /** null = aún sin compra (no hay rueda que medir). */
  readonly wheel: WheelClassification | null;
};

export const ADMIN_PROJECTS_KEY = ["projects", "admin", "rows"] as const;

/** Proyectos semilla con su rueda interna. Solo se usa en el backoffice (ADR-004). */
export function useAdminProjects(): UseQueryResult<readonly ProjectRow[], Error> {
  const container = useContainer();
  return useQuery<readonly ProjectRow[], Error>({
    queryKey: ADMIN_PROJECTS_KEY,
    retry: false,
    queryFn: async () => {
      const [projects, properties] = await Promise.all([
        container.projects.projectRepository.list(),
        container.projects.propertyRepository.list(),
      ]);
      const today = container.clock.today();
      return projects.map((project) => {
        const result = classifyProjectWheel(project, today);
        return {
          project,
          property: properties.find((p) => p.id === project.propertyId) ?? null,
          wheel: result.ok ? result.value : null,
        };
      });
    },
  });
}
