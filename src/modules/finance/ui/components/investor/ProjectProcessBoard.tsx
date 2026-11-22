"use client";

import type { IsoDate } from "@/shared/domain/calendar-date";
import { ProcessBoard } from "@/shared/ui/brand";
import { processStagesFor } from "../../hooks/process-stages";
import { PROJECT_DETAIL_COPY } from "./copy";

export type ProjectProcessBoardProps = {
  readonly code: string;
  readonly acquiredOn: IsoDate;
  readonly orientation?: "horizontal" | "vertical";
  readonly "data-testid"?: string;
};

/** Tablero de proceso de un proyecto por código: la misma fuente para la ficha, el panel y el backoffice. */
export function ProjectProcessBoard({ code, acquiredOn, orientation, "data-testid": testId }: ProjectProcessBoardProps) {
  const stages = processStagesFor({ code, acquiredOn });
  if (!stages) return <p className="text-sm text-muted-foreground">{PROJECT_DETAIL_COPY.timeline.noProcess}</p>;
  return <ProcessBoard stages={stages} orientation={orientation} data-testid={testId} />;
}
