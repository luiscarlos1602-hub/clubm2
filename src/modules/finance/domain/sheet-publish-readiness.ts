import type { ProjectSheet, ProjectSheetInput, ProjectSheetIssue } from "./project-sheet";
import { checkPublishRequirements } from "./project-sheet-requirements";

/** La ficha guardada vista como lo que enviaría el asistente (para reaplicar sus reglas). Pura. */
export function sheetToInput(sheet: ProjectSheet): ProjectSheetInput {
  const { property, project, profile, process, risks, participationClass: cls } = sheet;
  const { acquisitionCost, recoveryBudget, targetSalePrice, estimatedSaleCosts } = sheet.economics;
  return {
    projectId: project.id,
    property: { city: property.city, zone: property.zone, kind: property.kind, areaM2: property.areaM2 },
    project: { name: project.name, status: project.status, acquiredOn: project.timeline.acquiredOn },
    profile: profile === null ? null : { description: profile.description, highlights: profile.highlights },
    processSteps: process?.steps ?? null,
    riskKinds: risks?.kinds ?? [],
    participationClass: cls === null ? null : { total: cls.total, unitPrice: cls.unitPrice },
    economics: { acquisitionCost, recoveryBudget, targetSalePrice, estimatedSaleCosts },
    budgetLines: sheet.budget.lines,
    images: sheet.images.map((i) => ({ kind: i.kind, url: i.url })),
  };
}

/**
 * W-3 · requisitos S4 "para publicar" de una ficha guardada en la etapa de su `project`
 * (cambio de etapa acquired → funding). Vacío = lista. Pura.
 */
export function checkSheetPublishable(sheet: ProjectSheet): readonly ProjectSheetIssue[] {
  return checkPublishRequirements(sheetToInput(sheet), sheet.project.status);
}
