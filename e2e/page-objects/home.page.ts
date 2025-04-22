import { Page, Locator } from "@playwright/test";

/**
 * Page Object Model dla strony głównej aplikacji.
 * Zawiera selektory oraz metody ułatwiające interakcję ze stroną.
 */
export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly registerLink: Locator;
  readonly loginLink: Locator;
  readonly featuresSection: Locator;

  /**
   * Inicjalizacja modelu strony z selektorami elementów
   */
  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.registerLink = page.getByRole("link", { name: /register|sign up|zarejestruj/i });
    this.loginLink = page.getByRole("link", { name: /login|sign in|zaloguj/i });
    this.featuresSection = page.getByTestId("features-section");
  }

  /**
   * Nawigacja do strony głównej
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Nawigacja do strony logowania poprzez kliknięcie odpowiedniego linku
   */
  async navigateToLogin() {
    await this.loginLink.click();
  }

  /**
   * Nawigacja do strony rejestracji poprzez kliknięcie odpowiedniego linku
   */
  async navigateToRegister() {
    await this.registerLink.click();
  }

  /**
   * Sprawdzenie, czy strona główna jest w pełni załadowana
   */
  async isLoaded() {
    await this.heading.waitFor({ state: "visible" });
    await this.registerLink.waitFor({ state: "visible" });
    await this.loginLink.waitFor({ state: "visible" });
    return true;
  }
}
