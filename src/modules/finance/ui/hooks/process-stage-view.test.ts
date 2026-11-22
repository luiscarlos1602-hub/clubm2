import { describe, expect, it } from "vitest";
import { PROCESS_STAGE_KINDS, type ProcessStageTimeline } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { PROCESS_STAGES } from "@/shared/ui/brand";
import { PROCESS_STAGE_ID, toProcessStageViews } from "./process-stage-view";

describe("tablero de proceso: traslado de etapas del dominio a ids visuales", () => {
  it("la tabla es exhaustiva y cubre cada id visual una sola vez, en el mismo orden", () => {
    expect(PROCESS_STAGE_KINDS.map((k) => PROCESS_STAGE_ID[k])).toEqual([...PROCESS_STAGES]);
  });
  it("estado, fecha y estimación se trasladan sin cambios", () => {
    const timeline: ProcessStageTimeline[] = PROCESS_STAGE_KINDS.map((stage, i) => ({
      stage,
      status: i < 2 ? "done" : i === 2 ? "current" : "upcoming",
      date: `2026-0${i + 1}-15` as IsoDate,
      estimated: i > 2,
    }));
    const views = toProcessStageViews(timeline);
    expect(views).toHaveLength(6);
    views.forEach((v, i) => {
      expect(v.id).toBe(PROCESS_STAGES[i]);
      expect(v.status).toBe(timeline[i]!.status);
      expect(v.date).toBe(timeline[i]!.date);
      expect(v.estimated).toBe(timeline[i]!.estimated);
    });
  });
});
