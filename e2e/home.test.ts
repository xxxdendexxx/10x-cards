import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/home.page";

test.describe("Strona główna", () => {
  test("powinna wyświetlać podstawowe elementy interfejsu", async ({ page }) => {
    // Inicjalizacja modelu strony
    const homePage = new HomePage(page);

    // Nawigacja do strony głównej
    await homePage.goto();

    // Weryfikacja elementów
    await expect(homePage.heading).toBeVisible();
    await expect(homePage.registerLink).toBeVisible();
    await expect(homePage.loginLink).toBeVisible();
  });

  test("powinna przekierować do strony logowania po kliknięciu przycisku login", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Kliknięcie w link logowania
    await homePage.navigateToLogin();

    // Sprawdzenie przekierowania
    await expect(page).toHaveURL(/.*\/login.*/);
  });
});
