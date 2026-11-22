import { test, expect } from "@playwright/test";
import { brand } from "../../src/shared/config/brand";
import { LEGAL_COPY } from "../../src/shared/ui/brand/legal-copy";

test.describe("/sistema", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sistema");
  });

  test("sin console.error durante la carga", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("banner fijo de demo al inicio", async ({ page }) => {
    await expect(page.getByTestId("demo-banner-fijo")).toHaveText(LEGAL_COPY.demoBanner);
  });

  test("muestra la página y sus ocho secciones", async ({ page }) => {
    await expect(page.getByTestId("sistema-page")).toBeVisible();
    for (const id of [
      "sistema-paleta",
      "sistema-tipografia",
      "sistema-botones",
      "sistema-badges",
      "sistema-tarjeta-proyecto",
      "sistema-cifras",
      "sistema-avisos",
      "sistema-estados",
    ]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
  });

  test("paleta con los siete colores y su HEX", async ({ page }) => {
    for (const c of brand.palette) {
      const swatch = page.getByTestId(`swatch-${c.token}`);
      await expect(swatch).toBeVisible();
      await expect(swatch).toContainText(c.hex, { ignoreCase: true });
    }
  });

  test("cifras: solo la proyección lleva etiqueta", async ({ page }) => {
    await expect(page.getByTestId("cifra-capital")).toBeVisible();
    await expect(page.getByTestId("cifra-realizado")).toBeVisible();
    const proy = page.getByTestId("cifra-proyeccion");
    await expect(proy).toBeVisible();
    await expect(proy.getByTestId("projection-label")).toHaveText(LEGAL_COPY.projectionTag);
    await expect(page.getByTestId("cifra-capital").getByTestId("projection-label")).toHaveCount(0);
    await expect(page.getByTestId("cifra-realizado").getByTestId("projection-label")).toHaveCount(
      0,
    );
    await expect(page.getByTestId("cifra-capital")).toHaveText(/USD\s*\d{1,3}(\.\d{3})+/);
  });

  test("tarjeta de proyecto con sello e insignia", async ({ page }) => {
    const card = page.getByTestId("sistema-tarjeta-proyecto");
    await expect(card.getByTestId("project-seal")).toContainText("M2-001");
    await expect(card.getByTestId("status-badge").first()).toBeVisible();
  });

  test("avisos legales literales", async ({ page }) => {
    await expect(page.getByTestId("aviso-demo-banner")).toHaveText(LEGAL_COPY.demoBanner);
    await expect(page.getByTestId("aviso-simulator-disclaimer")).toHaveText(
      LEGAL_COPY.simulatorDisclaimer,
    );
    await expect(page.getByTestId("aviso-risk-notice")).toHaveText(LEGAL_COPY.riskNotice);
    await expect(page.getByTestId("demo-banner").first()).toBeVisible();
  });

  test("estados vacío, carga y error", async ({ page }) => {
    await expect(page.getByTestId("estado-vacio").getByTestId("empty-state")).toBeVisible();
    await expect(page.getByTestId("estado-carga").getByTestId("skeleton-card")).toBeVisible();
    await expect(page.getByTestId("estado-error").getByTestId("error-state")).toHaveAttribute(
      "role",
      "alert",
    );
  });

  test("marca: wordmark con aria-label", async ({ page }) => {
    const w = page.getByTestId("wordmark").first();
    await expect(w).toBeVisible();
    await expect(w).toHaveAttribute("aria-label", `${brand.name}. ${brand.tagline}`);
  });

  test("cumplimiento: lang, noindex y sin ruedas", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const text = await page.getByTestId("sistema-page").innerText();
    expect(text).not.toMatch(/rueda/i);
  });

  test("sin desplazamiento horizontal en móvil", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "movil-390");
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(w).toBeLessThanOrEqual(390);
  });
});
