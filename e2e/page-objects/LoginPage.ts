import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model dla strony logowania
 *
 * Klasa ta zawiera lokatory i metody do interakcji z formularzem logowania.
 */
export class LoginPage {
  // Strona Playwright
  private readonly page: Page;

  // Lokatory
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loadingState: Locator;
  private readonly signupLink: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly loginCard: Locator;
  private readonly loginForm: Locator;

  /**
   * Konstruktor przyjmuje instancję Page z Playwright
   */
  constructor(page: Page) {
    this.page = page;

    // Inicjalizacja lokatorów przy pomocy data-testid
    this.loginCard = page.getByTestId("login-card");
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.loginButton = page.getByTestId("login-submit-button");
    this.errorMessage = page.getByTestId("login-error-message");
    this.loadingState = page.getByTestId("login-loading-state");
    this.signupLink = page.getByTestId("signup-link");
    this.forgotPasswordLink = page.getByTestId("forgot-password-link");
    this.loginForm = page.getByTestId("login-form");
  }

  /**
   * Nawigacja do strony logowania
   */
  async navigateTo() {
    await this.page.goto("/auth/login");
    await this.loginCard.waitFor({ state: "visible" });
  }

  /**
   * Wprowadza dane logowania
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Klika przycisk logowania i czeka na odpowiedź
   */
  async submitForm() {
    await this.loginButton.click();
  }

  /**
   * Wypełnia formularz i wysyła go
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitForm();
  }

  /**
   * Sprawdza czy proces logowania jest w toku
   */
  async isLoading() {
    return await this.loadingState.isVisible();
  }

  /**
   * Pobiera tekst błędu, jeśli istnieje
   */
  async getErrorMessage() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Przechodzi do strony rejestracji
   */
  async navigateToSignup() {
    await this.signupLink.click();
  }

  /**
   * Przechodzi do strony odzyskiwania hasła
   */
  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Sprawdza czy strona logowania została załadowana
   */
  async isLoaded() {
    await expect(this.loginCard).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Sprawdza czy komunikat o błędzie zawiera oczekiwany tekst
   */
  async assertErrorContains(text: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(text);
  }

  /**
   * Sprawdza czy po zalogowaniu nastąpiło przekierowanie na oczekiwaną stronę
   */
  async assertSuccessfulLogin(expectedUrl = "/generate") {
    await this.page.waitForURL(expectedUrl);
    expect(this.page.url()).toContain(expectedUrl);
  }

  /**
   * Sprawdza natywną walidację pola email
   * Natywna walidacja uruchamia się po próbie submitu formularza z pustym wymaganym polem
   */
  async assertNativeEmailValidation() {
    // Sprawdź czy pole email ma atrybut required
    const isRequired = await this.emailInput.getAttribute("required");
    expect(isRequired).not.toBeNull();

    // Sprawdź natywną walidację typu email
    const type = await this.emailInput.getAttribute("type");
    expect(type).toBe("email");

    // Sprawdź stan walidacji
    const isValid = await this.emailInput.evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(isValid).toBe(false);
  }

  /**
   * Sprawdza natywną walidację pola hasła
   */
  async assertNativePasswordValidation() {
    // Sprawdź czy pole hasła ma atrybut required
    const isRequired = await this.passwordInput.getAttribute("required");
    expect(isRequired).not.toBeNull();

    // Sprawdź stan walidacji
    const isValid = await this.passwordInput.evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(isValid).toBe(false);
  }

  /**
   * Wysyła formularz z uwzględnieniem natywnej walidacji
   * Używane do testowania walidacji HTML5
   */
  async submitFormWithNativeValidation() {
    // Użyj evaluate do wywołania natywnej walidacji formularza
    const isValid = await this.loginForm.evaluate((form) => {
      return (form as HTMLFormElement).checkValidity();
    });

    if (isValid) {
      await this.submitForm();
    } else {
      // Jeśli formularz nie jest ważny, wywoła natywną walidację
      await this.loginForm.evaluate((form) => {
        (form as HTMLFormElement).reportValidity();
      });
    }

    return isValid;
  }

  /**
   * Sprawdza czy pole ma natywny błąd walidacji
   */
  async hasNativeValidationError(field: "email" | "password") {
    const input = field === "email" ? this.emailInput : this.passwordInput;
    const isInvalid = await input.evaluate((el) => {
      return !(el as HTMLInputElement).validity.valid;
    });
    return isInvalid;
  }
}
