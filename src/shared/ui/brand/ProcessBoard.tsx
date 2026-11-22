import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatIsoDate } from "@/shared/lib/format-date";
import { ProjectionLabel } from "./ProjectionLabel";
import { PROJECT_MEDIA_COPY } from "./project-media-copy";
import type { TestIdProp } from "./types";

const P = PROJECT_MEDIA_COPY.process;

export const PROCESS_STAGES = ["inicio-obra", "obra-50", "obra-80", "inicio-venta", "en-venta", "vendida"] as const;
export type ProcessStageId = (typeof PROCESS_STAGES)[number];
export const PROCESS_STAGE_LABEL: Record<ProcessStageId, string> = P.stages;

export type ProcessStageView = {
  id: ProcessStageId;
  status: "done" | "current" | "upcoming";
  /** ISO YYYY-MM-DD */
  date: string;
  /** true = proyección */
  estimated: boolean;
  note?: string;
};

export type ProcessBoardProps = TestIdProp & {
  stages: readonly ProcessStageView[];
  orientation?: "horizontal" | "vertical";
};

/** Tablero de etapas del proceso. Vertical en móvil; horizontal desde `md` salvo que se fije. */
export function ProcessBoard({
  stages,
  orientation = "horizontal",
  className,
  "data-testid": testId = "process-board",
}: ProcessBoardProps) {
  const horizontal = orientation === "horizontal";
  return (
    <ol
      aria-label={P.label}
      data-testid={testId}
      data-orientation={orientation}
      className={cn("flex flex-col gap-4", horizontal && "md:grid md:gap-3", className)}
      style={horizontal ? { gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` } : undefined}
    >
      {stages.map((s) => (
        <li
          key={s.id}
          data-testid={`${testId}-etapa-${s.id}`}
          data-status={s.status}
          aria-current={s.status === "current" ? "step" : undefined}
          className={cn(
            "flex gap-3",
            horizontal && "md:flex-col md:gap-2",
            s.status === "upcoming" && "text-muted-foreground",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs",
              s.status === "done" && "bg-primary text-primary-foreground border-primary",
              s.status === "current" && "border-primary bg-highlight text-highlight-foreground",
              s.status === "upcoming" && "border-line border-dashed",
            )}
          >
            {s.status === "done" ? <Check className="size-4" /> : null}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{PROCESS_STAGE_LABEL[s.id]}</p>
            <p className="sr-only">{P.status[s.status]}</p>
            <p className="text-xs">
              {s.estimated ? (
                <ProjectionLabel placement="below">
                  <span data-testid={`${testId}-fecha-${s.id}`}>
                    {P.estimatedDate}: <time dateTime={s.date}>{formatIsoDate(s.date, "short")}</time>
                  </span>
                </ProjectionLabel>
              ) : (
                <span data-testid={`${testId}-fecha-${s.id}`}>
                  {P.realDate}: <time dateTime={s.date}>{formatIsoDate(s.date, "short")}</time>
                </span>
              )}
            </p>
            {s.note ? <p className="text-xs text-muted-foreground">{s.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
