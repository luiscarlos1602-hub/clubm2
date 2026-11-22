import { test, expect, type Page } from "@playwright/test";

const KEY = "club-demo:v2";
const SLUG = "m2-004-el-vinedo";

/** Datos simulados limpios y rol del equipo. */
async function entrarComoEquipo(page: Page) {
  await page.goto("/ingresar");
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await page.reload();
  await page.getByTestId("ingresar-equipo").click();
  await expect(page).toHaveURL(/\/admin$/);
}

const vis = (page: Page, id: string) => page.locator(`[data-testid="${id}"]:visible`);
const text = async (page: Page, id: string) => (await vis(page, id).innerText()).replace(/\s+/g, " ");

test.describe("venta y liquidación con pérdida (W-5)", () => {
  test("registrar venta, liquidar, recargar y ver el resultado realizado en la ficha", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    await entrarComoEquipo(page);

    // B4 · registrar la venta de M2-004 (on_sale): P 47.000 · O 1.000 · fecha de hoy (valor por defecto)
    await page.goto("/admin/comercializacion");
    const select = vis(page, "venta-proyecto");
    await expect(select).toBeVisible();
    const value = await select.locator("option", { hasText: "M2-004" }).getAttribute("value");
    await select.selectOption(value as string);
    await vis(page, "venta-precio").fill("47000");
    await vis(page, "venta-costos").fill("1000");
    await vis(page, "venta-registrar").click();
    await expect(vis(page, "venta-exito")).toBeVisible();
    await expect(vis(page, "venta-error")).toHaveCount(0);

    // B5 · vista previa y liquidar
    await page.goto("/admin/finanzas");
    await vis(page, "finanzas-selector").selectOption("M2-004");
    await expect(vis(page, "finanzas-vista-previa")).toBeVisible();
    await expect(vis(page, "finanzas-base")).toContainText(/por liquidar/i);
    await vis(page, "finanzas-liquidar").click();
    await expect(vis(page, "finanzas-ya-liquidado")).toBeVisible();

    // Sobrevive a recargar
    await page.reload();
    await vis(page, "finanzas-selector").selectOption("M2-004");
    await expect(vis(page, "finanzas-ya-liquidado")).toBeVisible();
    await expect(vis(page, "finanzas-titular-base")).toContainText(/realizado/i);
    expect(await text(page, "finanzas-titular-perdida")).toMatch(/USD\s*5(,00)?(?!\d)/);
    expect(await text(page, "finanzas-titular-capital-devuelto")).toMatch(/USD\s*95(,00)?(?!\d)/);

    // Ficha pública
    await page.goto(`/proyectos/${SLUG}`);
    await expect(page.getByTestId("seccion-resultado-realizado")).toBeVisible();
    expect(await text(page, "realizado-capital-devuelto")).toMatch(/USD\s*95(,00)?(?!\d)/);
    expect(await text(page, "realizado-perdida")).toMatch(/USD\s*5(,00)?(?!\d)/);

    expect(errors).toEqual([]);
  });
});
