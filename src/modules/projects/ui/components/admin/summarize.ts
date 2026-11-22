import type { ProjectStatus } from "../../../domain/project-status";
import type { Wheel } from "../../../domain/classify-wheel";
import type { ProjectRow } from "./use-admin-projects";

const CLOSED: readonly ProjectStatus[] = ["settled", "discarded"];

export function countByStatus(rows: readonly ProjectRow[]): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const r of rows) out[r.project.status] = (out[r.project.status] ?? 0) + 1;
  return out;
}

export function countActive(rows: readonly ProjectRow[]): number {
  return rows.filter((r) => !CLOSED.includes(r.project.status)).length;
}

export type WheelShare = { readonly wheel: Wheel; readonly count: number; readonly percent: number };

/** Reparto de ruedas entre los proyectos con compra. Porcentaje entero redondeado. */
export function wheelShares(rows: readonly ProjectRow[]): readonly WheelShare[] {
  const measured = rows.filter((r) => r.wheel !== null);
  const wheels: readonly Wheel[] = ["good", "medium", "bad", "in_progress"];
  return wheels.map((wheel) => {
    const count = measured.filter((r) => r.wheel?.wheel === wheel).length;
    return { wheel, count, percent: measured.length === 0 ? 0 : Math.round((count * 100) / measured.length) };
  });
}
