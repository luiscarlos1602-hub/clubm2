import { describe, expect, it } from "vitest";
import type { ProjectId } from "@/modules/projects";
import { asId } from "@/shared/domain/id";
import { usd, usdUnits } from "@/shared/domain/money";
import {
  BUDGET_CATEGORIES,
  BUDGET_ITEMS,
  BUDGET_ITEM_CATEGORY,
  buildBudgetBreakdown,
  checkProjectBudget,
  worksSubtotal,
  type ProjectBudget,
} from "./budget";
import type { ProjectEconomics } from "./project-economics";

const ID = asId<"Project">("prj_chacao_02") as ProjectId;

// M2-006 (maqueta): obra 5.000 en 4 rubros + bolsa 5.000 [SUPUESTO Q1] = F 10.000.
const ECONOMICS: ProjectEconomics = {
  projectId: ID,
  acquisitionCost: usdUnits(50_000),
  recoveryBudget: usdUnits(10_000),
  targetSalePrice: usdUnits(76_000),
  estimatedSaleCosts: usdUnits(2_280),
};

const BUDGET: ProjectBudget = {
  projectId: ID,
  lines: [
    { item: "kitchen", amount: usdUnits(1_300) },
    { item: "management_fee", amount: usdUnits(2_500) },
    { item: "bathrooms", amount: usdUnits(1_200) },
    { item: "floors_paint", amount: usdUnits(1_400) },
    { item: "contingency", amount: usdUnits(1_500) },
    { item: "electrical_plumbing", amount: usdUnits(1_100) },
    { item: "reserve", amount: usdUnits(1_000) },
  ],
};

function codeOf(b: ProjectBudget): string | null {
  const r = checkProjectBudget(b, ECONOMICS);
  return r.ok ? null : r.error.code;
}

describe("presupuesto integral F por líneas (docs/02 §6)", () => {
  it("la plantilla de M2-006 suma F = 10.000: obra 5.000 y bolsa 5.000", () => {
    expect(checkProjectBudget(BUDGET, ECONOMICS).ok).toBe(true);
    expect(worksSubtotal(BUDGET)).toEqual(usdUnits(5_000));
  });

  it("BUDGET_TOTAL_MISMATCH si las líneas no suman F (+1 ¢)", () => {
    const lines = BUDGET.lines.map((l) =>
      l.item === "reserve" ? { ...l, amount: usd(100_001) } : l,
    );
    expect(codeOf({ ...BUDGET, lines })).toBe("BUDGET_TOTAL_MISMATCH");
  });

  it("DUPLICATE_ITEM, NEGATIVE_AMOUNT, NO_WORKS_LINES y PROJECT_MISMATCH", () => {
    expect(
      codeOf({ ...BUDGET, lines: [...BUDGET.lines, { item: "kitchen", amount: usd(0) }] }),
    ).toBe("DUPLICATE_ITEM");
    const negative = BUDGET.lines.map((l, i) => (i === 0 ? { ...l, amount: usd(-1) } : l));
    expect(codeOf({ ...BUDGET, lines: negative })).toBe("NEGATIVE_AMOUNT");
    const feesOnly = [
      { item: "management_fee", amount: usdUnits(5_000) },
      { item: "contingency", amount: usdUnits(4_000) },
      { item: "reserve", amount: usdUnits(1_000) },
    ] as const;
    expect(codeOf({ ...BUDGET, lines: feesOnly })).toBe("NO_WORKS_LINES");
    expect(codeOf({ ...BUDGET, projectId: asId<"Project">("prj_otro_01") as ProjectId })).toBe(
      "PROJECT_MISMATCH",
    );
  });

  it("nunca lanza ante montos fuera del rango de Money", () => {
    const huge = BUDGET.lines.map((l, i) =>
      i === 0 ? { ...l, amount: { cents: Number.MAX_SAFE_INTEGER, currency: "USD" as const } } : l,
    );
    expect(() => checkProjectBudget({ ...BUDGET, lines: huge }, ECONOMICS)).not.toThrow();
    expect(codeOf({ ...BUDGET, lines: huge })).toBe("BUDGET_TOTAL_MISMATCH");
  });

  it("buildBudgetBreakdown: total = C + F + O y separa obra de bolsa conservando el orden", () => {
    const b = buildBudgetBreakdown(ECONOMICS, BUDGET);
    expect(b.acquisition).toEqual(usdUnits(50_000));
    expect(b.recovery).toEqual(usdUnits(10_000));
    expect(b.saleCosts).toEqual(usdUnits(2_280));
    expect(b.total).toEqual(usdUnits(62_280));
    expect(b.works.map((l) => l.item)).toEqual([
      "kitchen",
      "bathrooms",
      "floors_paint",
      "electrical_plumbing",
    ]);
    expect(b.fees.map((l) => l.item)).toEqual(["management_fee", "contingency", "reserve"]);
  });

  it("BUDGET_ITEM_CATEGORY es exhaustivo y solo usa categorías conocidas", () => {
    expect(Object.keys(BUDGET_ITEM_CATEGORY).sort()).toEqual([...BUDGET_ITEMS].sort());
    for (const item of BUDGET_ITEMS)
      expect(BUDGET_CATEGORIES).toContain(BUDGET_ITEM_CATEGORY[item]);
    expect(BUDGET_ITEMS.filter((i) => BUDGET_ITEM_CATEGORY[i] !== "works")).toEqual([
      "management_fee",
      "contingency",
      "reserve",
    ]);
  });
});
