"use client";

import type { IsoDate } from "@/shared/domain/calendar-date";
import { ProcessBoard } from "@/shared/ui/brand";
import { useProcessStages } from "../../hooks/use-process-stages";
import { PROJECT_DETAIL_COPY } from "./copy";

export type ProjectProcessBoardProps = {
  readonly code: string;
  readonly acquiredOn: IsoDate;
  readonly orientation?: "horizontal" | "vertical";
  readonly "data-testid"?: string;
};

/** Tablero de proceso de un proyecto por código: la misma fuente para la ficha, el panel y el backoffice.
 *  `acquiredOn` se conserva en las props (la inyecta projects/ui/admin) pero ya no se lee: la fecha sale del proyecto (D3). */
export function ProjectProcessBoard({ code, orientation, "data-testid": testId }: ProjectProcessBoardProps) {
  const query = useProcessStages(code);
  const stages = query.data;
  if (query.isPending) return null;
  if (!stages) return <p className="text-sm text-muted-foreground">{PROJECT_DETAIL_COPY.timeline.noProcess}</p>;
  return <ProcessBoard stages={stages} orientation={orientation} data-testid={testId} />;
}
