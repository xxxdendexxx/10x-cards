# Test info

- Name: Login form validation >> navigates to forgot password page when clicking forgot password link
- Location: C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:67:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:3000/auth/recover-password"
Received string: "http://localhost:3000/auth/login"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en" data-astro-cid-sckkx6r4="">…</html>
      - unexpected value "http://localhost:3000/auth/login"

    at C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:69:24
```

# Page snapshot

```yaml
- text: Login Enter your email below to login to your account. Email
- textbox "Email"
- text: Password
- textbox "Password"
- paragraph
- button "Sign in"
- text: Don't have an account?
- link "Sign up":
  - /url: /auth/register
- link "Forgot password?":
  - /url: /auth/recover-password
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 | import { faker } from "@faker-js/faker";
   3 | import { LoginPage } from "./pages/login.page";
   4 |
   5 | test.describe("Login form validation", () => {
   6 |   let loginPage: LoginPage;
   7 |
   8 |   test.beforeEach(async ({ page }) => {
   9 |     loginPage = new LoginPage(page);
  10 |     await loginPage.goto();
  11 |   });
  12 |
  13 |   test("shows validation error for invalid email format", async () => {
  14 |     // Generate random invalid email and password
  15 |     const invalidEmail = "invalid-email";
  16 |     const randomPassword = faker.internet.password();
  17 |
  18 |     // Fill in the form with invalid data and submit
  19 |     await loginPage.fillLoginForm(invalidEmail, randomPassword);
  20 |     await loginPage.submitForm();
  21 |
  22 |     // Verify error message for invalid email appears
  23 |     await loginPage.expectErrorMessage("Please enter a valid email address.");
  24 |   });
  25 |
  26 |   test("shows validation error when fields are empty", async () => {
  27 |     // Submit form without filling fields
  28 |     await loginPage.submitForm();
  29 |
  30 |     // Verify error message appears
  31 |     await loginPage.expectErrorMessage("Both email and password are required.");
  32 |   });
  33 |
  34 |   test("handles server error for invalid credentials", async () => {
  35 |     // Generate random valid email and password
  36 |     const validEmail = faker.internet.email();
  37 |     const randomPassword = faker.internet.password();
  38 |
  39 |     // Mock the server response for invalid credentials
  40 |     await loginPage.mockInvalidCredentialsResponse();
  41 |
  42 |     // Fill in the form with valid format but non-existent credentials and submit
  43 |     await loginPage.fillLoginForm(validEmail, randomPassword);
  44 |     await loginPage.submitForm();
  45 |
  46 |     // Verify error message for invalid credentials appears
  47 |     await loginPage.expectErrorMessage("Invalid email or password");
  48 |   });
  49 |
  50 |   test("shows loader while submitting and disables inputs", async () => {
  51 |     // Mock the server response with a delay to observe loading state
  52 |     await loginPage.mockDelayedResponse(1000);
  53 |
  54 |     // Fill form with valid format data and submit
  55 |     await loginPage.fillLoginForm(faker.internet.email(), faker.internet.password());
  56 |     await loginPage.submitForm();
  57 |
  58 |     // Verify loading state
  59 |     await loginPage.expectFormIsLoading();
  60 |   });
  61 |
  62 |   test("navigates to register page when clicking sign up link", async ({ page }) => {
  63 |     await loginPage.navigateToSignUp();
  64 |     await expect(page).toHaveURL("/auth/register");
  65 |   });
  66 |
  67 |   test("navigates to forgot password page when clicking forgot password link", async ({ page }) => {
  68 |     await loginPage.navigateToForgotPassword();
> 69 |     await expect(page).toHaveURL("/auth/recover-password");
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  70 |   });
  71 |
  72 |   test("login form renders correctly", async () => {
  73 |     // Visual comparison test for the initial login form state
  74 |     await loginPage.takeFormScreenshot("login-form.png");
  75 |
  76 |     // Test error state visual appearance
  77 |     await loginPage.submitForm();
  78 |     await loginPage.expectErrorMessage("Both email and password are required.");
  79 |     await loginPage.takeFormScreenshot("login-form-error.png");
  80 |   });
  81 | });
  82 |
```