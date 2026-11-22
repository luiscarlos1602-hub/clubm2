import { test, type Page } from "@playwright/test";

test.skip(!process.env.CAPTURAS, "Solo con CAPTURAS=1");

/** Recorrido de la maqueta (ADR-012) con una captura por pantalla en docs/qa/maqueta/. */
test("capturas de la maqueta", async ({ page }, info) => {
  test.setTimeout(120_000);
  const ancho = info.project.name === "movil-390" ? 390 : 1440;
  const shot = async (p: Page, nombre: string) => {
    await p.waitForLoadState("networkidle");
    await p.screenshot({ path: `docs/qa/maqueta/${nombre}-${ancho}.png`, fullPage: true });
  };

  await page.goto("/");
  await shot(page, "inicio");
  await page.goto("/ingresar");
  await shot(page, "ingresar");
  await page.getByTestId("ingresar-correo").fill("persona@ejemplo.com");
  await page.getByTestId("ingresar-clave").fill("demo");
  await page.getByTestId("ingresar-entrar").click();
  await page.getByTestId("pagina-panel").waitFor();
  await shot(page, "panel");
  await page.goto("/proyectos");
  await page.getByTestId("pagina-p3").waitFor();
  await shot(page, "proyectos");
  await page.goto("/proyectos/m2-006-chacao");
  await page.getByTestId("pagina-p4").waitFor();
  await shot(page, "ficha");
  await page.goto("/proyectos/m2-006-chacao/participar");
  await page.getByTestId("pagina-p5").waitFor();
  await shot(page, "participar");
  await page.goto("/portafolio");
  await page.getByTestId("pagina-p6").waitFor();
  await shot(page, "portafolio");
  await page.goto("/ingresar");
  await page.getByTestId("ingresar-equipo").click();
  await page.getByTestId("pagina-b1").waitFor();
  await shot(page, "admin");
  await page.goto("/admin/finanzas");
  await page.getByTestId("pagina-b5").waitFor();
  await shot(page, "admin-finanzas");
});
