import { test, expect, type Page } from "@playwright/test";

const KEY = "club-demo:v2";
const SLUG = "m2-008-los-palos-grandes";

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** Datos simulados limpios y rol del equipo. */
async function entrarComoEquipo(page: Page) {
  await page.goto("/ingresar");
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await page.reload();
  await page.getByTestId("ingresar-equipo").click();
  await expect(page).toHaveURL(/\/admin$/);
}

const siguiente = (page: Page) => page.getByTestId("ficha-siguiente").click();
const f = (page: Page, name: string, value: string) => page.getByTestId(`ficha-${name}`).fill(value);

async function pasoInmueble(page: Page) {
  await expect(page.getByTestId("ficha-paso-1")).toBeVisible();
  await f(page, "name", "Apartamento de prueba");
  await f(page, "city", "Caracas");
  await f(page, "zone", "Los Palos Grandes");
  await f(page, "areaM2", "90");
  await f(page, "acquiredOn", "2025-06-10");
  await f(page, "description", "Apartamento luminoso listo para reformar.");
  await f(page, "highlights", "Tres habitaciones\nBalcón amplio");
  await siguiente(page);
}

async function pasoEconomia(page: Page, recovery = "10000") {
  await expect(page.getByTestId("ficha-paso-2")).toBeVisible();
  await f(page, "acquisitionCost", "80000");
  await f(page, "recoveryBudget", recovery);
  await f(page, "targetSalePrice", "130000");
  await f(page, "estimatedSaleCosts", "8000");
  await siguiente(page);
}

async function pasoPresupuesto(page: Page) {
  await expect(page.getByTestId("ficha-paso-3")).toBeVisible();
  const rubros = { kitchen: "3000", bathrooms: "2000", floors_paint: "1500", electrical_plumbing: "1500", garden_exterior: "500", carpentry: "500", management_fee: "500", contingency: "300", reserve: "200" };
  for (const [item, value] of Object.entries(rubros)) await f(page, `budget.${item}`, value);
  await siguiente(page);
}

async function pasoClase(page: Page, price = "100") {
  await expect(page.getByTestId("ficha-paso-4")).toBeVisible();
  await f(page, "classTotal", "100");
  await f(page, "classUnitPrice", price);
  await siguiente(page);
}

async function pasoRiesgosProceso(page: Page) {
  await expect(page.getByTestId("ficha-paso-5")).toBeVisible();
  const dias = ["15", "60", "90", "100", "110", "150"];
  const etapas = ["works_start", "works_50", "works_80", "sale_start", "on_sale", "sold"];
  for (const [i, etapa] of etapas.entries()) await f(page, `steps.${etapa}`, dias[i]!);
  await siguiente(page);
}

async function pasoImagenes(page: Page) {
  await expect(page.getByTestId("ficha-paso-6")).toBeVisible();
  await page.getByTestId("ficha-imagen-before-0").click();
  await page.getByTestId("ficha-imagen-after-0").click();
  await page.getByTestId("ficha-imagen-projection-0").click();
  await siguiente(page);
}

test.describe("W-2 · alta y edición de inmueble", () => {
  test("crear en colocación → aparece en el listado y en Proyectos → editar → persiste", async ({ page }) => {
    const errors = trackErrors(page);
    await entrarComoEquipo(page);

    await page.goto("/admin/proyectos");
    await expect(page.getByTestId("admin-proyectos-lista")).toBeVisible();
    await expect(page.getByTestId("admin-proyectos-fila-M2-008")).toHaveCount(0);
    await page.getByTestId("admin-proyectos-nuevo").click();
    await expect(page).toHaveURL(/\/admin\/proyectos\/nuevo$/);

    await pasoInmueble(page);
    await pasoEconomia(page);
    await pasoPresupuesto(page);
    await pasoClase(page);
    await pasoRiesgosProceso(page);
    await pasoImagenes(page);
    await expect(page.getByTestId("ficha-paso-7")).toBeVisible();
    await page.getByTestId("ficha-guardar").click();

    await expect(page).toHaveURL(/\/admin\/proyectos$/);
    await expect(page.getByTestId("admin-proyectos-fila-M2-008")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("admin-proyectos-fila-M2-008")).toContainText("Apartamento de prueba");

    // Visible en la cara pública, con la tarjeta y la galería de SU inmueble.
    await page.goto("/proyectos");
    const tarjeta = page.locator('[data-testid="tarjeta-proyecto"][data-project-code="M2-008"]');
    await expect(tarjeta).toBeVisible();
    await tarjeta.getByTestId("tarjeta-enlace").click();
    await expect(page).toHaveURL(new RegExp(`/proyectos/${SLUG}$`));
    await expect(page.getByTestId("ficha-galeria")).toBeVisible();
    await expect(page.getByTestId("ficha-galeria").locator("img").first()).toHaveAttribute("src", /./);

    // Editar el nombre.
    await page.goto("/admin/proyectos");
    await page.getByTestId("admin-proyecto-editar-M2-008").click();
    await expect(page).toHaveURL(new RegExp(`/admin/proyectos/${SLUG}/editar$`));
    await expect(page.getByTestId("ficha-name")).toHaveValue("Apartamento de prueba");
    await f(page, "name", "Apartamento renombrado");
    for (let i = 0; i < 6; i++) await siguiente(page);
    await expect(page.getByTestId("ficha-paso-7")).toBeVisible();
    await page.getByTestId("ficha-guardar").click();
    await expect(page).toHaveURL(/\/admin\/proyectos$/);
    await expect(page.getByTestId("admin-proyectos-fila-M2-008")).toContainText("Apartamento renombrado");
    await page.reload();
    await expect(page.getByTestId("admin-proyectos-fila-M2-008")).toContainText("Apartamento renombrado");
    await expect(page.getByTestId("admin-proyectos-fila-M2-008")).toHaveCount(1);

    expect(errors).toEqual([]);
  });

  test("F distinta de total × precio muestra el error junto al campo", async ({ page }) => {
    await entrarComoEquipo(page);
    await page.goto("/admin/proyectos/nuevo");
    await pasoInmueble(page);
    await pasoEconomia(page, "10000");
    await pasoPresupuesto(page);
    await expect(page.getByTestId("ficha-paso-4")).toBeVisible();
    await f(page, "classTotal", "100");
    await f(page, "classUnitPrice", "90");
    await siguiente(page);
    await expect(page.getByTestId("ficha-paso-4")).toBeVisible();
    await expect(page.getByTestId("ficha-error-economics.recoveryBudget")).toBeVisible();
    await expect(page.getByTestId("ficha-f-esperada")).toBeVisible();
  });

  test("publicar sin imágenes de antes y proyección bloquea el paso con el error junto al campo", async ({ page }) => {
    await entrarComoEquipo(page);
    await page.goto("/admin/proyectos/nuevo");
    await pasoInmueble(page);
    await pasoEconomia(page);
    await pasoPresupuesto(page);
    await pasoClase(page);
    await pasoRiesgosProceso(page);
    await expect(page.getByTestId("ficha-paso-6")).toBeVisible();
    await siguiente(page); // sin elegir ninguna imagen
    await expect(page.getByTestId("ficha-paso-6")).toBeVisible();
    await expect(page.getByTestId("ficha-error-images")).toBeVisible();
    await page.getByTestId("ficha-atras").click();
    await expect(page.getByTestId("ficha-paso-5")).toBeVisible();
  });
});
