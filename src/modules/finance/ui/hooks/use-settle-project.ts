"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { ProjectId } from "@/modules/projects";
import type { DomainError, Result } from "@/shared/domain/result";
import type { SettleProjectErrorCode } from "../../application/settle-project";
import type { Settlement } from "../../domain/settlement";

export type SettleResult = Result<Settlement, DomainError<SettleProjectErrorCode>>;

/** W-5 · liquida un proyecto vendido (atómico: liquidación + proyecto en `settled`) e invalida TanStack Query al guardar. */
export function useSettleProject() {
  const container = useContainer();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const settle = useCallback(
    async (projectId: ProjectId): Promise<SettleResult> => {
      setIsPending(true);
      try {
        const result = await container.finance.settleProject(projectId);
        if (result.ok) await queryClient.invalidateQueries();
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [container, queryClient],
  );

  return { settle, isPending };
}
