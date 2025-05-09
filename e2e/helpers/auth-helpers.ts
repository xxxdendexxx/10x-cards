import type { Page } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";

/**
 * Funkcje pomocnicze dla testów autoryzacji
 */

/**
 * Wykonuje logowanie z podanymi danymi
 *
 * @param page Obiekt page z Playwright
 * @param email Adres email do logowania
 * @param password Hasło do logowania
 * @returns Instancja strony LoginPage
 */
export async function loginWithCredentials(page: Page, email: string, password: string): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo();
  await loginPage.login(email, password);
  return loginPage;
}

/**
 * Wykonuje logowanie z danymi ze zmiennych środowiskowych
 *
 * @param page Obiekt page z Playwright
 * @returns Instancja strony LoginPage
 */
export async function loginWithEnvCredentials(page: Page): Promise<LoginPage> {
  const email = process.env.TEST_USER || "default_test@example.com";
  const password = process.env.TEST_PASSWORD || "default_password";
  return loginWithCredentials(page, email, password);
}

/**
 * Sprawdza dostępność elementów formularza logowania
 *
 * @param page Obiekt page z Playwright
 */
export async function checkLoginFormElements(page: Page): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo();
  await loginPage.isLoaded();
  return loginPage;
}

/**
 * Oczyszcza dane autoryzacyjne, np. przed uruchomieniem testów
 *
 * @param page Obiekt page z Playwright
 */
export async function clearAuthState(page: Page): Promise<void> {
  // Wyczyść ciasteczka i local storage związane z autoryzacją
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.clear();
  });
}
