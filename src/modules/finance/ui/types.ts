import type { ProcessStageId } from "@/shared/ui/brand";

export type StageStatus = "done" | "current" | "upcoming";
/** Etapa del proceso (tablero): días tras la compra. Real si ya ocurrió; estimada (proyección) si no. */
export type ProcessStep = { readonly status: StageStatus; readonly offsetDays: number; readonly started: boolean };
export type ProcessSteps = Readonly<Record<ProcessStageId, ProcessStep>>;
