import { describe, expect, it } from "vitest";
import { usd, usdUnits } from "@/shared/domain/money";
import {
  COMMON_RISK_KINDS,
  PUBLISH_REQUIRED_IMAGE_KINDS,
  checkPublishRequirements,
  expectedRecoveryBudget,
} from "./project-sheet-requirements";
import { MINIMAL_INPUT, PUBLISHABLE_INPUT } from "./project-sheet.test-fixtures";

describe("expectedRecoveryBudget (S5: F = total × precio)", () => {
  it("caso canónico ref. 100 × USD 100 = F 10.000", () => {
    expect(expectedRecoveryBudget(100, usdUnits(100))).toEqual(usdUnits(10_000));
  });

  it("al centavo: 3 × USD 0,33 = USD 0,99", () => {
    expect(expectedRecoveryBudget(3, usd(33))).toEqual(usd(99));
  });

  it("entradas inválidas o producto fuera de rango → null (nunca lanza)", () => {
    expect(expectedRecoveryBudget(0, usdUnits(100))).toBeNull();
    expect(expectedRecoveryBudget(1.5, usdUnits(100))).toBeNull();
    expect(expectedRecoveryBudget(100, usd(0))).toBeNull();
    expect(expectedRecoveryBudget(1_000_000, usdUnits(9_000_000_000))).toBeNull();
  });
});

describe("checkPublishRequirements (S4 'para publicar')", () => {
  it("riesgos comunes = los 3 primeros; imágenes exigidas = antes y proyección", () => {
    expect(COMMON_RISK_KINDS).toEqual(["sale_below_target", "works_overrun", "slow_sale"]);
    expect(PUBLISH_REQUIRED_IMAGE_KINDS).toEqual(["before", "projection"]);
  });

  it("etapa no publicable → sin exigencias", () => {
    expect(checkPublishRequirements(MINIMAL_INPUT, "due_diligence")).toEqual([]);
    expect(checkPublishRequirements(MINIMAL_INPUT, "acquired")).toEqual([]);
  });

  it("etapa publicable completa → sin issues", () => {
    expect(checkPublishRequirements(PUBLISHABLE_INPUT, "funding")).toEqual([]);
  });

  it("etapa publicable incompleta → un issue por requisito, con su campo", () => {
    const issues = checkPublishRequirements(
      {
        ...MINIMAL_INPUT,
        riskKinds: ["sale_below_target", "works_overrun"],
        images: [{ kind: "before", url: "/x.svg" }],
      },
      "on_sale",
    );
    expect(issues.map((i) => [i.code, i.field])).toEqual([
      ["REQUIRED_FOR_PUBLISHED", "project.acquiredOn"],
      ["REQUIRED_FOR_PUBLISHED", "profile"],
      ["REQUIRED_FOR_PUBLISHED", "processSteps"],
      ["REQUIRED_FOR_PUBLISHED", "participationClass"],
      ["MISSING_COMMON_RISKS", "riskKinds"],
      ["MISSING_REQUIRED_IMAGES", "images"],
    ]);
    expect(issues.every((i) => typeof i.detail === "string" && i.detail.length > 0)).toBe(true);
  });
});
