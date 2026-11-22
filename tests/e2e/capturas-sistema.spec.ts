import { test } from "@playwright/test";

test.skip(!process.env.CAPTURAS, "Solo con CAPTURAS=1 (pnpm capturas)");

test("captura de /sistema", async ({ page }, testInfo) => {
  await page.goto("/sistema");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `docs/qa/F1/sistema-${testInfo.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
