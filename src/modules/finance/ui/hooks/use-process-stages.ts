"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { ProcessStageView } from "@/shared/ui/brand";
import { toProcessStageViews } from "./process-stage-view";

/** Única fuente del tablero de proceso de un proyecto (ficha, panel, portafolio y backoffice). null = sin proceso publicado. */
export function useProcessStages(code: string): UseQueryResult<readonly ProcessStageView[] | null, Error> {
  const container = useContainer();
  return useQuery<readonly ProcessStageView[] | null, Error>({
    queryKey: ["projects", "process-stages", code],
    retry: false,
    queryFn: async () => {
      const timeline = await container.projects.getProjectProcess(code);
      return timeline === null ? null : toProcessStageViews(timeline);
    },
  });
}
