import { describe, expect, it } from "vitest";
import { DEMO_ROLES, ROLE_HOME, ZONE_DEFAULT_ROLE, isDemoRole } from "./demo-role";
import { ROUTES } from "./route-map";

describe("demo-role", () => {
  it("isDemoRole acepta los 3 roles y rechaza el resto", () => {
    for (const r of DEMO_ROLES) expect(isDemoRole(r)).toBe(true);
    for (const v of ["Admin", "", null, undefined, 3]) expect(isDemoRole(v)).toBe(false);
  });
  it("las tablas cubren todas las claves", () => {
    expect(Object.keys(ROLE_HOME).sort()).toEqual([...DEMO_ROLES].sort());
    expect(Object.keys(ZONE_DEFAULT_ROLE).sort()).toEqual(["admin", "investor", "public"]);
  });
  it("ROLE_HOME apunta a hrefs existentes", () => {
    const hrefs = Object.values(ROUTES).map((r) => r.href);
    for (const h of Object.values(ROLE_HOME)) expect(hrefs).toContain(h);
  });
});
