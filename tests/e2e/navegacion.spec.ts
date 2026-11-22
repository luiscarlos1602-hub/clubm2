import { test, expect } from "@playwright/test";

test.describe("navegación", () => {
  test("desktop: enlaces y aria-current", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-1440", "solo desktop");
    await page.goto("/proyectos");
    await expect(page.getByTestId("nav-principal")).toBeVisible();
    await page.getByTestId("nav-principal").getByTestId("nav-link-p6").click();
    await expect(page).toHaveURL(/\/portafolio$/);
    await expect(page.getByTestId("nav-principal").getByTestId("nav-link-p6")).toHaveAttribute("aria-current", "page");
    await page.goto("/admin/crm");
    await expect(page.getByTestId("nav-principal")).toBeVisible();
    await expect(page.getByTestId("nav-principal").getByTestId("nav-link-b6")).toHaveAttribute("aria-current", "page");
  });

  test("móvil: menú Sheet", async ({ page }, info) => {
    test.skip(info.project.name !== "movil-390", "solo móvil");
    for (const [start, link, dest] of [
      ["/proyectos", "nav-link-p6", /\/portafolio$/],
      ["/admin", "nav-link-b4", /\/admin\/comercializacion$/],
    ] as const) {
      await page.goto(start);
      await expect(page.getByTestId("nav-principal")).toBeHidden();
      await expect(page.getByTestId("nav-movil-abrir")).toBeVisible();
      await page.getByTestId("nav-movil-abrir").click();
      await page.getByTestId("nav-movil").getByTestId(link).click();
      await expect(page).toHaveURL(dest);
      await expect(page.getByTestId("nav-movil")).toBeHidden();
    }
  });

  test("inicio de sesión de demostración: Ingresar → panel → Salir", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByTestId("selector-rol")).toHaveCount(0);
    await page.goto("/ingresar");
    await page.getByTestId("ingresar-correo").fill("persona@ejemplo.com");
    await page.getByTestId("ingresar-clave").fill("demo");
    await page.getByTestId("ingresar-entrar").click();
    await expect(page).toHaveURL(/\/panel$/);
    await page.locator('[data-testid="salir"]:visible').click();
    await expect(page).toHaveURL(/\/$/);
    expect(errors).toEqual([]);
  });

  test("saltar al contenido", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contenido")).toBeFocused();
  });
});
