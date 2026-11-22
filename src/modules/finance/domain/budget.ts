import type { ProjectId } from "@/modules/projects";
import { MAX_MONEY_CENTS, equalsMoney, sumMoney, type Money } from "@/shared/domain/money";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { ProjectEconomics } from "./project-economics";

/** docs/02 §6. La bolsa (honorarios · contingencia · reserva) es parte de F, no una ganancia adicional (maestro §6). */
export const BUDGET_CATEGORIES = ["works", "management_fee", "contingency", "reserve"] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const BUDGET_ITEMS = [
  "kitchen",
  "bathrooms",
  "floors_paint",
  "electrical_plumbing",
  "garden_exterior",
  "carpentry",
  "management_fee",
  "contingency",
  "reserve",
] as const;
export type BudgetItem = (typeof BUDGET_ITEMS)[number];

/** La categoría se deriva del ítem; no se guarda. */
export const BUDGET_ITEM_CATEGORY: Readonly<Record<BudgetItem, BudgetCategory>> = Object.freeze({
  kitchen: "works",
  bathrooms: "works",
  floors_paint: "works",
  electrical_plumbing: "works",
  garden_exterior: "works",
  carpentry: "works",
  management_fee: "management_fee",
  contingency: "contingency",
  reserve: "reserve",
});

export type BudgetLine = { readonly item: BudgetItem; readonly amount: Money };

/** Presupuesto integral F por líneas (lo presupuestado; lo devengado/gastado es de B3/B5). El orden es el de presentación. */
export type ProjectBudget = {
  readonly projectId: ProjectId;
  readonly lines: readonly BudgetLine[];
};

export type BudgetErrorCode =
  | "PROJECT_MISMATCH"
  | "NEGATIVE_AMOUNT"
  | "DUPLICATE_ITEM"
  | "NO_WORKS_LINES"
  | "BUDGET_TOTAL_MISMATCH";

type BudgetError = DomainError<BudgetErrorCode>;

const isWorks = (l: BudgetLine): boolean => BUDGET_ITEM_CATEGORY[l.item] === "works";

function isSummable(m: Money): boolean {
  return Number.isSafeInteger(m.cents) && m.cents <= MAX_MONEY_CENTS;
}

function checkLines(b: ProjectBudget, economics: ProjectEconomics): BudgetError | null {
  if (b.projectId !== economics.projectId) {
    return {
      code: "PROJECT_MISMATCH",
      detail: "el presupuesto y la economía son de proyectos distintos",
    };
  }
  if (b.lines.some((l) => l.amount.cents < 0)) {
    return { code: "NEGATIVE_AMOUNT", detail: "cada línea debe ser ≥ 0" };
  }
  if (new Set(b.lines.map((l) => l.item)).size !== b.lines.length) {
    return { code: "DUPLICATE_ITEM", detail: "cada ítem aparece una sola vez" };
  }
  if (!b.lines.some(isWorks)) {
    return { code: "NO_WORKS_LINES", detail: "se espera al menos una línea de obra" };
  }
  const amounts = b.lines.map((l) => l.amount);
  if (!amounts.every(isSummable) || !equalsMoney(sumMoney(amounts), economics.recoveryBudget)) {
    return {
      code: "BUDGET_TOTAL_MISMATCH",
      detail: "las líneas deben sumar el presupuesto integral F",
    };
  }
  return null;
}

/** Σ líneas = economics.recoveryBudget; mismo projectId; sin ítems repetidos; amount ≥ 0; al menos una línea works. Nunca lanza. */
export function checkProjectBudget(
  b: ProjectBudget,
  economics: ProjectEconomics,
): Result<ProjectBudget, BudgetError> {
  const error = checkLines(b, economics);
  return error === null ? ok(b) : err(error.code, error.detail);
}

/** Σ de las líneas de obra. Precondición: presupuesto validado con checkProjectBudget. */
export function worksSubtotal(b: ProjectBudget): Money {
  return sumMoney(b.lines.filter(isWorks).map((l) => l.amount));
}

export type BudgetBreakdown = {
  /** C (capital propio de la empresa). */
  readonly acquisition: Money;
  /** Categoría works, en el orden de la semilla. */
  readonly works: readonly BudgetLine[];
  /** management_fee · contingency · reserve, en el orden de la semilla. */
  readonly fees: readonly BudgetLine[];
  /** F. */
  readonly recovery: Money;
  /** O estimado (proyección). */
  readonly saleCosts: Money;
  /** C + F + O. */
  readonly total: Money;
};

/** Desglose para la ficha. Precondición: presupuesto validado con checkProjectBudget. */
export function buildBudgetBreakdown(
  economics: ProjectEconomics,
  b: ProjectBudget,
): BudgetBreakdown {
  return {
    acquisition: economics.acquisitionCost,
    works: b.lines.filter(isWorks),
    fees: b.lines.filter((l) => !isWorks(l)),
    recovery: economics.recoveryBudget,
    saleCosts: economics.estimatedSaleCosts,
    total: sumMoney([
      economics.acquisitionCost,
      economics.recoveryBudget,
      economics.estimatedSaleCosts,
    ]),
  };
}
