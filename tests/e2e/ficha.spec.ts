import { expect, test, type Locator, type Page } from "@playwright/test";
import { LEGAL_COPY } from "../../src/shared/ui/brand/legal-copy";

/** Normaliza NBSP y el signo menos tipográfico (U+2212) antes de comparar. */
const norm = (text: string | null) => (text ?? "").replace(/[\u00a0\u202f]/g, " ").replace(/\u2212/g, "-").replace(/\s+/g, " ").trim();
async function text(locator: Locator): Promise<string> {
  return norm(await locator.textContent());
}
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}


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

  test("desde Proyectos: la tarjeta de M2-006 lleva a su ficha, con un solo h1", async ({ page }) => {
    await page.goto("/proyectos");
    await page.locator('[data-testid="tarjeta-proyecto"][data-project-code="M2-006"]').getByTestId("tarjeta-enlace").click();
    await expect(page).toHaveURL(/\/proyectos\/m2-006-chacao$/);
    await expect(page.getByTestId("pagina-p4")).toBeVisible();
    await expect(page.getByTestId("pagina-p4").locator("h1")).toHaveCount(1);
  });

  test("M2-006: cifras del motor, presupuesto y descargo", async ({ page }) => {
    await page.goto("/proyectos/m2-006-chacao");
    const ganancia = page.getByTestId("simulador-ganancia");
    await expect(ganancia).toBeVisible();
    expect(await text(ganancia)).toContain("USD 34,30");
    expect(await text(ganancia)).toContain("34,3 % sobre el capital");
    expect(await text(page.getByTestId("escenario-conservative-ganancia"))).toContain("USD 10,30");
    expect(await text(page.getByTestId("escenario-base-ganancia"))).toContain("USD 34,30");
    expect(await text(page.getByTestId("presupuesto-total"))).toContain("USD 62.280");
    expect(await text(page.getByTestId("simulador-descargo"))).toBe(norm(LEGAL_COPY.simulatorDisclaimer));
    expect(await page.getByTestId("presupuesto-obra").locator("li").count()).toBe(4);
    expect(await page.getByTestId("presupuesto-honorarios").locator("li").count()).toBe(3);
  });

  test("pruebas de estrés", async ({ page }) => {
    await page.goto("/proyectos/m2-006-chacao");
    await expect(page.getByTestId("simulador-preset-base")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("simulador-preset-works-20")).toHaveCount(0);
    await expect(page.getByTestId("simulador-preset-works-50")).toHaveCount(0);

    await page.getByTestId("simulador-preset-sale-20").click();
    await expect(page.getByTestId("simulador-sin-reparto")).toBeVisible();
    await expect(page.getByTestId("simulador-cobro")).toHaveCount(0);

    await page.getByTestId("simulador-preset-delay-6").click();
    await expect(page.getByTestId("simulador-plazo")).toContainText("9 meses");
    expect(await text(page.getByTestId("simulador-ganancia"))).toContain("USD 34,30");

    await page.getByTestId("simulador-preset-placement-0").click();
    await expect(page.getByTestId("simulador-sin-colocacion")).toBeVisible();

    await page.getByTestId("simulador-preset-base").click();
    await expect(page.getByTestId("simulador-preset-base")).toHaveAttribute("aria-pressed", "true");
    expect(await text(page.getByTestId("simulador-ganancia"))).toContain("USD 34,30");
  });

  test("controles accesibles: rango de participaciones y resultado en vivo", async ({ page }) => {
    await page.goto("/proyectos/m2-006-chacao");
    await expect(page.getByTestId("simulador-participaciones")).toHaveAttribute("max", "20");
    await expect(page.getByTestId("simulador-participaciones")).toHaveAttribute("min", "1");
    await expect(page.getByTestId("simulador-resultado-vivo")).toHaveAttribute("aria-live", "polite");
  });

  test("M2-003 finalizado: ganancia realizada de USD 34,50", async ({ page }) => {
    await page.goto("/proyectos/m2-003-chacao");
    const ganancia = page.getByTestId("realizado-ganancia");
    await expect(ganancia).toBeVisible();
    expect(await text(ganancia)).toContain("USD 34,50");
    expect(await text(ganancia)).toContain("34,5 %");
    await expect(page.getByTestId("seccion-simulador")).toHaveCount(0);
    await expect(page.getByTestId("seccion-escenarios")).toHaveCount(0);
  });

  test("slugs sin ficha: no encontrada dentro del shell; formato inválido, página not-found", async ({ page }) => {
    for (const slug of ["m2-007-palos-grandes", "no-existe"]) {
      await page.goto(`/proyectos/${slug}`);
      await expect(page.getByTestId("ficha-no-encontrada")).toBeVisible();
      await expect(page.getByTestId("zona-investor")).toBeVisible();
      expect(await page.locator("body").innerText()).not.toContain("Dúplex Los Palos Grandes");
    }
    // La página not-found de Next se emite en streaming (respuesta 200 con la ficha en Suspense): se comprueba lo que se ve.
    await page.goto("/proyectos/M2_RARO");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByTestId("pagina-p4")).toHaveCount(0);
    await expect(page.getByTestId("ficha-no-encontrada")).toHaveCount(0);
  });

  test("Participar: estimación de 1 participación y reinicio de datos", async ({ page }) => {
    await page.goto("/proyectos/m2-006-chacao/participar");
    const ganancia = page.getByTestId("participar-ganancia");
    await expect(ganancia).toBeVisible();
    expect(await text(ganancia)).toContain("USD 34,30");

    await page.goto("/proyectos/m2-006-chacao");
    await page.getByTestId("demo-reset-button").click();
    await page.getByTestId("demo-reset-confirm").click();
    await expect(page.getByTestId("demo-reset-done")).toBeVisible();
    expect(await text(page.getByTestId("ficha-disponibles"))).toContain("37 de 100");
  });

  test("sin errores de consola, sin lenguaje de ruedas y sin desborde horizontal", async ({ page }, testInfo) => {
    const errors = trackErrors(page);
    for (const slug of ["m2-006-chacao", "m2-005-el-paraiso", "m2-003-chacao"]) {
      await page.goto(`/proyectos/${slug}`);
      await expect(page.getByTestId("pagina-p4")).toBeVisible();
      expect(await page.locator("body").innerText()).not.toMatch(/rueda|estancad|días sin vender/i);
      const width = testInfo.project.use.viewport?.width ?? 1440;
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    expect(errors).toEqual([]);
  });
});
