import { describe, expect, it } from "vitest";
import { ROUTE_IDS } from "./route-map";
import { routeCopy } from "./route-copy";
import { SHELL_COPY } from "./shell-copy";

describe("route-copy", () => {
  it("las 14 rutas tienen todos los campos y respetan el vocabulario", () => {
    for (const id of ROUTE_IDS) {
      const c = routeCopy(id);
      for (const v of Object.values(c)) {
        expect(v.length).toBeGreaterThan(0);
        expect(v).not.toMatch(/rueda/i);
        expect(v).not.toMatch(/Club M/);
        expect(v).not.toMatch(/\b[PB][1-8]\b/);
      }
      expect(c.phrase.startsWith("Aquí")).toBe(true);
    }
  });
  it("el copy del shell no nombra ruedas ni la marca", () => {
    expect(JSON.stringify(SHELL_COPY)).not.toMatch(/rueda|Club M/i);
  });
});
