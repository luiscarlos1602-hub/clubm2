"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { DomainError, Result } from "@/shared/domain/result";
import type { ChangeProjectStageErrorCode } from "../../application/change-project-stage";
import type { Project, ProjectId } from "../../domain/project";
import type { ProjectStatus } from "../../domain/project-status";

export type ChangeStageResult = Result<Project, DomainError<ChangeProjectStageErrorCode>>;

/**
 * W-3 · cambia la etapa con el caso de uso y, si se guardó, invalida TanStack Query (como `use-reset-demo-data.ts`):
 * tablero, obra, listados y marketplace se releen. `pending` = etapa destino mientras se guarda.
 */
export function useChangeProjectStage() {
  const container = useContainer();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<ProjectStatus | null>(null);

  const change = useCallback(
    async (projectId: ProjectId, to: ProjectStatus): Promise<ChangeStageResult> => {
      setPending(to);
      try {
        const result = await container.projects.changeProjectStage(projectId, to);
        if (result.ok) await queryClient.invalidateQueries();
        return result;
      } finally {
        setPending(null);
      }
    },
    [container, queryClient],
  );

  return { change, pending };
}
