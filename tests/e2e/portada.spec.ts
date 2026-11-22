import { test, expect } from "@playwright/test";
import { LEGAL_COPY } from "../../src/shared/ui/brand/legal-copy";

test.describe("portada P1", () => {
  test("muestra las secciones, el reparto y los riesgos", async ({ page }) => {
    await page.goto("/");
    const p1 = page.getByTestId("pagina-p1");
    for (const id of ["hero", "pilares", "como-funciona", "reparto", "participacion-riesgos", "comunidad", "preguntas", "cierre"]) {
      await expect(p1.getByTestId(`portada-${id}`)).toBeVisible();
    }
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(p1.getByTestId("portada-reparto")).toContainText("25 %");
    await expect(p1.getByTestId("portada-reparto")).toContainText("75 %");
    await expect(p1.getByTestId("portada-riesgos")).toContainText(LEGAL_COPY.riskNotice);
    expect(await page.locator("body").innerText()).not.toMatch(/rueda|garantizamos|garantizad[oa]/i); // "No se garantiza…" (negación) sí está permitido
  });

  test("los CTA llevan a la vista previa del registro y a proyectos", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("cta-proyectos").click();
    await expect(page).toHaveURL(/\/proyectos$/);
    await page.goto("/");
    await page.getByTestId("cta-registro-cierre").click();
    await expect(page).toHaveURL(/\/registro$/);
  });

  test("las preguntas se abren con teclado", async ({ page }) => {
    await page.goto("/");
    const first = page.getByTestId("portada-preguntas").locator("summary").first();
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("portada-preguntas").locator("details").first()).toHaveAttribute("open", "");
  });
});
