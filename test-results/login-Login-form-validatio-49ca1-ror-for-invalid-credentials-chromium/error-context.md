# Test info

- Name: Login form validation >> handles server error for invalid credentials
- Location: C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:35:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeAttached()

Locator: getByTestId('login-error-message')
Expected: attached
Received: <element(s) not found>
Call log:
  - expect.toBeAttached with timeout 5000ms
  - waiting for getByTestId('login-error-message')

    at LoginPage.expectErrorMessage (C:\Users\pmwaba\source\repos\10x-cards\tests\pages\login.page.ts:50:64)
    at C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:48:21
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
   1 | import { expect } from "@playwright/test";
   2 | import type { Page } from "@playwright/test";
   3 |
   4 | export class LoginPage {
   5 |   readonly page: Page;
   6 |
   7 |   constructor(page: Page) {
   8 |     this.page = page;
   9 |   }
   10 |
   11 |   // Navigation
   12 |   async goto() {
   13 |     await this.page.goto("/auth/login");
   14 |     await this.waitForPageLoad();
   15 |   }
   16 |
   17 |   async waitForPageLoad() {
   18 |     await expect(this.page.getByTestId("login-card")).toBeVisible();
   19 |   }
   20 |
   21 |   // Form interactions
   22 |   async fillEmail(email: string) {
   23 |     await this.page.getByTestId("email-input").fill(email);
   24 |   }
   25 |
   26 |   async fillPassword(password: string) {
   27 |     await this.page.getByTestId("password-input").fill(password);
   28 |   }
   29 |
   30 |   async submitForm() {
   31 |     await this.page.getByTestId("login-submit-button").click();
   32 |   }
   33 |
   34 |   async fillLoginForm(email: string, password: string) {
   35 |     await this.fillEmail(email);
   36 |     await this.fillPassword(password);
   37 |   }
   38 |
   39 |   // Navigation links
   40 |   async navigateToSignUp() {
   41 |     await this.page.getByTestId("signup-link").click();
   42 |   }
   43 |
   44 |   async navigateToForgotPassword() {
   45 |     await this.page.getByTestId("forgot-password-link").click();
   46 |   }
   47 |
   48 |   // Assertions
   49 |   async expectErrorMessage(message: string) {
>  50 |     await expect(this.page.getByTestId("login-error-message")).toBeAttached({ timeout: 5000 });
      |                                                                ^ Error: Timed out 5000ms waiting for expect(locator).toBeAttached()
   51 |     const errorElement = this.page.getByTestId("login-error-message");
   52 |
   53 |     await expect(errorElement).toHaveText(message);
   54 |     await expect(errorElement).toBeVisible();
   55 |   }
   56 |
   57 |   async expectEmailInputToBeInvalid() {
   58 |     // Directly check the element's validity state using JavaScript
   59 |     const isInvalid = await this.page
   60 |       .getByTestId("email-input")
   61 |       .evaluate((el) => !(el as HTMLInputElement).checkValidity());
   62 |     expect(isInvalid).toBe(true);
   63 |   }
   64 |
   65 |   async expectEmailInputToBeRequiredInvalid() {
   66 |     // Check validity state for missing value
   67 |     const isMissing = await this.page
   68 |       .getByTestId("email-input")
   69 |       .evaluate((el) => (el as HTMLInputElement).validity.valueMissing);
   70 |     expect(isMissing).toBe(true);
   71 |   }
   72 |
   73 |   async expectPasswordInputToBeRequiredInvalid() {
   74 |     // Check validity state for missing value
   75 |     const isMissing = await this.page
   76 |       .getByTestId("password-input")
   77 |       .evaluate((el) => (el as HTMLInputElement).validity.valueMissing);
   78 |     expect(isMissing).toBe(true);
   79 |   }
   80 |
   81 |   async expectFormIsLoading() {
   82 |     const submitButton = this.page.getByTestId("login-submit-button");
   83 |     await expect(submitButton).toHaveText("Signing in...", { timeout: 5000 });
   84 |     await expect(this.page.getByTestId("email-input")).toBeDisabled();
   85 |     await expect(this.page.getByTestId("password-input")).toBeDisabled();
   86 |   }
   87 |
   88 |   // Visual testing
   89 |   async takeFormScreenshot(name: string) {
   90 |     await expect(this.page).toHaveScreenshot(name, {
   91 |       fullPage: false,
   92 |       mask: [this.page.getByTestId("email-input"), this.page.getByTestId("password-input")],
   93 |     });
   94 |   }
   95 |
   96 |   // Mock API responses
   97 |   async mockInvalidCredentialsResponse() {
   98 |     await this.page.route("/api/auth/login", async (route) => {
   99 |       await route.fulfill({
  100 |         status: 401,
  101 |         contentType: "application/json",
  102 |         body: JSON.stringify({ error: "Invalid email or password" }),
  103 |       });
  104 |     });
  105 |   }
  106 |
  107 |   async mockDelayedResponse(delayMs = 1000, status = 401, responseBody: object = { error: "Invalid credentials" }) {
  108 |     await this.page.route("/api/auth/login", async (route) => {
  109 |       await new Promise((resolve) => setTimeout(resolve, delayMs));
  110 |       await route.fulfill({
  111 |         status,
  112 |         contentType: "application/json",
  113 |         body: JSON.stringify(responseBody),
  114 |       });
  115 |     });
  116 |   }
  117 |
  118 |   async mockSuccessfulLoginResponse(redirectUrl = "/generate") {
  119 |     await this.page.route("/api/auth/login", async (route) => {
  120 |       await route.fulfill({
  121 |         status: 200,
  122 |         contentType: "application/json",
  123 |         body: JSON.stringify({ success: true, redirectUrl }),
  124 |       });
  125 |     });
  126 |   }
  127 | }
  128 |
```