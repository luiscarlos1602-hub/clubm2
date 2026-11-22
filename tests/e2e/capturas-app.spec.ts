import { test } from "@playwright/test";

test.skip(!process.env.CAPTURAS, "Solo con CAPTURAS=1 (pnpm capturas)");

const RUTAS: Array<[string, string]> = [["inicio", "/"], ["proyectos", "/proyectos"], ["admin", "/admin"]];

test.describe("capturas F1-5", () => {
  for (const [nombre, url] of RUTAS) {
    test(`captura ${nombre}`, async ({ page }, info) => {
      const ancho = info.project.name === "movil-390" ? 390 : 1440;
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `docs/qa/F1/app-${nombre}-${ancho}.png`, fullPage: true });
    });
  }
});
