import { defineConfig, devices } from "@playwright/test";
// playwright.config.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * Konfiguracja Playwright dla testów E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e/tests",
  /* Maksymalny czas testu przed uznaniem za nieudany */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maksymalny czas oczekiwania na asercje
     */
    timeout: 5000,
  },
  /* Uruchamianie testów w trybie losowym */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  /* Konfiguracja reporterów */
  reporter: "html",
  /* Wspólne ustawienia dla wszystkich projektów */
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    /* Zrzuty ekranu przy niepowodzeniu testu */
    screenshot: "only-on-failure",
    /* Trace przy niepowodzeniu testu */
    trace: "on-first-retry",
    /* Headless mode dla uruchamiania w CI */
    headless: true,
  },
  /* Konfiguracja projektów testowych */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  /* Webserver do uruchamiania aplikacji podczas testów */
  webServer: {
    command: "npx astro build --config astro.config.test.mjs && npx astro preview --config astro.config.test.mjs",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
