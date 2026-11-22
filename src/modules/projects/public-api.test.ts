import { describe, expect, it } from "vitest";

const WHEEL_EXPORTS = ["classifyWheel", "classifyProjectWheel", "WHEEL_THRESHOLDS_MONTHS"] as const;

describe("API pública de projects", () => {
  it("ADR-004 · index.ts no expone ruedas", async () => {
    const publicKeys = Object.keys(await import("./index"));
    for (const name of WHEEL_EXPORTS) expect(publicKeys).not.toContain(name);
    expect(publicKeys.some((k) => /wheel/i.test(k))).toBe(false);

    const backofficeKeys = Object.keys(await import("./backoffice"));
    for (const name of WHEEL_EXPORTS) expect(backofficeKeys).toContain(name);
  });

  it("index.ts expone el contrato del plan 002 §3.11", async () => {
    const publicKeys = Object.keys(await import("./index")).sort();
    expect(publicKeys).toEqual(
      [
        "PROJECT_STATUSES",
        "PROJECT_TRANSITIONS",
        "canTransition",
        "changeProjectStatus",
        "checkProjectConsistency",
        "isTerminalStatus",
        "parseProjectCode",
        "transitionStatus",
      ].sort(),
    );
  });
});
