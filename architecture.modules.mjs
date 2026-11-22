// Orden de módulos de base a cima (docs/01-arquitectura.md §4 regla 3).
// Un módulo solo importa de los que están antes. Agregar un módulo = una línea aquí.
// F1 solo usa `projects` y `finance`; el resto se registra cuando exista (skill nuevo-modulo).
export const moduleOrder = [
  "projects",
  "participations",
  "finance",
  "acquisitions",
  "renovations",
  "sales",
  "investors",
  "club",
  "crm",
];
