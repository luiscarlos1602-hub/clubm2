// Pantallas públicas y del inversionista (ADR-012): ficha + simulador y participar.
export * from "./ui/components/investor";
// Proyección base por tenencia: la misma cuenta del simulador de la ficha (caso de uso del container), para panel y portafolio.
export { projectHolding, useHoldingProjections } from "./ui/hooks/holding-projection";
export type { HoldingProjections, HoldingProjectionRequest } from "./application/get-holding-projections";
export { loadProjectDetail } from "./ui/hooks/use-project-detail";
export type { ProjectDetail as ProjectDetailData } from "./domain/project-detail";
export { profitRateLabel, PROFIT_RATE_COPY } from "./ui/hooks/profit-rate";
export { useProcessStages } from "./ui/hooks/use-process-stages";
