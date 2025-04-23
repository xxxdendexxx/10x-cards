import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async goto() {
    await this.page.goto("/auth/login");
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.getByTestId("login-card")).toBeVisible();
  }

  // Form interactions
  async fillEmail(email: string) {
    await this.page.getByTestId("email-input").fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByTestId("password-input").fill(password);
  }

  async submitForm() {
    await this.page.getByTestId("login-submit-button").click();
  }

  async fillLoginForm(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  // Navigation links
  async navigateToSignUp() {
    await this.page.getByTestId("signup-link").click();
  }

  async navigateToForgotPassword() {
    await this.page.getByTestId("forgot-password-link").click();
  }

  // Assertions
  async expectErrorMessage(message: string) {
    const errorElement = this.page.getByTestId("login-error-message");
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toHaveText(message);
  }

  async expectFormIsLoading() {
    await expect(this.page.getByTestId("login-submit-button")).toHaveText("Signing in...");
    await expect(this.page.getByTestId("email-input")).toBeDisabled();
    await expect(this.page.getByTestId("password-input")).toBeDisabled();
  }

  // Visual testing
  async takeFormScreenshot(name: string) {
    await expect(this.page).toHaveScreenshot(name, {
      fullPage: false,
      mask: [this.page.getByTestId("email-input"), this.page.getByTestId("password-input")],
    });
  }

  // Mock API responses
  async mockInvalidCredentialsResponse() {
    await this.page.route("/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid email or password" }),
      });
    });
  }

  async mockDelayedResponse(delayMs = 1000, status = 401, responseBody: object = { error: "Invalid credentials" }) {
    await this.page.route("/api/auth/login", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(responseBody),
      });
    });
  }

  async mockSuccessfulLoginResponse(redirectUrl = "/generate") {
    await this.page.route("/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, redirectUrl }),
      });
    });
  }
}
