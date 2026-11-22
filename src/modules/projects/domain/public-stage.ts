import type { ProjectStatus } from "./project-status";

/** Etapas que ve el público y el inversionista. Nunca incluye el estado interno de demora ni estados previos a la colocación. */
export const PUBLIC_STAGES = ["funding", "renovation", "on_sale", "sold", "settled"] as const;
export type PublicStage = (typeof PUBLIC_STAGES)[number];

/**
 * Tabla única estado → etapa pública (L5, N7, ADR-004). Al añadir un estado, TypeScript obliga a decidir su etapa.
 * acquired no se publica hasta abrir la colocación [SUPUESTO P3-4]; stalled se muestra como on_sale (L5).
 */
const PUBLIC_STAGE_BY_STATUS: Readonly<Record<ProjectStatus, PublicStage | null>> = Object.freeze({
  opportunity: null,
  due_diligence: null,
  acquired: null,
  discarded: null,
  funding: "funding",
  renovation: "renovation",
  on_sale: "on_sale",
  stalled: "on_sale",
  sold: "sold",
  settled: "settled",
});

export function toPublicStage(status: ProjectStatus): PublicStage | null {
  return PUBLIC_STAGE_BY_STATUS[status];
}

export function isPublishedStatus(status: ProjectStatus): boolean {
  return toPublicStage(status) !== null;
}
