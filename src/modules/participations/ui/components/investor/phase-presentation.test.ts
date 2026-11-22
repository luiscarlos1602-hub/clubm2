import { describe, expect, it } from "vitest";
import { LISTING_PHASES } from "../../../domain/marketplace-listing";
import { PHASE_PRESENTATION } from "./phase-presentation";

describe("PHASE_PRESENTATION", () => {
  it("cubre las 6 fases", () => {
    expect(Object.keys(PHASE_PRESENTATION).sort()).toEqual([...LISTING_PHASES].sort());
    expect(LISTING_PHASES).toHaveLength(6);
  });
  it("ningún tono es de atención", () => {
    for (const phase of LISTING_PHASES) expect(PHASE_PRESENTATION[phase].tone).not.toBe("attention");
  });
  it("ningún rótulo menciona ruedas, estancamiento ni días", () => {
    for (const phase of LISTING_PHASES) expect(PHASE_PRESENTATION[phase].label).not.toMatch(/rueda|estanc|días/i);
  });
});
