import { test, expect } from "@playwright/test";
import { ROUTES, ROUTE_IDS, routeHref, type RouteId } from "../../src/shared/ui/app-shell/route-map";

/** Rutas que ya reemplazaron su RoutePlaceholder (no tienen empty-state). */
const BUILT: ReadonlySet<RouteId> = new Set<RouteId>(["p1", "p3"]);

test.describe("las 14 rutas", () => {
  for (const id of ROUTE_IDS) {
    test(`${id} ${routeHref(id)}`, async ({ page }, info) => {
      const res = await page.goto(routeHref(id));
      expect(res?.status()).toBe(200);
      await expect(page.getByTestId(`zona-${ROUTES[id].zone}`)).toBeVisible();
      const pagina = page.getByTestId(`pagina-${id}`);
      await expect(pagina).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByTestId("demo-banner")).toHaveCount(0); // sin cintillo fijo (ADR-011)
      if (!BUILT.has(id)) await expect(pagina.getByTestId("empty-state")).toBeVisible();
      const next = pagina.getByTestId("siguiente-paso");
      await expect(next).toBeVisible();
      await expect(next).toHaveAttribute("href", routeHref(ROUTES[id].next));
      await expect(page.getByTestId("selector-rol")).toBeVisible();
      expect(await page.locator("body").innerText()).not.toMatch(/rueda/i);
      if (info.project.name === "movil-390") {
        const w = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(w).toBeLessThanOrEqual(390);
      }
    });
  }
});

test.describe("recorridos por clic", () => {
  test("inversionista", async ({ page }) => {
    await page.goto("/");
    for (const url of ["/registro", "/proyectos", "/proyectos/m2-001", "/proyectos/m2-001/participar", "/portafolio"]) {
      await page.locator('[data-testid="siguiente-paso"]:visible').click();
      await expect(page).toHaveURL(new RegExp(`${url}$`));
    }
  });

  test("operativo", async ({ page }) => {
    await page.goto("/admin");
    for (const url of ["/admin/adquisiciones", "/admin/proyectos/m2-001", "/admin/comercializacion", "/admin/finanzas", "/portafolio"]) {
      await page.locator('[data-testid="siguiente-paso"]:visible').click();
      await expect(page).toHaveURL(new RegExp(`${url}$`));
    }
  });
});
