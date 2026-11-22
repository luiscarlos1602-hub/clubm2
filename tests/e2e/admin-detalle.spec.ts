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

  test("kanban → detalle de oportunidad", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await entrarComoEquipo(page);
    await page.goto("/admin/adquisiciones");
    await page.getByTestId("oportunidad-ver-OP-015").click();
    await expect(page).toHaveURL(/\/admin\/adquisiciones\/OP-015$/);
    await expect(page.getByTestId("pagina-b2-detalle")).toBeVisible();
    await expect(page.getByTestId("adq-detalle-galeria")).toBeVisible();
    await expect(page.getByTestId("adq-detalle-inmueble")).toBeVisible();
    await expect(page.getByTestId("adq-detalle-checklist")).toBeVisible();
    await expect(page.getByTestId("adq-detalle-cifras")).toBeVisible();
    await page.getByTestId("adq-detalle-avanzar").click();
    await expect(page.getByTestId("adq-detalle-avanzar-confirmacion")).toBeVisible();
    await page.getByTestId("adq-detalle-volver").click();
    await expect(page).toHaveURL(/\/admin\/adquisiciones$/);
    expect(errors).toEqual([]);
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
