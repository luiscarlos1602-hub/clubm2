import type {
  ProjectSheet,
  ProjectSheetField,
  ProjectSheetInput,
  ProjectSheetIssue,
} from "./project-sheet";

const removal = (field: ProjectSheetField): ProjectSheetIssue => ({
  code: "PART_REMOVAL_NOT_ALLOWED",
  field,
  detail: "una parte ya guardada no se quita al editar",
});

/**
 * Revisión W-2: al editar, perfil, proceso, riesgos y clase ya guardados no se pueden dejar vacíos
 * (el escritor hace upsert por parte y no borra). Con colocadas > 0 la clase ya la bloquea W2-2
 * (CLASS_LOCKED_BY_PLACEMENTS), así que aquí no se repite. Alta (`existing` null) → sin issues. Pura.
 */
export function checkPartRemovals(
  input: ProjectSheetInput,
  existing: ProjectSheet | null,
): readonly ProjectSheetIssue[] {
  if (existing === null) return [];
  const savedClass = existing.participationClass;
  const removed: readonly [ProjectSheetField, boolean][] = [
    ["profile", existing.profile !== null && input.profile === null],
    ["processSteps", existing.process !== null && input.processSteps === null],
    ["riskKinds", (existing.risks?.kinds.length ?? 0) > 0 && input.riskKinds.length === 0],
    [
      "participationClass",
      savedClass !== null && savedClass.placed === 0 && input.participationClass === null,
    ],
  ];
  return removed.filter(([, isRemoved]) => isRemoved).map(([field]) => removal(field));
}
