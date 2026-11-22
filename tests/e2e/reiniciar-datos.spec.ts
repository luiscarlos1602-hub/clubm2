import { test, expect } from "@playwright/test";

const KEY = "club-demo:v1";
const ROLE_KEY = "club-ui:v1";
const ROLE_VALUE = JSON.stringify({ state: { role: "investor" }, version: 0 });

test.describe("reiniciar datos simulados", () => {
  test("confirmación en dos pasos restaura el snapshot sembrado", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await expect(page.getByTestId("demo-reset-button")).toBeVisible();

    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, seededOn: "1999-01-01", projects: "alterado" }));
    }, KEY);
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [ROLE_KEY, ROLE_VALUE]);

    // Cancelar no cambia nada
    await page.getByTestId("demo-reset-button").click();
    await page.getByTestId("demo-reset-cancel").click();
    await expect(page.getByTestId("demo-reset-button")).toBeVisible();
    expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "{}").seededOn, KEY)).toBe("1999-01-01");

    await page.getByTestId("demo-reset-button").click();
    await page.getByTestId("demo-reset-confirm").click();
    await expect(page.getByTestId("demo-reset-done")).toBeVisible();

    const snap = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), KEY);
    expect(snap.version).toBe(1);
    expect(snap.seededOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snap.seededOn).not.toBe("1999-01-01");
    expect(snap.projects.projects).toHaveLength(7);

    // N6: el rol activo no se reinicia
    expect(await page.evaluate((k) => localStorage.getItem(k), ROLE_KEY)).toBe(ROLE_VALUE);

    expect(errors).toEqual([]);
  });

  test("el botón existe en las tres zonas", async ({ page }) => {
    for (const url of ["/", "/portafolio", "/admin"]) {
      await page.goto(url);
      await expect(page.getByTestId("demo-reset-button")).toBeVisible();
    }
  });
});
