"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { Project } from "@/modules/projects";
import type { ProjectEconomics } from "../../../domain/project-economics";
import type { Settlement } from "../../../domain/settlement";

export type FinanceRow = {
  readonly project: Project;
  readonly economics: ProjectEconomics | null;
  readonly settlement: Settlement | null;
};

export const ADMIN_FINANCE_KEY = ["finance", "admin", "rows"] as const;

/** Proyectos semilla con su economía y su liquidación sembrada (si existe). */
export function useAdminFinance(): UseQueryResult<readonly FinanceRow[], Error> {
  const container = useContainer();
  return useQuery<readonly FinanceRow[], Error>({
    queryKey: ADMIN_FINANCE_KEY,
    retry: false,
    queryFn: async () => {
      const [projects, economics, settlements] = await Promise.all([
        container.projects.projectRepository.list(),
        container.finance.economicsRepository.list(),
        container.finance.settlementRepository.list(),
      ]);
      return projects.map((project) => ({
        project,
        economics: economics.find((e) => e.projectId === project.id) ?? null,
        settlement: settlements.find((s) => s.projectId === project.id) ?? null,
      }));
    },
  });
}
