# Testowanie w projekcie 10x Cards

## Wprowadzenie

Ten katalog zawiera konfigurację i przykłady testów dla projektu 10x Cards. Wykorzystujemy następujące narzędzia:

- **Vitest** - do testów jednostkowych i integracyjnych (komponenty React, funkcje, moduły)
- **React Testing Library** - do testowania komponentów React
- **Playwright** - do testów end-to-end (E2E)

## Struktura testów

```
├── test/            # Konfiguracja testów jednostkowych
│   └── setup.ts     # Konfiguracja środowiska testowego Vitest
├── e2e/             # Testy E2E
│   ├── page-objects/ # Modele stron do testów E2E
│   └── *.test.ts    # Pliki testów E2E
└── src/
    └── components/
        └── *.test.tsx # Testy jednostkowe obok testowanych plików
```

## Uruchamianie testów

### Testy jednostkowe (Vitest)

```bash
# Uruchomienie testów jednostkowych jeden raz
npm run test

# Uruchomienie testów w trybie watch (przydatne podczas rozwoju)
npm run test:watch

# Uruchomienie testów z interfejsem graficznym
npm run test:ui

# Uruchomienie testów z raportami pokrycia kodu
npm run test:coverage
```

### Testy E2E (Playwright)

```bash
# Uruchomienie testów E2E w trybie headless
npm run e2e

# Uruchomienie testów E2E z interfejsem graficznym
npm run e2e:ui
```

## Pisanie testów

### Testy jednostkowe

Testy jednostkowe powinny być umieszczane obok testowanych plików (pattern współlokalizacji). Na przykład:

- `src/components/Button.tsx` - kod komponentu
- `src/components/Button.test.tsx` - testy komponentu

Przykład testu jednostkowego:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Testy E2E

Testy E2E wykorzystują wzorzec Page Object Model (POM) do organizacji kodu. Model strony powinien być umieszczony w katalogu `e2e/page-objects/` i zawierać selektory oraz metody do interakcji ze stroną.

Przykład:

```typescript
// e2e/page-objects/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

## Najlepsze praktyki

### Testy jednostkowe

- Używaj `vi.fn()` dla funkcji mock i `vi.spyOn()` do monitorowania istniejących funkcji
- Wykorzystuj `vi.mock()` do mockowania modułów
- Używaj `vi.setSystemTime()` do testowania logiki zależnej od czasu
- Pamiętaj o czyszczeniu mocków po każdym teście
- Wykorzystuj inline snapshots dla testowania złożonych struktur danych

### Testy E2E

- Implementuj Page Object Model dla lepszej organizacji kodu
- Używaj locatorów opartych na rolach i dostępności (getByRole, getByText)
- Stosuj asercje z określonym czasem oczekiwania (toBeVisible, toHaveText)
- Unikaj używania selektorów CSS opartych na klasach, które mogą się łatwo zmienić
- Wykorzystuj `trace` do debugowania nieudanych testów 