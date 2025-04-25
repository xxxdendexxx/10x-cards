# Test info

- Name: Login form validation >> navigates to forgot password page when clicking forgot password link
- Location: C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:68:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/auth/recover-password" until "load"
============================================================
    at C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:70:16
```

# Page snapshot

```yaml
- text: Login Enter your email below to login to your account. Email
- textbox "Email"
- text: Password
- textbox "Password"
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
  17 |     console.log("fuck");
  18 |     // Fill in the form with invalid data and submit
  19 |     await loginPage.fillLoginForm(invalidEmail, randomPassword);
  20 |     await loginPage.submitForm();
  21 |
  22 |     // Verify the browser's native validation marks the input as invalid
  23 |     await loginPage.expectEmailInputToBeInvalid();
  24 |   });
  25 |
  26 |   test("shows validation error when fields are empty", async () => {
  27 |     // Submit form without filling fields
  28 |     await loginPage.submitForm();
  29 |
  30 |     // Verify native browser validation marks inputs as invalid due to 'required'
  31 |     await loginPage.expectEmailInputToBeRequiredInvalid();
  32 |     await loginPage.expectPasswordInputToBeRequiredInvalid();
  33 |   });
  34 |
  35 |   test("handles server error for invalid credentials", async () => {
  36 |     // Generate random valid email and password
  37 |     const validEmail = faker.internet.email();
  38 |     const randomPassword = faker.internet.password();
  39 |
  40 |     // Mock the server response for invalid credentials
  41 |     await loginPage.mockInvalidCredentialsResponse();
  42 |
  43 |     // Fill in the form with valid format but non-existent credentials and submit
  44 |     await loginPage.fillLoginForm(validEmail, randomPassword);
  45 |     await loginPage.submitForm();
  46 |
  47 |     // Verify error message for invalid credentials appears
  48 |     await loginPage.expectErrorMessage("Invalid email or password");
  49 |   });
  50 |
  51 |   test("shows loader while submitting and disables inputs", async () => {
  52 |     // Mock the server response with a delay to observe loading state
  53 |     await loginPage.mockDelayedResponse(1000);
  54 |
  55 |     // Fill form with valid format data and submit
  56 |     await loginPage.fillLoginForm(faker.internet.email(), faker.internet.password());
  57 |     await loginPage.submitForm();
  58 |
  59 |     // Verify loading state
  60 |     await loginPage.expectFormIsLoading();
  61 |   });
  62 |
  63 |   test("navigates to register page when clicking sign up link", async ({ page }) => {
  64 |     await loginPage.navigateToSignUp();
  65 |     await expect(page).toHaveURL("/auth/register");
  66 |   });
  67 |
  68 |   test("navigates to forgot password page when clicking forgot password link", async ({ page }) => {
  69 |     await loginPage.navigateToForgotPassword();
> 70 |     await page.waitForURL("**/auth/recover-password");
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  71 |     await expect(page).toHaveURL("/auth/recover-password");
  72 |   });
  73 | });
  74 |
```