"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { Project } from "@/modules/projects";
import type { ProjectEconomics } from "../../../domain/project-economics";
import type { ParticipationTerms } from "../../../domain/distribution";
import type { ProjectSale } from "../../../domain/project-sale";
import type { Settlement } from "../../../domain/settlement";

export type FinanceRow = {
  readonly project: Project;
  readonly economics: ProjectEconomics | null;
  readonly settlement: Settlement | null;
  /** W-5: venta real registrada (proyectos sold/settled). */
  readonly sale: ProjectSale | null;
  /** Total, colocadas y precio de su clase de participación (única fuente de `placed`). */
  readonly terms: ParticipationTerms | null;
};

export const ADMIN_FINANCE_KEY = ["finance", "admin", "rows"] as const;

/** Proyectos con su economía, venta, liquidación y clase de participación (si existen). */
export function useAdminFinance(): UseQueryResult<readonly FinanceRow[], Error> {
  const container = useContainer();
  return useQuery<readonly FinanceRow[], Error>({
    queryKey: ADMIN_FINANCE_KEY,
    retry: false,
    queryFn: async () => {
      const [projects, economics, settlements, sales, classes] = await Promise.all([
        container.projects.projectRepository.list(),
        container.finance.economicsRepository.list(),
        container.finance.settlementRepository.list(),
        container.finance.saleRepository.list(),
        container.participations.classRepository.list(),
      ]);
      return projects.map((project) => {
        const cls = classes.find((c) => c.projectId === project.id);
        return {
        project,
        economics: economics.find((e) => e.projectId === project.id) ?? null,
        settlement: settlements.find((s) => s.projectId === project.id) ?? null,
        sale: sales.find((s) => s.projectId === project.id) ?? null,
        terms: cls ? { total: cls.total, placed: cls.placed, unitPrice: cls.unitPrice } : null,
        };
      });
    },
  });
}
