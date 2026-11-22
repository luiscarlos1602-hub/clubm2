import { test, expect, type Page } from "@playwright/test";
import { LEGAL_COPY } from "../../src/shared/ui/brand/legal-copy";

const ORDER = ["M2-006", "M2-005", "M2-004", "M2-002", "M2-003", "M2-001"];
const norm = (s: string | null) => (s ?? "").replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

const p3 = (page: Page) => page.getByTestId("pagina-p3");
const cards = (page: Page) => p3(page).getByTestId("tarjeta-proyecto");
const card = (page: Page, code: string) => p3(page).locator(`[data-testid="tarjeta-proyecto"][data-project-code="${code}"]`);
const codes = async (page: Page) => cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-project-code")));

async function open(page: Page) {
  await page.goto("/proyectos");
  await expect(p3(page)).toBeVisible();
  await expect(cards(page)).toHaveCount(6);
}

async function pickLocation(page: Page, key: string) {
  await p3(page).getByTestId("filtro-ubicacion").click();
  await page.getByTestId(`filtro-ubicacion-${key}`).click();
}

test.describe("marketplace P3", () => {
  test("1 lista: 6 tarjetas en orden y un h1", async ({ page }) => {
    const errors = trackErrors(page);
    await open(page);
    await expect(p3(page).locator("h1")).toHaveCount(1);
    await expect(p3(page).getByTestId("marketplace-lista")).toBeVisible();
    expect(await codes(page)).toEqual(ORDER);
    expect(norm(await p3(page).getByTestId("marketplace-resultados").textContent())).toContain("6 proyectos");
    expect(errors).toEqual([]);
  });

  test("2 M2-007 ausente y sin vocabulario interno", async ({ page }) => {
    await open(page);
    await expect(p3(page).locator('[data-project-code="M2-007"]')).toHaveCount(0);
    const body = norm(await page.locator("body").innerText());
    expect(body).not.toContain("M2-007");
    expect(body).not.toContain("Dúplex Los Palos Grandes");
    expect(body).not.toMatch(/rueda|estancad|días sin vender/i);
  });

  test("3 tarjeta abierta M2-006", async ({ page }) => {
    await open(page);
    const c = card(page, "M2-006");
    expect(norm(await c.textContent())).toContain("Apartamento El Rosal");
    expect(norm(await c.getByTestId("tarjeta-ubicacion").textContent())).toBe("Caracas · Chacao");
    expect(norm(await c.getByTestId("tarjeta-etapa").textContent())).toBe("Abierto a participar");
    expect(norm(await c.getByTestId("tarjeta-disponibles").textContent())).toBe("Participaciones disponibles: 37 de 100");
    const precio = norm(await c.getByTestId("tarjeta-precio").textContent());
    expect(precio).toContain("Desde");
    expect(precio).toContain("USD 100");
    expect(norm(await c.getByTestId("tarjeta-plazo").textContent())).toContain("Plazo objetivo: 3 meses");
    await expect(c.getByTestId("projection-label")).toBeVisible();
    expect(norm(await c.getByTestId("projection-label").textContent())).toContain("Proyección · no garantizada");
    await expect(c.getByTestId("tarjeta-aviso-riesgo")).toHaveCount(0);
    await expect(c.getByTestId("tarjeta-imagen")).toHaveAttribute("data-variant", "proyeccion");
    expect(norm(await p3(page).getByTestId("marketplace-aviso-riesgo").textContent())).toContain(LEGAL_COPY.riskNotice);
  });

  test("4 M2-002 en venta sin tono de atención", async ({ page }) => {
    await open(page);
    const c = card(page, "M2-002");
    const etapa = c.getByTestId("tarjeta-etapa");
    expect(norm(await etapa.textContent())).toBe("En venta");
    const tone = await etapa.getAttribute("data-tone");
    expect(tone).not.toBe("attention");
    expect(norm(await c.getByTestId("tarjeta-disponibles").textContent())).toContain("0 de 100 · colocación cerrada");
  });

  test("5 finalizados son históricos sin proyección", async ({ page }) => {
    await open(page);
    for (const code of ["M2-001", "M2-003"]) {
      const c = card(page, code);
      expect(norm(await c.getByTestId("tarjeta-etapa").textContent())).toBe("Finalizado");
      expect(norm(await c.getByTestId("tarjeta-historico").textContent())).toContain("Liquidado el");
      await expect(c.getByTestId("projection-label")).toHaveCount(0);
    }
  });

  test("6 filtros de etapa", async ({ page }) => {
    const errors = trackErrors(page);
    await open(page);
    const cases: [string, string[]][] = [
      ["abiertos", ["M2-006"]],
      ["en-obra", ["M2-005"]],
      ["en-venta", ["M2-004", "M2-002"]],
      ["finalizados", ["M2-003", "M2-001"]],
      ["todas", ORDER],
    ];
    for (const [key, expected] of cases) {
      await p3(page).getByTestId(`filtro-etapa-${key}`).click();
      await expect(cards(page)).toHaveCount(expected.length);
      expect((await codes(page)).sort()).toEqual([...expected].sort());
    }
    expect(errors).toEqual([]);
  });

  test("7 filtro de ubicación y limpiar", async ({ page }) => {
    const errors = trackErrors(page);
    await open(page);
    await pickLocation(page, "valencia");
    await expect(cards(page)).toHaveCount(1);
    expect(await codes(page)).toEqual(["M2-004"]);
    await p3(page).getByTestId("filtro-ubicacion").click();
    await page.getByTestId("filtro-ubicacion-caracas-chacao").click();
    await expect(cards(page)).toHaveCount(2);
    expect((await codes(page)).sort()).toEqual(["M2-003", "M2-006"]);
    await p3(page).getByTestId("filtro-etapa-abiertos").click();
    await pickLocation(page, "valencia");
    await expect(p3(page).getByTestId("marketplace-vacio")).toBeVisible();
    await p3(page).getByTestId("marketplace-limpiar-filtros").click();
    await expect(cards(page)).toHaveCount(6);
    await expect(p3(page).getByTestId("filtro-etapa-todas")).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });

  test("8 tarjeta a ficha", async ({ page }) => {
    await open(page);
    await card(page, "M2-006").getByTestId("tarjeta-enlace").click();
    await expect(page).toHaveURL(/\/proyectos\/m2-006-chacao$/);
    await expect(page.getByTestId("pagina-p4")).toBeVisible();
  });

  test("9 reiniciar datos mantiene la lista", async ({ page }) => {
    await open(page);
    await page.getByTestId("demo-reset-button").click();
    await page.getByTestId("demo-reset-confirm").click();
    await expect(page.getByTestId("demo-reset-done")).toBeVisible();
    await expect(cards(page)).toHaveCount(6);
    expect(await codes(page)).toEqual(ORDER);
  });

  test("11 responsive", async ({ page }, info) => {
    await open(page);
    const width = () => page.evaluate(() => document.documentElement.scrollWidth);
    if (info.project.name === "movil-390") {
      expect(await width()).toBeLessThanOrEqual(390);
      await p3(page).getByTestId("filtro-ubicacion").click();
      await expect(page.getByTestId("filtro-ubicacion-valencia")).toBeVisible();
      expect(await width()).toBeLessThanOrEqual(390);
      await page.keyboard.press("Escape");
    } else {
      const ys: number[] = [];
      for (let i = 0; i < 3; i++) ys.push(Math.round((await cards(page).nth(i).boundingBox())!.y));
      expect(new Set(ys).size).toBe(1);
      const xs = [] as number[];
      for (let i = 0; i < 3; i++) xs.push(Math.round((await cards(page).nth(i).boundingBox())!.x));
      expect(new Set(xs).size).toBe(3);
    }
  });

  test("capturas", async ({ page }, info) => {
    await open(page);
    await page.screenshot({
      path: `docs/qa/P3/proyectos-${info.project.name === "movil-390" ? 390 : 1440}.png`,
      fullPage: true,
    });
  });
});
