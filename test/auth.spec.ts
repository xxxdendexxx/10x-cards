import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should allow a user to log in and redirect to the generate page", async ({ page }) => {
    // Navigate to the login page
    await page.goto("/auth/login");

    // TODO: Replace with actual test user credentials
    const userEmail = process.env.TEST_USER_EMAIL || "test@example.com";
    const userPassword = process.env.TEST_USER_PASSWORD || "password123";

    // Fill in the login form using data-testid
    await page.getByTestId("email-input").fill(userEmail);
    await page.getByTestId("password-input").fill(userPassword);

    // Click the login button
    // Using getByRole is still good practice for buttons
    await page.getByRole("button", { name: /sign in/i }).click();

    // Verify redirection to the generate page
    await expect(page).toHaveURL("/generate");

    // Verify content on the generate page to ensure successful navigation
    await expect(page.getByRole("heading", { name: "Generate Flashcards" })).toBeVisible();
  });

  // TODO: Add more authentication tests (e.g., invalid login, logout)
});
