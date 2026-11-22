import type { ProcessStageKind, ProcessStageTimeline } from "@/modules/projects";
import type { ProcessStageId, ProcessStageView } from "@/shared/ui/brand";

/** Etapa del dominio (ids en inglés) → id visual del tablero. Tabla de presentación, sin lógica de negocio. */
export const PROCESS_STAGE_ID: Readonly<Record<ProcessStageKind, ProcessStageId>> = {
  works_start: "inicio-obra",
  works_50: "obra-50",
  works_80: "obra-80",
  sale_start: "inicio-venta",
  on_sale: "en-venta",
  sold: "vendida",
};

export function toProcessStageViews(timeline: readonly ProcessStageTimeline[]): readonly ProcessStageView[] {
  return timeline.map((t) => ({ id: PROCESS_STAGE_ID[t.stage], status: t.status, date: t.date, estimated: t.estimated }));
}
