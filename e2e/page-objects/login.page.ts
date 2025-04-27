import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the login page.
 * Contains selectors and methods for interacting with the login page.
 */
export class LoginPage {
  readonly page: Page;
  readonly container: Locator;
  readonly card: Locator;
  readonly titleElement: Locator;
  readonly form: Locator;
  readonly emailLabel: Locator;
  readonly emailInput: Locator;
  readonly passwordLabel: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingState: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;

  /**
   * Initialize the page model with element selectors
   */
  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("login-page-container");
    this.card = page.getByTestId("login-card");
    this.titleElement = page.getByTestId("login-title");
    this.form = page.getByTestId("login-form");
    this.emailLabel = page.getByTestId("email-label");
    this.emailInput = page.getByTestId("email-input");
    this.passwordLabel = page.getByTestId("password-label");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("login-submit-button");
    this.errorMessage = page.getByTestId("login-error-message");
    this.loadingState = page.getByTestId("login-loading-state");
    this.signupLink = page.getByTestId("signup-link");
    this.forgotPasswordLink = page.getByTestId("forgot-password-link");
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto("/auth/login");
  }

  /**
   * Check if the login page is fully loaded
   */
  async isLoaded() {
    await this.container.waitFor({ state: "visible" });
    await this.card.waitFor({ state: "visible" });
    await this.form.waitFor({ state: "visible" });
    return true;
  }

  /**
   * Fill in the login form with the provided credentials
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Fill login form using environment variables
   */
  async fillLoginFormWithEnvCredentials() {
    const email = process.env.E2E_USERNAME || "";
    const password = process.env.E2E_PASSWORD || "";

    if (!email || !password) {
      throw new Error("E2E_USERNAME or E2E_PASSWORD environment variables are not set");
    }

    await this.fillLoginForm(email, password);
  }

  /**
   * Submit the login form
   */
  async submitForm() {
    await this.submitButton.click();
  }

  /**
   * Login with the provided credentials
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitForm();
  }

  /**
   * Login with environment variable credentials
   */
  async loginWithEnvCredentials() {
    await this.fillLoginFormWithEnvCredentials();
    await this.submitForm();
  }

  /**
   * Wait for the loading state to appear
   */
  async waitForLoadingState() {
    await this.loadingState.waitFor({ state: "visible" });
  }

  /**
   * Wait for the loading state to disappear
   */
  async waitForLoadingComplete() {
    // Wait for the loading element to disappear, indicating the request is complete
    await this.loadingState.waitFor({ state: "hidden", timeout: 10000 }).catch(() => {
      // If element is not found (already gone), that's fine
    });
  }

  /**
   * Get the error message text (if any)
   */
  async getErrorMessage() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Navigate to the signup page
   */
  async navigateToSignup() {
    await this.signupLink.click();
  }

  /**
   * Navigate to the forgot password page
   */
  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
