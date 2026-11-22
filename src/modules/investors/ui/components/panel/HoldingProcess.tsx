import { processStagesFor } from "@/modules/finance/ui";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { formatIsoDate } from "@/shared/lib/format-date";
import { PROCESS_STAGE_LABEL, ProcessBoard } from "@/shared/ui/brand";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY.process;

/** Resumen de una línea + tablero de proceso desplegable. Las etapas salen de finance (única fuente, la misma de la ficha). */
export function HoldingProcess({ code, acquiredOn, orientation = "vertical" }: { code: string; acquiredOn: IsoDate | null; orientation?: "horizontal" | "vertical" }) {
  const stages = acquiredOn ? processStagesFor({ code, acquiredOn }) : null;
  if (!stages) return null;
  const current = stages.find((s) => s.status === "current");
  const next = stages.find((s) => s.status === "upcoming");
  const summary = current
    ? C.summaryCurrent(PROCESS_STAGE_LABEL[current.id])
    : next
      ? C.summaryStart(PROCESS_STAGE_LABEL[next.id], formatIsoDate(next.date, "short"))
      : C.summaryDone;
  const key = code.toLowerCase();
  return (
    <details className="group border-line rounded-lg border" data-testid={`proceso-${key}`}>
      <summary className="flex min-h-11 cursor-pointer flex-col justify-center gap-0.5 px-3.5 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <span className="font-medium">{C.title}</span>
        <span className="text-muted-foreground" data-testid={`proceso-${key}-resumen`}>{summary}</span>
      </summary>
      <div className="flex flex-col gap-3 px-3.5 pt-2 pb-4">
        <ProcessBoard stages={stages} orientation={orientation} data-testid={`proceso-${key}-tablero`} />
        <p className="text-xs text-muted-foreground">{C.note}</p>
      </div>
    </details>
  );
}
