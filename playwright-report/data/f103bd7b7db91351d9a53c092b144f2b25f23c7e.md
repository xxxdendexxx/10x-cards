# Test info

- Name: Login form validation >> login form renders correctly
- Location: C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:72:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  36790 pixels (ratio 0.04 of all image pixels) are different.

Expected: C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts-snapshots\login-form-chromium-win32.png
Received: C:\Users\pmwaba\source\repos\10x-cards\test-results\login-Login-form-validation-login-form-renders-correctly-chromium\login-form-actual.png
    Diff: C:\Users\pmwaba\source\repos\10x-cards\test-results\login-Login-form-validation-login-form-renders-correctly-chromium\login-form-diff.png

Call log:
  - expect.toHaveScreenshot(login-form.png) with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 34429 pixels (ratio 0.04 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 2361 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 36790 pixels (ratio 0.04 of all image pixels) are different.

    at LoginPage.takeFormScreenshot (C:\Users\pmwaba\source\repos\10x-cards\tests\pages\login.page.ts:63:29)
    at C:\Users\pmwaba\source\repos\10x-cards\tests\login.spec.ts:74:21
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
   50 |     const errorElement = this.page.getByTestId("login-error-message");
   51 |     await expect(errorElement).toBeVisible();
   52 |     await expect(errorElement).toHaveText(message);
   53 |   }
   54 |
   55 |   async expectFormIsLoading() {
   56 |     await expect(this.page.getByTestId("login-submit-button")).toHaveText("Signing in...");
   57 |     await expect(this.page.getByTestId("email-input")).toBeDisabled();
   58 |     await expect(this.page.getByTestId("password-input")).toBeDisabled();
   59 |   }
   60 |
   61 |   // Visual testing
   62 |   async takeFormScreenshot(name: string) {
>  63 |     await expect(this.page).toHaveScreenshot(name, {
      |                             ^ Error: expect(page).toHaveScreenshot(expected)
   64 |       fullPage: false,
   65 |       mask: [this.page.getByTestId("email-input"), this.page.getByTestId("password-input")],
   66 |     });
   67 |   }
   68 |
   69 |   // Mock API responses
   70 |   async mockInvalidCredentialsResponse() {
   71 |     await this.page.route("/api/auth/login", async (route) => {
   72 |       await route.fulfill({
   73 |         status: 401,
   74 |         contentType: "application/json",
   75 |         body: JSON.stringify({ error: "Invalid email or password" }),
   76 |       });
   77 |     });
   78 |   }
   79 |
   80 |   async mockDelayedResponse(delayMs = 1000, status = 401, responseBody: object = { error: "Invalid credentials" }) {
   81 |     await this.page.route("/api/auth/login", async (route) => {
   82 |       await new Promise((resolve) => setTimeout(resolve, delayMs));
   83 |       await route.fulfill({
   84 |         status,
   85 |         contentType: "application/json",
   86 |         body: JSON.stringify(responseBody),
   87 |       });
   88 |     });
   89 |   }
   90 |
   91 |   async mockSuccessfulLoginResponse(redirectUrl = "/generate") {
   92 |     await this.page.route("/api/auth/login", async (route) => {
   93 |       await route.fulfill({
   94 |         status: 200,
   95 |         contentType: "application/json",
   96 |         body: JSON.stringify({ success: true, redirectUrl }),
   97 |       });
   98 |     });
   99 |   }
  100 | }
  101 |
```