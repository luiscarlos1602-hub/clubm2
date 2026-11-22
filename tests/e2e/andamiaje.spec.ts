import { test, expect } from "@playwright/test";

test("la raíz responde", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home")).toBeVisible();
});
