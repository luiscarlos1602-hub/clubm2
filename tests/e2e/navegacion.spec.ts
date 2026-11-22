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

  test("selector de rol", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    const sel = page.getByTestId("selector-rol");
    await expect(sel).toContainText("Visitante");
    await sel.click();
    await page.getByTestId("selector-rol-admin").click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.reload();
    await expect(page.getByTestId("selector-rol")).toContainText("Admin");
    await page.goto("/");
    await expect(page.getByTestId("selector-rol")).toContainText("Admin");
    await page.getByTestId("selector-rol").click();
    await page.getByTestId("selector-rol-investor").click();
    await expect(page).toHaveURL(/\/proyectos$/);
    await page.reload();
    await page.goto("/");
    await expect(page.getByTestId("selector-rol")).toContainText("Inversionista");
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
