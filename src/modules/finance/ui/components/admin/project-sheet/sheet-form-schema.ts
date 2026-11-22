import { z } from "zod";
import {
  PROCESS_STAGE_KINDS,
  PROJECT_IMAGE_KINDS,
  PROJECT_RISK_KINDS,
  PROJECT_STATUSES,
  type ProcessStageKind,
  type ProjectImageKind,
  type ProjectRiskKind,
  type ProjectStatus,
  type PropertyKind,
} from "@/modules/projects";
import { BUDGET_ITEMS, type BudgetItem } from "../../../../domain/budget";
import { COMMON_RISK_KINDS } from "../../../../domain/project-sheet-requirements";
import type { ProjectSheetField } from "../../../../domain/project-sheet";
import { SHEET_COPY } from "./copy";

const E = SHEET_COPY.formErrors;

/** Valores del formulario: todo texto (RHF) y USD enteros. La conversión a `ProjectSheetInput` está en sheet-form-convert. */
export type SheetFormValues = {
  name: string;
  city: string;
  zone: string;
  kind: PropertyKind;
  areaM2: string;
  status: ProjectStatus;
  acquiredOn: string;
  description: string;
  /** Uno por línea. */
  highlights: string;
  acquisitionCost: string;
  recoveryBudget: string;
  targetSalePrice: string;
  estimatedSaleCosts: string;
  budget: Record<BudgetItem, string>;
  classTotal: string;
  classUnitPrice: string;
  risks: ProjectRiskKind[];
  steps: Record<ProcessStageKind, string>;
  /** url elegida por tipo; "" = ninguna. */
  images: Record<ProjectImageKind, string>;
};

const usdText = z.string().trim().regex(/^\d{0,9}$/, E.digits);
const intText = z.string().trim().regex(/^\d{0,5}$/, E.digits);
const stage = (): Record<ProcessStageKind, z.ZodString> =>
  Object.fromEntries(PROCESS_STAGE_KINDS.map((k) => [k, intText])) as Record<ProcessStageKind, z.ZodString>;

/** Solo forma (texto, enteros, fecha). Las reglas de negocio las aplica `buildProjectSheet`. */
export const sheetFormSchema = z.object({
  name: z.string().max(120, E.tooLong),
  city: z.string().max(80, E.tooLong),
  zone: z.string().max(80, E.tooLong),
  kind: z.enum(["apartment", "house"]),
  areaM2: intText,
  status: z.enum(PROJECT_STATUSES),
  acquiredOn: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, E.date),
  description: z.string().max(1500, E.tooLong),
  highlights: z.string().max(1500, E.tooLong),
  acquisitionCost: usdText,
  recoveryBudget: usdText,
  targetSalePrice: usdText,
  estimatedSaleCosts: usdText,
  budget: z.object(Object.fromEntries(BUDGET_ITEMS.map((i) => [i, usdText])) as Record<BudgetItem, typeof usdText>),
  classTotal: intText,
  classUnitPrice: usdText,
  risks: z.array(z.enum(PROJECT_RISK_KINDS)),
  steps: z.object(stage()).superRefine((steps, ctx) => {
    const filled = PROCESS_STAGE_KINDS.filter((k) => steps[k].trim() !== "").length;
    if (filled > 0 && filled < PROCESS_STAGE_KINDS.length) {
      ctx.addIssue({ code: "custom", message: E.processAllOrNone, path: [PROCESS_STAGE_KINDS[0]] });
    }
  }),
  images: z.object(
    Object.fromEntries(PROJECT_IMAGE_KINDS.map((k) => [k, z.string()])) as Record<ProjectImageKind, z.ZodString>,
  ),
});

export function emptySheetValues(): SheetFormValues {
  return {
    name: "",
    city: "",
    zone: "",
    kind: "apartment",
    areaM2: "",
    status: "funding",
    acquiredOn: "",
    description: "",
    highlights: "",
    acquisitionCost: "",
    recoveryBudget: "",
    targetSalePrice: "",
    estimatedSaleCosts: "",
    budget: Object.fromEntries(BUDGET_ITEMS.map((i) => [i, ""])) as Record<BudgetItem, string>,
    classTotal: "",
    classUnitPrice: "",
    risks: [...COMMON_RISK_KINDS],
    steps: Object.fromEntries(PROCESS_STAGE_KINDS.map((k) => [k, ""])) as Record<ProcessStageKind, string>,
    images: { before: "", after: "", projection: "" },
  };
}

/** Campos del formulario que valida cada paso (forma). */
export const STEP_FORM_FIELDS = [
  ["name", "city", "zone", "kind", "areaM2", "status", "acquiredOn", "description", "highlights"],
  ["acquisitionCost", "recoveryBudget", "targetSalePrice", "estimatedSaleCosts"],
  ["budget"],
  ["classTotal", "classUnitPrice"],
  ["risks", "steps"],
  ["images"],
  [],
] as const;

/** Campos de dominio (`ProjectSheetField`) que se pintan en cada paso. F aparece en economía y en participaciones. */
export const STEP_ISSUE_FIELDS: readonly (readonly ProjectSheetField[])[] = [
  ["property.city", "property.zone", "property.kind", "property.areaM2", "project.code", "project.name", "project.status", "project.acquiredOn", "project.timeline", "profile"],
  ["economics"],
  ["budgetLines"],
  ["participationClass", "economics.recoveryBudget"],
  ["riskKinds", "processSteps"],
  ["images"],
  [],
];

export function stepOfField(field: ProjectSheetField): number {
  const i = STEP_ISSUE_FIELDS.findIndex((fields) => fields.includes(field));
  return i < 0 ? STEP_ISSUE_FIELDS.length - 1 : i;
}
