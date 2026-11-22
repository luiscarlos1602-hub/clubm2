import { test, expect } from "@playwright/test";

test.describe("ajustes de maqueta · paquete III", () => {
  test("agendar visita a obra desde el panel: confirma sin guardar nada", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByTestId("panel-participacion-m2-005")).toBeVisible();
    await expect(page.getByTestId("visita-abrir-m2-003")).toHaveCount(0); // liquidado: sin obra
    await page.getByTestId("visita-abrir-m2-005").click();
    await page.getByTestId("visita-fecha-m2-005").fill("2026-12-10");
    await page.getByTestId("visita-franja-m2-005-tarde").check();
    await page.getByTestId("visita-enviar-m2-005").click();
    await expect(page.getByTestId("visita-confirmacion-m2-005")).toContainText("El equipo te contactará para confirmar la visita");
  });

  test("portafolio: % junto a la ganancia y proceso por participación", async ({ page }) => {
    await page.goto("/portafolio");
    await expect(page.getByTestId("portafolio-total-realizada-porcentaje")).toContainText("34,5 %");
    await expect(page.getByTestId("portafolio-fila-m2-003-porcentaje")).toContainText("34,5 %");
    await expect(page.getByTestId("portafolio-procesos")).toBeVisible();
    await page.getByTestId("visita-abrir-m2-006").click();
    await expect(page.getByTestId("visita-formulario-m2-006")).toBeVisible();
  });

  test("/terminos es pública, con riesgos, y el registro la enlaza y la pide", async ({ page }) => {
    await page.goto("/terminos");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("terminos-riesgos")).toContainText("Puedes perder parte o la totalidad de tu aporte");
    await expect(page.getByTestId("aviso-legal-placeholder")).toBeVisible();

    await page.goto("/registro");
    await page.getByTestId("registro-continuar").click();
    await page.getByTestId("registro-continuar").click();
    await expect(page.getByTestId("registro-terminos-enlace")).toHaveAttribute("href", "/terminos");
    for (const id of ["perdida", "proyeccion", "plazo", "participacion"]) await page.getByTestId(`registro-riesgo-${id}`).check();
    await expect(page.getByTestId("registro-continuar")).toBeDisabled();
    await page.getByTestId("registro-terminos").check();
    await expect(page.getByTestId("registro-continuar")).toBeEnabled();
  });
});
