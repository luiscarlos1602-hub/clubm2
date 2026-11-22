import { PROCESS_STAGE_KINDS, PROJECT_IMAGE_KINDS, type ProcessStageKind, type ProjectImageKind } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { sumMoney, usdUnits, type Money } from "@/shared/domain/money";
import { BUDGET_ITEMS, type BudgetItem } from "../../../../domain/budget";
import type { ProjectSheet, ProjectSheetInput } from "../../../../domain/project-sheet";
import { expectedRecoveryBudget } from "../../../../domain/project-sheet-requirements";
import { emptySheetValues, type SheetFormValues } from "./sheet-form-schema";

const DIGITS = /^\d{1,9}$/;

/** Texto de USD enteros → Money. Vacío o no numérico = 0 (lo rechaza el dominio donde corresponda). */
function usdOf(text: string): Money {
  const t = text.trim();
  return usdUnits(DIGITS.test(t) ? Number(t) : 0);
}

const intOf = (text: string): number => (/^\d{1,5}$/.test(text.trim()) ? Number(text.trim()) : 0);

const usdText = (m: Money): string => String(m.cents / 100);

const lines = (text: string): string[] =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");

/** Valores del formulario → entrada del comando `buildProjectSheet`. Vacío en un bloque opcional = null. */
export function formToInput(values: SheetFormValues, existing: ProjectSheet | null): ProjectSheetInput {
  const highlights = lines(values.highlights);
  const description = values.description.trim();
  const allSteps = PROCESS_STAGE_KINDS.every((k) => values.steps[k].trim() !== "");
  const hasClass = values.classTotal.trim() !== "" || values.classUnitPrice.trim() !== "";
  return {
    projectId: existing?.project.id ?? null,
    property: { city: values.city, zone: values.zone, kind: values.kind, areaM2: intOf(values.areaM2) },
    project: {
      name: values.name,
      status: values.status,
      acquiredOn: values.acquiredOn === "" ? null : (values.acquiredOn as IsoDate),
    },
    profile: description === "" && highlights.length === 0 ? null : { description, highlights },
    processSteps: allSteps
      ? (Object.fromEntries(
          PROCESS_STAGE_KINDS.map((k) => [
            k,
            existing?.process?.steps[k]
              ? { ...existing.process.steps[k], offsetDays: intOf(values.steps[k]) }
              : { status: "upcoming", offsetDays: intOf(values.steps[k]), started: false },
          ]),
        ) as unknown as NonNullable<ProjectSheetInput["processSteps"]>)
      : null,
    riskKinds: values.risks,
    participationClass: hasClass
      ? { total: intOf(values.classTotal), unitPrice: usdOf(values.classUnitPrice) }
      : null,
    economics: {
      acquisitionCost: usdOf(values.acquisitionCost),
      recoveryBudget: usdOf(values.recoveryBudget),
      targetSalePrice: usdOf(values.targetSalePrice),
      estimatedSaleCosts: usdOf(values.estimatedSaleCosts),
    },
    budgetLines: BUDGET_ITEMS.map((item) => ({ item, amount: usdOf(values.budget[item]) })),
    images: PROJECT_IMAGE_KINDS.filter((k) => values.images[k] !== "").map((kind) => ({
      kind,
      url: values.images[kind],
    })),
  };
}

/** Ficha guardada → valores del formulario (USD enteros en texto). */
export function sheetToForm(sheet: ProjectSheet): SheetFormValues {
  const base = emptySheetValues();
  const budget = { ...base.budget };
  for (const line of sheet.budget.lines) budget[line.item as BudgetItem] = usdText(line.amount);
  const steps = { ...base.steps };
  if (sheet.process) {
    for (const k of PROCESS_STAGE_KINDS) steps[k as ProcessStageKind] = String(sheet.process.steps[k].offsetDays);
  }
  const images = { ...base.images };
  for (const image of sheet.images) images[image.kind as ProjectImageKind] = image.url;
  return {
    ...base,
    name: sheet.project.name,
    city: sheet.property.city,
    zone: sheet.property.zone,
    kind: sheet.property.kind,
    areaM2: String(sheet.property.areaM2),
    status: sheet.project.status,
    acquiredOn: sheet.project.timeline.acquiredOn ?? "",
    description: sheet.profile?.description ?? "",
    highlights: (sheet.profile?.highlights ?? []).join("\n"),
    acquisitionCost: usdText(sheet.economics.acquisitionCost),
    recoveryBudget: usdText(sheet.economics.recoveryBudget),
    targetSalePrice: usdText(sheet.economics.targetSalePrice),
    estimatedSaleCosts: usdText(sheet.economics.estimatedSaleCosts),
    budget,
    classTotal: sheet.participationClass ? String(sheet.participationClass.total) : "",
    classUnitPrice: sheet.participationClass ? usdText(sheet.participationClass.unitPrice) : "",
    risks: [...(sheet.risks?.kinds ?? [])],
    steps,
    images,
  };
}

/** Cifras para mostrar (Σ rubros, F esperada…) calculadas con el dominio; la pantalla solo las pinta con MoneyDisplay. */
export type SheetFigures = {
  readonly acquisitionCost: Money;
  readonly recoveryBudget: Money;
  readonly targetSalePrice: Money;
  readonly estimatedSaleCosts: Money;
  readonly budgetTotal: Money;
  readonly unitPrice: Money | null;
  /** total × precio; null si falta o no es válido. */
  readonly expectedRecovery: Money | null;
  readonly lines: readonly { readonly item: BudgetItem; readonly amount: Money }[];
};

export function sheetFigures(values: SheetFormValues): SheetFigures {
  const input = formToInput(values, null);
  const cls = input.participationClass;
  return {
    ...input.economics,
    budgetTotal: sumMoney(input.budgetLines.map((l) => l.amount)),
    unitPrice: cls?.unitPrice ?? null,
    expectedRecovery: cls ? expectedRecoveryBudget(cls.total, cls.unitPrice) : null,
    lines: input.budgetLines,
  };
}
