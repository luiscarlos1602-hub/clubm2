import { describe, expect, it } from "vitest";
import { ROLE_HOME } from "./demo-role";
import { EXAMPLE_PROJECT_SLUG, NAV_ITEMS, projectHref, projectEditHref, ROUTES, ROUTE_IDS, activeRouteId, type RouteId } from "./route-map";

const follow = (start: RouteId, n: number) => {
  const out: RouteId[] = [start];
  for (let i = 0; i < n; i++) out.push(ROUTES[out[i]!].next);
  return out;
};

describe("route-map", () => {
  it("tiene las 20 rutas (17 + listado, alta y edición de proyectos, W-2)", () => {
    const expected = ["p1", "p2", "login", "terminos", "panel", "p3", "p4", "p5", "p6", "p7", "p8", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9"];
    expect([...ROUTE_IDS]).toEqual(expected);
    expect(Object.keys(ROUTES).sort()).toEqual([...expected].sort());
  });
  it("hrefs únicos, con zona admin coherente", () => {
    const hrefs = ROUTE_IDS.map((id) => ROUTES[id].href);
    expect(new Set(hrefs).size).toBe(20);
    for (const id of ROUTE_IDS) {
      const r = ROUTES[id];
      expect(r.href.startsWith("/")).toBe(true);
      expect(r.zone === "admin").toBe(r.href.startsWith("/admin"));
    }
    expect(ROUTES.p1.href).toBe("/");
    expect(ROUTES.b1.href).toBe("/admin");
  });
  it("pattern y href son coherentes", () => {
    for (const id of ROUTE_IDS) {
      const r = ROUTES[id];
      const derived =
        "/" +
        r.pattern
          .replace(/\([^)]*\)\/?/g, "")
          .replace(/\/?page\.tsx$/, "")
          .replace(/\[(slug|id)\]/g, EXAMPLE_PROJECT_SLUG);
      expect(derived === "/" ? "/" : derived.replace(/\/$/, "")).toBe(r.href);
    }
  });
  it("next existe y no apunta a sí misma", () => {
    for (const id of ROUTE_IDS) {
      expect(ROUTES[ROUTES[id].next]).toBeDefined();
      expect(ROUTES[id].next).not.toBe(id);
    }
  });
  it("flujos", () => {
    expect(follow("p1", 6)).toEqual(["p1", "p2", "panel", "p3", "p4", "p5", "p6"]);
    expect(follow("b1", 5)).toEqual(["b1", "b2", "b3", "b4", "b5", "p6"]);
  });
  it("terminos es pública, tiene su href y no está en la navegación", () => {
    expect(ROUTES.terminos.href).toBe("/terminos");
    expect(ROUTES.terminos.zone).toBe("public");
    expect(Object.values(NAV_ITEMS).flat()).not.toContain("terminos");
  });
  it("NAV_ITEMS por zona", () => {
    expect(NAV_ITEMS.investor.every((id) => ROUTES[id].zone === "investor")).toBe(true);
    expect(NAV_ITEMS.admin.every((id) => ROUTES[id].zone === "admin")).toBe(true);
    const hrefs = ROUTE_IDS.map((id) => ROUTES[id].href);
    for (const h of Object.values(ROLE_HOME)) expect(hrefs).toContain(h);
  });
  it("projectHref arma la URL de la ficha y coincide con el patrón de p4", () => {
    expect(projectHref("m2-006-chacao")).toBe("/proyectos/m2-006-chacao");
    const fromPattern = "/" + ROUTES.p4.pattern.replace(/\([^)]*\)\//g, "").replace("[slug]", "m2-006-chacao");
    expect(fromPattern).toBe(projectHref("m2-006-chacao"));
  });
  it("el menú del admin lleva al listado de proyectos", () => {
    expect(NAV_ITEMS.admin).toContain("b7");
    expect(ROUTES.b7.href).toBe("/admin/proyectos");
    expect(activeRouteId("/admin/proyectos", "admin")).toBe("b7");
    expect(activeRouteId("/admin/proyectos/nuevo", "admin")).toBe("b7");
  });
  it("editar un inmueble resalta el listado (b7), no el detalle (b3)", () => {
    expect(activeRouteId(projectEditHref(EXAMPLE_PROJECT_SLUG), "admin")).toBe("b7");
    expect(activeRouteId(projectEditHref("m2-008-los-palos-grandes"), "admin")).toBe("b7");
    expect(activeRouteId(`/admin/proyectos/${EXAMPLE_PROJECT_SLUG}`, "admin")).toBe("b3");
    expect(projectEditHref(EXAMPLE_PROJECT_SLUG)).toBe(ROUTES.b9.href);
  });
  it("activeRouteId", () => {
    expect(activeRouteId("/proyectos/m2-001/participar", "investor")).toBe("p3");
    expect(activeRouteId("/admin/crm", "admin")).toBe("b6");
    expect(activeRouteId("/admin", "admin")).toBe("b1");
    expect(activeRouteId("/", "public")).toBe("p1");
    expect(activeRouteId("/registro", "public")).toBe("p2");
    expect(activeRouteId("/nada", "public")).toBeNull();
  });
});
