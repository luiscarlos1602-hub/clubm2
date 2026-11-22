import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  // El servidor de desarrollo compila cada ruta la primera vez que se visita (puede tardar >5 s con 4 workers).
  expect: { timeout: 15_000 },
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "movil-390", use: { viewport: { width: 390, height: 844 } } },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
