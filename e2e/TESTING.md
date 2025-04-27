# E2E Testing Documentation

## Scenariusz logowania i przekierowania

### Zidentyfikowane problemy

1. **Problem wykrywania testów**:
   - Testy nie były wykrywane przez Playwright ponieważ:
     - Konfiguracja Playwright wskazywała na katalog `./tests` zamiast `./e2e/tests`
     - Import typów `Page` i `Locator` musiał zostać zmieniony na import type-only

2. **Problem uwierzytelniania w testach**:
   - Scenariusz logowania wymaga prawdziwej sesji uwierzytelniającej:
     - Endpoint `/api/auth/login` po udanym logowaniu ustawia ciasteczka sesji za pomocą Supabase
     - Middleware sprawdza te ciasteczka i przekierowuje niezalogowanych użytkowników do `/auth/login`
     - Proste mockowanie API nie tworzy właściwych ciasteczek sesji
     - Przekierowanie przez `window.location.href` w komponencie React może nie być wykrywalne przez Playwright

### Rozwiązania

#### Opcja 1: Rzeczywiste logowanie

Dla pełnego testu end-to-end należy:
1. Użyć rzeczywistych danych logowania z zmiennych środowiskowych
2. Pozwolić na faktyczne wywołanie API
3. Obsłużyć przekierowanie przez Supabase i middleware

```typescript
test("login with real credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEnvCredentials();
  // Poczekaj na przekierowanie (może trwać dłużej w środowisku testowym)
  await page.waitForURL(/.*\/generate.*/, { timeout: 10000 });
});
```

#### Opcja 2: Bezpośrednie przekazanie cookies sesji

Dla testów integracyjnych bez konieczności pełnego procesu logowania:
1. Wygeneruj wcześniej ważne cookies sesji
2. Ustaw je bezpośrednio w przeglądarce przed nawigacją
3. Przejdź bezpośrednio do chronionej strony

```typescript
test("bypass login with session cookies", async ({ page }) => {
  // Ustaw wcześniej wygenerowane ciasteczka sesji
  await page.context().addCookies([
    // Tu należy dodać odpowiednie ciasteczka Supabase
    // (wymagałoby to osobnego procesu do ich wygenerowania)
  ]);
  
  // Przejdź bezpośrednio do strony generowania
  const generatePage = new GeneratePage(page);
  await generatePage.goto();
  await generatePage.isLoaded();
});
```

#### Opcja 3: Przygotowanie środowiska testowego bez uwierzytelniania

Dla uproszczonych testów interfejsu:
1. Skonfiguruj środowisko testowe tak, aby wyłączyć middleware autoryzacji
2. Ustaw flagę w konfiguracji testów omijającą kontrolę dostępu
3. Skup się na testowaniu funkcjonalności komponentów bez uwierzytelniania

### Wybór podejścia

Dla pełnych testów E2E zalecane jest podejście 1, które testuje rzeczywistą ścieżkę użytkownika.
Dla szybszych testów komponentów lub testów integracyjnych lepiej sprawdzi się opcja 2 lub 3.

### Wymagania środowiskowe

- Plik `.env.test` z prawidłowymi danymi testowymi
- Zmienne `E2E_USERNAME` i `E2E_PASSWORD` wskazujące na prawdziwe konto testowe
- Działający serwer deweloperski (`npm run dev`) podczas testów 