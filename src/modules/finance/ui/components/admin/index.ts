// Pantalla del backoffice de finance (B5).
export { FinanceScreen } from "./FinanceScreen";
// Mismo tablero de proceso que la ficha y el panel (única fuente); lo inyecta app/admin a la pantalla de obra de projects.
export { ProjectProcessBoard } from "../investor/ProjectProcessBoard";
// W-3 · cifras de la ficha en el detalle de B2 (lo inyecta app/admin a la pantalla de projects).
export { OpportunityFigures } from "./OpportunityFigures";
// W-2 · alta y edición de inmueble (B8, B9).
export * from "./project-sheet";
