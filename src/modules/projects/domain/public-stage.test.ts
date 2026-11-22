import { describe, expect, it } from "vitest";
import { PROJECT_STATUSES, type ProjectStatus } from "./project-status";
import { PUBLIC_STAGES, isPublishedStatus, toPublicStage, type PublicStage } from "./public-stage";

const EXPECTED: Record<ProjectStatus, PublicStage | null> = {
  opportunity: null,
  due_diligence: null,
  acquired: null,
  funding: "funding",
  renovation: "renovation",
  on_sale: "on_sale",
  sold: "sold",
  settled: "settled",
  discarded: null,
  stalled: "on_sale",
};

describe("toPublicStage", () => {
  it("tabla exhaustiva sobre PROJECT_STATUSES (10 estados)", () => {
    expect(Object.keys(EXPECTED).sort()).toEqual([...PROJECT_STATUSES].sort());
    for (const status of PROJECT_STATUSES) expect(toPublicStage(status)).toBe(EXPECTED[status]);
  });

  it("L5 · stalled se muestra como on_sale", () => {
    expect(toPublicStage("stalled")).toBe("on_sale");
  });

  it("N7 / P3-4 · opportunity, due_diligence, discarded y acquired no se publican", () => {
    for (const status of ["opportunity", "due_diligence", "discarded", "acquired"] as const) {
      expect(toPublicStage(status)).toBeNull();
    }
  });

  it("toda etapa devuelta pertenece a PUBLIC_STAGES", () => {
    for (const status of PROJECT_STATUSES) {
      const stage = toPublicStage(status);
      if (stage !== null) expect(PUBLIC_STAGES).toContain(stage);
    }
  });

  it("ADR-004 · PUBLIC_STAGES no contiene stalled ni vocabulario de ruedas", () => {
    expect(PUBLIC_STAGES).not.toContain("stalled");
    for (const stage of PUBLIC_STAGES) expect(stage).not.toMatch(/wheel|rueda|estanc|stall/i);
  });
});

describe("isPublishedStatus", () => {
  it("coincide con toPublicStage !== null", () => {
    for (const status of PROJECT_STATUSES) {
      expect(isPublishedStatus(status)).toBe(toPublicStage(status) !== null);
    }
  });
});
