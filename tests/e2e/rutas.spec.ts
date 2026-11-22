import { test, expect, type Page } from "@playwright/test";
import { ROUTES, ROUTE_IDS, routeHref } from "../../src/shared/ui/app-shell/route-map";

/** Abre el menú Sheet en móvil y devuelve el enlace de navegación pedido (en desktop, el de la cabecera). */
async function navLink(page: Page, id: string) {
  // Next conserva ocultas las rutas anteriores: se filtra por lo visible.
  const abrir = page.locator('[data-testid="nav-movil-abrir"]:visible');
  if ((await abrir.count()) > 0) {
    await abrir.click();
    return page.locator('[data-testid="nav-movil"]:visible').getByTestId(`nav-link-${id}`);
  }
  return page.locator('[data-testid="nav-principal"]:visible').getByTestId(`nav-link-${id}`);
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test.describe("todas las rutas del mapa", () => {
  for (const id of ROUTE_IDS) {
    test(`${id} ${routeHref(id)}`, async ({ page }, info) => {
      const errors = trackErrors(page);
      const res = await page.goto(routeHref(id));
      expect(res?.status()).toBe(200);
      await expect(page.getByTestId(`zona-${ROUTES[id].zone}`)).toBeVisible();
      await expect(page.getByTestId(`pagina-${id}`)).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByTestId("demo-banner")).toHaveCount(0); // sin cintillo fijo (ADR-011)
      await expect(page.getByTestId("selector-rol")).toHaveCount(0); // el rol lo fija /ingresar
      const text = await page.locator("body").innerText();
      if (ROUTES[id].zone !== "admin") expect(text).not.toMatch(/rueda/i);
      // Sin desborde horizontal (390 y 1440).
      const width = info.project.name === "movil-390" ? 390 : 1440;
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("recorridos por clic", () => {
  test("inversionista: Landing → Ingresar → Panel → Proyectos → Ficha → Participar → Reservar → Portafolio", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await (await navLink(page, "login")).click();
    await expect(page).toHaveURL(/\/ingresar$/);
    await expect(page.getByTestId("pagina-login")).toBeVisible();

    await page.getByTestId("ingresar-correo").fill("persona@ejemplo.com");
    await page.getByTestId("ingresar-clave").fill("demo");
    await page.getByTestId("ingresar-entrar").click();
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByTestId("pagina-panel")).toBeVisible();

    await page.getByTestId("pagina-panel").getByRole("link", { name: "Ver proyectos" }).click();
    await expect(page).toHaveURL(/\/proyectos$/);
    await expect(page.getByTestId("pagina-p3")).toBeVisible();

    await page
      .getByTestId("pagina-p3")
      .locator('[data-testid="tarjeta-proyecto"][data-project-code="M2-006"]')
      .getByTestId("tarjeta-enlace")
      .click();
    await expect(page).toHaveURL(/\/proyectos\/m2-006-chacao$/);
    await expect(page.getByTestId("pagina-p4")).toBeVisible();

    await page.getByTestId("ficha-participar").click();
    await expect(page).toHaveURL(/\/proyectos\/m2-006-chacao\/participar$/);
    await expect(page.getByTestId("pagina-p5")).toBeVisible();

    await page.getByTestId("participar-aceptar-riesgos").click();
    await page.getByTestId("participar-reservar").click();
    await expect(page.getByTestId("participar-confirmacion")).toBeVisible();

    await page.getByTestId("participar-portafolio").click();
    await expect(page).toHaveURL(/\/portafolio$/);
    await expect(page.getByTestId("pagina-p6")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("operativo: Ingresar → Acceso del equipo → Admin → Obra → Finanzas → CRM", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/ingresar");
    await page.getByTestId("ingresar-equipo").click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByTestId("pagina-b1")).toBeVisible();

    await (await navLink(page, "b3")).click();
    await expect(page).toHaveURL(/\/admin\/proyectos\/[^/]+$/);
    await expect(page.getByTestId("pagina-b3")).toBeVisible();

    await (await navLink(page, "b5")).click();
    await expect(page).toHaveURL(/\/admin\/finanzas$/);
    await expect(page.getByTestId("pagina-b5")).toBeVisible();

    await (await navLink(page, "b6")).click();
    await expect(page).toHaveURL(/\/admin\/crm$/);
    await expect(page.getByTestId("pagina-b6")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
