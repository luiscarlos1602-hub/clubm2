import { describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import { isoDate } from "@/shared/domain/calendar-date";
import type { ProjectId } from "./project";
import {
  PROCESS_STAGE_KINDS,
  checkProjectProcess,
  toProcessTimeline,
  type ProcessStageKind,
  type ProcessStep,
  type ProjectProcess,
} from "./process";

const d = (offsetDays: number): ProcessStep => ({ status: "done", offsetDays, started: true });
const c = (offsetDays: number, started = true): ProcessStep => ({
  status: "current",
  offsetDays,
  started,
});
const u = (offsetDays: number): ProcessStep => ({ status: "upcoming", offsetDays, started: false });

const PROJECT_ID = asId<"Project">("prj_chacao_02") as ProjectId;

function processOf(steps: Record<ProcessStageKind, ProcessStep>): ProjectProcess {
  return { projectId: PROJECT_ID, steps };
}

// Igual al tablero de M2-006 en la maqueta: inicio de obra en curso sin empezar.
const OPEN = processOf({
  works_start: c(30, false),
  works_50: u(60),
  works_80: u(78),
  sale_start: u(90),
  on_sale: u(94),
  sold: u(125),
});

const FINISHED = processOf({
  works_start: d(7),
  works_50: d(30),
  works_80: d(50),
  sale_start: d(62),
  on_sale: d(70),
  sold: d(140),
});

describe("checkProjectProcess (ADR-013 §5)", () => {
  it("acepta procesos coherentes", () => {
    expect(checkProjectProcess(OPEN).ok).toBe(true);
    expect(checkProjectProcess(FINISHED).ok).toBe(true);
  });

  it("NEGATIVE_OFFSET: ninguna etapa antes de la compra", () => {
    const r = checkProjectProcess(processOf({ ...FINISHED.steps, works_start: d(-1) }));
    expect(r.ok ? null : r.error.code).toBe("NEGATIVE_OFFSET");
  });

  it("DECREASING_OFFSETS: los días no retroceden en el orden de las etapas", () => {
    const r = checkProjectProcess(processOf({ ...FINISHED.steps, works_80: d(20) }));
    expect(r.ok ? null : r.error.code).toBe("DECREASING_OFFSETS");
  });

  it("STATUS_ORDER: done* current? upcoming*, con un solo current", () => {
    const twoCurrent = processOf({ ...OPEN.steps, works_50: c(60) });
    const doneAfterUpcoming = processOf({ ...FINISHED.steps, works_80: u(50) });
    for (const p of [twoCurrent, doneAfterUpcoming]) {
      const r = checkProjectProcess(p);
      expect(r.ok ? null : r.error.code).toBe("STATUS_ORDER");
    }
  });

  it("DONE_NOT_STARTED: una etapa hecha ya empezó", () => {
    const r = checkProjectProcess(
      processOf({ ...FINISHED.steps, sold: { status: "done", offsetDays: 140, started: false } }),
    );
    expect(r.ok ? null : r.error.code).toBe("DONE_NOT_STARTED");
  });

  it("UPCOMING_STARTED: una etapa próxima no empezó", () => {
    const r = checkProjectProcess(
      processOf({ ...OPEN.steps, sold: { status: "upcoming", offsetDays: 125, started: true } }),
    );
    expect(r.ok ? null : r.error.code).toBe("UPCOMING_STARTED");
  });

  it("nunca lanza ante offsets no enteros", () => {
    const r = checkProjectProcess(processOf({ ...FINISHED.steps, works_start: d(Number.NaN) }));
    expect(r.ok).toBe(false);
  });
});

describe("toProcessTimeline", () => {
  it("devuelve las 6 etapas en orden con la fecha = compra + días", () => {
    const timeline = toProcessTimeline(isoDate("2026-11-01"), OPEN);
    expect(timeline.map((s) => s.stage)).toEqual([...PROCESS_STAGE_KINDS]);
    expect(timeline[0]).toEqual({
      stage: "works_start",
      status: "current",
      date: "2026-12-01",
      estimated: true,
    });
    expect(timeline[5]?.date).toBe("2027-03-06");
  });

  it("estimated: upcoming o current sin empezar; done y current empezado son fechas ciertas", () => {
    const started = processOf({ ...FINISHED.steps, sold: u(140), on_sale: c(70) });
    const timeline = toProcessTimeline(isoDate("2026-01-01"), started);
    expect(timeline.map((s) => s.estimated)).toEqual([false, false, false, false, false, true]);
    expect(toProcessTimeline(isoDate("2026-01-01"), OPEN).every((s) => s.estimated)).toBe(true);
  });
});
