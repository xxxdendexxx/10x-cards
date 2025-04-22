import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  /* Maksymalny czas testu przed uznaniem za nieudany */
  timeout: 30 * 1000,
  /* Uruchamianie testów w trybie losowym */
  fullyParallel: true,
  /* Tryb wyszukiwania (słowo kluczowe "test" w nazwach plików) */
  grep: /.*\.test\.ts/,
  /* Konfiguracja reporterów */
  reporter: [["html"], ["list"]],
  /* Wspólne ustawienia dla wszystkich projektów */
  use: {
    /* Zrzuty ekranu przy niepowodzeniu testu */
    screenshot: "only-on-failure",
    /* Nagrywanie wideo przy niepowodzeniu testu */
    video: "on-first-retry",
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
    command: "npm run dev",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
