import { expect, test } from "@playwright/test";

test.describe("ficha de proyecto (ADR-013)", () => {
  test("abierto: galería, % junto a la ganancia, simulador y tablero de proceso", async ({ page }) => {
    await page.goto("/proyectos/m2-006-chacao");
    await expect(page.getByTestId("pagina-p4")).toBeVisible();
    await expect(page.getByTestId("ficha-galeria")).toBeVisible();
    await expect(page.getByTestId("seccion-simulador")).toBeVisible();
    await expect(page.getByTestId("simulador-ganancia")).toContainText("sobre el capital");
    await expect(page.getByTestId("escenario-base-ganancia")).toContainText("sobre el capital");
    await expect(page.getByTestId("ficha-proceso")).toBeVisible();
  });

  test("en venta: sin simulador, con escenarios fijos y proceso", async ({ page }) => {
    await page.goto("/proyectos/m2-002-el-hatillo");
    await expect(page.getByTestId("pagina-p4")).toBeVisible();
    await expect(page.getByTestId("seccion-simulador")).toHaveCount(0);
    await expect(page.getByTestId("seccion-escenarios")).toBeVisible();
    await expect(page.getByTestId("ficha-proceso")).toBeVisible();
  });

  test("finalizado: resultado realizado con su %, sin simulador", async ({ page }) => {
    await page.goto("/proyectos/m2-001-palos-grandes");
    await expect(page.getByTestId("seccion-resultado-realizado")).toBeVisible();
    await expect(page.getByTestId("realizado-ganancia")).toContainText("sobre el capital");
    await expect(page.getByTestId("seccion-simulador")).toHaveCount(0);
  });
});
