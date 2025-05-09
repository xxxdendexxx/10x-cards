import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";

test.describe("Testy autoryzacji", () => {
  let loginPage: LoginPage;

  // Przygotowanie dla każdego testu - inicjalizacja LoginPage
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.isLoaded();
  });

  // // Scenariusz 1: Poprawne dane logowania (fikcyjne)
  // test("Zalogowanie z poprawnymi danymi", async () => {
  //   // Arrange - dane testowe
  //   const testEmail = "test@example.com";
  //   const testPassword = "password123";

  //   // Act - wypełnij i wyślij formularz
  //   await loginPage.login(testEmail, testPassword);

  //   // Assert - sprawdź czy przekierowanie nastąpiło poprawnie
  //   await loginPage.assertSuccessfulLogin();
  // });

  // Scenariusz 2: Dane z zmiennych środowiskowych
  test("Zalogowanie z danymi z zmiennych środowiskowych", async () => {
    // Arrange - dane testowe z zmiennych środowiskowych
    const envUser = process.env.E2E_USERNAME || "env_user@example.com";
    const envPassword = process.env.E2E_PASSWORD || "env_password123";

    // Act - wypełnij i wyślij formularz
    await loginPage.login(envUser, envPassword);

    // Assert - sprawdź czy przekierowanie nastąpiło poprawnie
    await loginPage.assertSuccessfulLogin();
  });

  // Scenariusz 3: Brak danych - natywna walidacja HTML
  test("Natywna walidacja wymagalności pól formularza", async () => {
    // Act - próba wysłania pustego formularza z natywną walidacją
    const isValid = await loginPage.submitFormWithNativeValidation();

    // Assert - sprawdź czy formularz nie przeszedł walidacji
    expect(isValid).toBe(false);

    // Sprawdź natywną walidację pól
    expect(await loginPage.hasNativeValidationError("email")).toBe(true);

    // W natywnej walidacji HTML, walidowane jest pierwsze nieprawidłowe pole,
    // więc walidacja hasła nie uruchomi się dopóki email nie zostanie poprawiony
    await loginPage.fillLoginForm("test@example.com", "");
    await loginPage.submitFormWithNativeValidation();

    // Teraz sprawdź walidację hasła
    expect(await loginPage.hasNativeValidationError("password")).toBe(true);

    // Po wypełnieniu obu pól, walidacja powinna przejść
    await loginPage.fillLoginForm("test@example.com", "password123");
    const isValidAfterFill = await loginPage.submitFormWithNativeValidation();
    expect(isValidAfterFill).toBe(true);
  });

  // Scenariusz 4: Niepoprawny format emaila - natywna walidacja
  test("Natywna walidacja formatu adresu email", async () => {
    // Arrange - nieprawidłowy email
    const invalidEmail = "invalid-email";
    const testPassword = "password123";

    // Act - wypełnij formularz nieprawidłowym emailem
    await loginPage.fillLoginForm(invalidEmail, testPassword);

    // Próba wysłania formularza z natywną walidacją
    const isValid = await loginPage.submitFormWithNativeValidation();

    // Assert - sprawdź czy natywna walidacja email zadziałała
    expect(isValid).toBe(false);
    expect(await loginPage.hasNativeValidationError("email")).toBe(true);

    // Popraw email i sprawdź ponownie
    await loginPage.fillLoginForm("valid@example.com", testPassword);
    const isValidAfterFix = await loginPage.submitFormWithNativeValidation();
    expect(isValidAfterFix).toBe(true);
  });

  // Scenariusz 7: Błędne dane logowania
  test("Wyświetlenie błędu przy nieprawidłowych danych logowania", async () => {
    // Arrange - nieprawidłowe dane
    const testEmail = "test@example.com";
    const wrongPassword = "wrong-password";

    // Act - wypełnij i wyślij formularz
    await loginPage.login(testEmail, wrongPassword);

    // Assert - sprawdź komunikat o błędzie (ten test może wymagać mocka API)
    await loginPage.assertErrorContains("Invalid login credentials.");
  });

  // Scenariusz 8: Nawigacja do strony rejestracji
  test("Przekierowanie do strony rejestracji", async ({ page }) => {
    // Act - kliknij link rejestracji
    await loginPage.navigateToSignup();

    // Assert - sprawdź URL
    await page.waitForURL("/auth/register");
    expect(page.url()).toContain("/auth/register");
  });
});
