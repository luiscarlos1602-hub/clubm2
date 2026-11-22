import { test, expect } from "@playwright/test";

async function entrarComoEquipo(page: import("@playwright/test").Page) {
  await page.goto("/ingresar");
  await page.getByTestId("ingresar-equipo").click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("backoffice: menú y detalles", () => {
  test("el menú lateral se pliega a solo iconos y se despliega", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-1440", "solo desktop");
    await entrarComoEquipo(page);
    const sidebar = page.getByTestId("admin-sidebar");
    const toggle = page.getByTestId("admin-sidebar-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("nav-link-b2")).toContainText("Adquisiciones");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toHaveAttribute("data-collapsed", "true");
    await expect(page.getByTestId("nav-link-b2")).toHaveAttribute("aria-label", /Adquisiciones/);
    await expect(page.getByTestId("nav-link-b2")).not.toContainText("Adquisiciones");
    await page.getByTestId("nav-link-b2").hover();
    await expect(page.getByRole("tooltip").first()).toContainText("Adquisiciones");
    await page.getByTestId("nav-link-b2").click();
    await expect(page).toHaveURL(/\/admin\/adquisiciones$/);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("nav-link-b2")).toContainText("Adquisiciones");
  });

  test("el pie del shell enlaza a Términos y condiciones", async ({ page }) => {
    await entrarComoEquipo(page);
    await expect(page.getByTestId("zona-admin").getByTestId("pie-terminos")).toHaveAttribute("href", "/terminos");
  });

  test("kanban → detalle de oportunidad → registrar la compra sobrevive a recargar", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await entrarComoEquipo(page);
    await page.goto("/admin/adquisiciones");
    await expect(page.getByTestId("columna-due-diligence").getByTestId("oportunidad-M2-007")).toBeVisible();
    await page.getByTestId("oportunidad-ver-M2-007").click();
    // Espera por el estado visible del detalle, no por la URL tras el clic.
    const detalle = page.getByTestId("pagina-b2-detalle");
    await expect(detalle.getByTestId("adq-detalle-inmueble")).toBeVisible();
    await expect(detalle.getByTestId("adq-detalle-galeria")).toBeVisible();
    await expect(detalle.getByTestId("adq-detalle-checklist")).toBeVisible();
    await expect(detalle.getByTestId("adq-detalle-cifras")).toBeVisible();
    const etapa = page.getByTestId("admin-adq-detalle-cabecera").getByTestId("admin-etapa");
    await expect(etapa).toHaveText("Due diligence");

    await page.getByTestId("adq-detalle-decision-acquired").click();
    await expect(etapa).toHaveText("Comprado");
    await expect(page.getByTestId("adq-detalle-anuncio")).toHaveText("Etapa actualizada: Comprado.");
    await expect(page.locator("#adq-decision-h")).toBeFocused();
    await expect(page.getByTestId("adq-detalle-abrir-proyecto")).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("admin-adq-detalle-cabecera").getByTestId("admin-etapa")).toHaveText("Comprado");

    await page.getByTestId("adq-detalle-volver").click();
    await expect(page.getByTestId("columna-comprado").getByTestId("oportunidad-M2-007")).toBeVisible();
    await expect(page.getByTestId("columna-due-diligence")).toContainText("Sin oportunidades");
    expect(errors).toEqual([]);
  });

  test("descartar una oportunidad pide confirmación y la mueve a Descartado", async ({ page }) => {
    await entrarComoEquipo(page);
    await page.goto("/admin/adquisiciones/m2-007-palos-grandes");
    await page.getByTestId("adq-detalle-decision-discarded").click();
    await page.getByTestId("adq-detalle-decision-confirmar-descarte").click();
    await expect(page.getByTestId("admin-adq-detalle-cabecera").getByTestId("admin-etapa")).toHaveText("Descartado");
    await page.goto("/admin/adquisiciones");
    await expect(page.getByTestId("columna-descartado").getByTestId("oportunidad-M2-007")).toBeVisible();
  });

  test("obra: poner en venta se guarda y la ficha pública lo refleja tras recargar", async ({ page }) => {
    await entrarComoEquipo(page);
    await page.goto("/admin/proyectos/m2-005-el-paraiso");
    const resumen = page.getByTestId("admin-obra-resumen");
    await expect(resumen.getByTestId("admin-etapa")).toHaveText("En obra");
    await page.getByTestId("obra-etapa-on_sale").click();
    await expect(page.getByTestId("obra-etapa-estado")).toContainText("En venta");
    await page.reload();
    await expect(page.getByTestId("admin-obra-resumen").getByTestId("admin-etapa")).toHaveText("En venta");
    await expect(page.getByTestId("obra-etapa")).toContainText("Comercialización");
    await page.goto("/proyectos");
    const tarjeta = page.getByTestId("pagina-p3").locator('[data-testid="tarjeta-proyecto"][data-project-code="M2-005"]');
    await expect(tarjeta.getByTestId("tarjeta-etapa")).toHaveText("En venta");
  });

  test("publicar una compra sin la ficha completa avisa y enlaza a la ficha", async ({ page }) => {
    await entrarComoEquipo(page);
    await page.goto("/admin/adquisiciones/m2-007-palos-grandes");
    await page.getByTestId("adq-detalle-decision-acquired").click();
    await expect(page.getByTestId("admin-adq-detalle-cabecera").getByTestId("admin-etapa")).toHaveText("Comprado");
    await page.getByTestId("adq-detalle-abrir-proyecto").click();
    await page.getByTestId("obra-etapa-funding").click();
    await expect(page.getByTestId("obra-etapa-estado")).toContainText("Para publicar, la ficha debe tener");
    await expect(page.getByTestId("obra-etapa-completar")).toHaveAttribute("href", /m2-007-palos-grandes/);
    await expect(page.getByTestId("admin-obra-resumen").getByTestId("admin-etapa")).toHaveText("Comprado");
  });

  test("detalle de proyecto con gráficas, proceso e inversionistas", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await entrarComoEquipo(page);
    await page.goto("/admin/proyectos/m2-006-chacao");
    await expect(page.getByTestId("obra-galeria")).toBeVisible();
    await expect(page.getByTestId("obra-grafica-colocacion")).toBeVisible();
    await expect(page.getByTestId("obra-grafica-presupuesto")).toBeVisible();
    await expect(page.getByTestId("obra-proceso")).toBeVisible();
    await expect(page.getByTestId("obra-inversionistas")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
