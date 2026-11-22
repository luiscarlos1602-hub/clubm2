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

  it("index.ts expone el contrato de los planes 002 §3.11, 005 §3.1 y 006 §3.2", async () => {
    const publicKeys = Object.keys(await import("./index")).sort();
    expect(publicKeys).toEqual(
      [
        "PROCESS_STAGE_KINDS",
        "PROCESS_STEP_STATUSES",
        "PROJECT_RISK_KINDS",
        "PROJECT_SLUG_PATTERN",
        "PROJECT_STATUSES",
        "PROJECT_TRANSITIONS",
        "PUBLIC_STAGES",
        "TARGET_TERM_MONTHS",
        "canTransition",
        "changeProjectStatus",
        "checkProjectConsistency",
        "checkProjectProcess",
        "isProjectSlug",
        "normalizeRiskKinds",
        "sortUpdatesNewestFirst",
        "toProcessTimeline",
        "isPublishedStatus",
        "isTerminalStatus",
        "parseProjectCode",
        "toPublicStage",
        "transitionStatus",
      ].sort(),
    );
  });
});
