import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { LoginPage } from "./pages/login.page";

test.describe("Login form validation", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("shows validation error for invalid email format", async () => {
    // Generate random invalid email and password
    const invalidEmail = "invalid-email";
    const randomPassword = faker.internet.password();
    console.log("fuck");
    // Fill in the form with invalid data and submit
    await loginPage.fillLoginForm(invalidEmail, randomPassword);
    await loginPage.submitForm();

    // Verify the browser's native validation marks the input as invalid
    await loginPage.expectEmailInputToBeInvalid();
  });

  test("shows validation error when fields are empty", async () => {
    // Submit form without filling fields
    await loginPage.submitForm();

    // Verify native browser validation marks inputs as invalid due to 'required'
    await loginPage.expectEmailInputToBeRequiredInvalid();
    await loginPage.expectPasswordInputToBeRequiredInvalid();
  });

  test("handles server error for invalid credentials", async () => {
    // Generate random valid email and password
    const validEmail = faker.internet.email();
    const randomPassword = faker.internet.password();

    // Mock the server response for invalid credentials
    await loginPage.mockInvalidCredentialsResponse();

    // Fill in the form with valid format but non-existent credentials and submit
    await loginPage.fillLoginForm(validEmail, randomPassword);
    await loginPage.submitForm();

    // Verify error message for invalid credentials appears
    await loginPage.expectErrorMessage("Invalid email or password");
  });

  test("shows loader while submitting and disables inputs", async () => {
    // Mock the server response with a delay to observe loading state
    await loginPage.mockDelayedResponse(1000);

    // Fill form with valid format data and submit
    await loginPage.fillLoginForm(faker.internet.email(), faker.internet.password());
    await loginPage.submitForm();

    // Verify loading state
    await loginPage.expectFormIsLoading();
  });

  test("navigates to register page when clicking sign up link", async ({ page }) => {
    await loginPage.navigateToSignUp();
    await expect(page).toHaveURL("/auth/register");
  });

  test("navigates to forgot password page when clicking forgot password link", async ({ page }) => {
    await loginPage.navigateToForgotPassword();
    await page.waitForURL("**/auth/recover-password");
    await expect(page).toHaveURL("/auth/recover-password");
  });
});
