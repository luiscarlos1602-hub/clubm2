import { describe, expect, it } from "vitest";
import { PROJECT_RISK_KINDS, normalizeRiskKinds } from "./project-risk";

describe("riesgos del proyecto (maestro §15)", () => {
  it("los 3 comunes van primero y no hay niveles ni ruedas en las claves", () => {
    expect(PROJECT_RISK_KINDS.slice(0, 3)).toEqual([
      "sale_below_target",
      "works_overrun",
      "slow_sale",
    ]);
    expect(PROJECT_RISK_KINDS.some((k) => /wheel|rueda|stalled|level|score/i.test(k))).toBe(false);
  });

  it("normalizeRiskKinds quita duplicados y ordena según PROJECT_RISK_KINDS", () => {
    expect(
      normalizeRiskKinds([
        "incomplete_placement",
        "slow_sale",
        "sale_below_target",
        "slow_sale",
        "works_overrun",
      ]),
    ).toEqual(["sale_below_target", "works_overrun", "slow_sale", "incomplete_placement"]);
  });

  it("no muta la entrada y acepta lista vacía", () => {
    const input = ["slow_sale", "sale_below_target"] as const;
    normalizeRiskKinds(input);
    expect(input).toEqual(["slow_sale", "sale_below_target"]);
    expect(normalizeRiskKinds([])).toEqual([]);
  });
});
