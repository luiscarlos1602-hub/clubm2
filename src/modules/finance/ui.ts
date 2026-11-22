// Pantallas públicas y del inversionista (ADR-012): ficha + simulador y participar.
export * from "./ui/components/investor";
// Proyección base por tenencia: la misma cuenta del simulador de la ficha, para panel y portafolio.
export { projectHolding, useHoldingProjections, type HoldingProjections, type HoldingProjectionRequest } from "./ui/hooks/holding-projection";
export { loadProjectDetail, type ProjectDetailData } from "./ui/hooks/use-project-detail";
