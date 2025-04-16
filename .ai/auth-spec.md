# Specyfikacja modułu autentykacji i zarządzania użytkownikiem

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Warstwa Frontendowa

- W strukturze aplikacji zostaną utworzone dedykowane strony dla funkcjonalności związanych z autentykacją, umieszczone w katalogu: `/src/pages/auth`. Strony te obejmą:
  - **Logowanie** – formularz logowania użytkownika
  - **Rejestracja** – formularz tworzenia nowego konta
  - **Odzyskiwanie hasła** – formularz inicjujący proces resetu hasła
  - Ewentualnie: Strona zarządzania kontem (zmiana hasła, usunięcie konta)

- Zostaną przygotowane dwa typy layoutów Astro:
  - **Layout Publiczny (Auth Layout)** – stosowany na stronach, gdzie użytkownik nie musi być zalogowany (logowanie, rejestracja, odzyskiwanie hasła).
  - **Layout Prywatny (Private Layout)** – dla stron wymagających autoryzacji (np. sesja nauki, zarządzanie treścią), gdzie przed renderowaniem następuje weryfikacja sesji użytkownika.

- W katalogu `/src/components/auth` zostaną umieszczone interaktywne komponenty React (wyspy) odpowiedzialne za:
  - **LoginForm** – obsługa logowania, walidacja pól (email, hasło) oraz komunikacja z API
  - **RegistrationForm** – obsługa rejestracji, weryfikacja danych (poprawność adresu e-mail, minimalna długość hasła) oraz odzwierciedlanie ewentualnych błędów
  - **RecoverPasswordForm** – formularz odzyskiwania hasła, wysyłający zapytanie o reset oraz informujący użytkownika o dalszych krokach

- Walidacja i komunikaty błędów:
  - Formularze będą posiadały walidację po stronie klienta (np. za pomocą bibliotek takich jak Zod lub Yup) i dynamiczne wyświetlanie komunikatów błędów.
  - Po stronie serwera, odpowiedzi API zawierać będą ujednolicone komunikaty błędów, które komponenty React będą prezentowały użytkownikowi (np. "Błędny login lub hasło", "Email już zarejestrowany").

- Scenariusze użycia:
  - Użytkownik wchodzi na stronę logowania, wypełnia formularz, a po poprawnej weryfikacji jest przekierowywany do strefy zabezpieczonej.
  - W przypadku rejestracji, użytkownik uzyskuje natychmiastową informację o ewentualnych błędach (np. już istniejące konto) lub potwierdzenie pomyślnego utworzenia konta.
  - Proces odzyskiwania hasła informuje użytkownika o wysłaniu linku resetującego na wskazany adres e-mail.

### 1.2 Rozdzielenie odpowiedzialności

- **Strony Astro**:
  - Odpowiedzialne za routowanie, renderowanie szablonów i layoutów oraz wstępną weryfikację sesji (np. przekierowanie niezalogowanych użytkowników).

- **Komponenty React**:
  - Obsługują interaktywność formularzy, walidację danych, dynamiczne wyświetlanie komunikatów oraz wysyłanie żądań AJAX do odpowiednich endpointów API.

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura Endpointów API

Endpointy API zostaną umieszczone w katalogu: `/src/pages/api/auth` i obejmą:

- **POST /api/auth/signup** – rejestracja nowego użytkownika, przyjmująca dane: email, hasło.
- **POST /api/auth/login** – logowanie użytkownika, przyjmujące dane: email, hasło.
- **POST /api/auth/logout** – wylogowywanie bieżącego użytkownika.
- **POST /api/auth/password-reset** – inicjacja procesu odzyskiwania hasła, przyjmująca adres email użytkownika.
- (Opcjonalnie) **GET /api/auth/session** – sprawdzanie stanu sesji użytkownika.

### 2.2 Modele Danych i Walidacja

- Dane wejściowe będą walidowane przy użyciu narzędzi takich jak Zod lub Yup, aby zapewnić poprawność formatu (np. valid email, minimalna długość hasła) przed wysłaniem do Supabase.
- Modele danych będą zgodne ze strukturą użytkownika obsługiwaną przez Supabase (np. id, email, status konta).

### 2.3 Obsługa Wyjątków

- Każdy endpoint będzie implementował mechanizmy przechwytywania błędów, zwracając ujednolicone kody HTTP oraz komunikaty błędów.
- Błędy związane z komunikacją do Supabase (np. problemy z autentykacją lub wewnętrzne) będą logowane i zwracane z kodem 500 lub odpowiednim kodem wskazującym problem.
- Wdrożony zostanie system monitorowania błędów (np. Sentry) umożliwiający szybką diagnozę problemów produkcyjnych.

## 3. SYSTEM AUTENTYKACJI

### 3.1 Wykorzystanie Supabase Auth

- **Rejestracja**:
  - Użytkownik podaje dane rejestracyjne (email, hasło) poprzez formularz. Funkcja `supabase.auth.signUp` jest wywoływana w celu utworzenia nowego konta.

- **Logowanie**:
  - Po wprowadzeniu danych w formularzu logowania, wywoływana jest funkcja `supabase.auth.signInWithPassword`, która weryfikuje poprawność poświadczeń użytkownika.

- **Wylogowywanie**:
  - Funkcja `supabase.auth.signOut` umożliwia bezpieczne zakończenie sesji użytkownika, czyszcząc tokeny oraz ewentualne ciasteczka.

- **Odzyskiwanie Hasła**:
  - Inicjowany przez formularz odzyskiwania hasła, gdzie funkcja, np. `supabase.auth.resetPasswordForEmail`, wysyła link resetujący na wskazany adres e-mail.

### 3.2 Middleware i Ochrona Tras

- W pliku `/src/middleware/index.ts` zostanie wdrożony middleware sprawdzający ważność sesji użytkownika przed dostępem do stron wymagających autoryzacji.
- Middleware będzie przekierowywał niezalogowanych użytkowników na stronę logowania.

### 3.3 Integracja Frontend-Backend

- Komponenty React wysyłają zapytania do dedykowanych endpointów API, które z kolei komunikują się z Supabase Auth.
- Alternatywnie, możliwe bezpośrednie użycie biblioteki Supabase w warstwie klienta dla szybszej interakcji, przy zachowaniu jednolitego interfejsu komunikacji.
- Wszystkie operacje autentykacyjne są zabezpieczone przy użyciu tokenów JWT oraz ciasteczek httpOnly, co zapewnia odpowiedni poziom bezpieczeństwa.

### 3.4 Kontrakty i Serwisy

- **AuthService** – moduł/serwis (np. w `/src/lib/auth.ts`), który kapsułuje całą logikę komunikacji z Supabase Auth (rejestracja, logowanie, wylogowywanie, odzyskiwanie hasła).
- **Interfejsy TypeScript** – definiujące strukturę danych wejściowych i wyjściowych dla operacji autentykacyjnych, zapewniające spójność kontraktów między frontendem a backendem.
- **Kontrakt API** – dokumentacja oczekiwanych żądań i odpowiedzi dla endpointów autentykacji, co umożliwia spójną integrację między komponentami systemu.

## Podsumowanie

Proponowany system autentykacji opiera się na następujących kluczowych elementach:

- **Interfejs użytkownika**:
  - Dedykowane strony autoryzacyjne z podziałem na publiczne i prywatne layouty.
  - Interaktywne komponenty React odpowiedzialne za formularze logowania, rejestracji i odzyskiwania hasła, z wbudowaną walidacją i obsługą komunikatów błędów.

- **Logika Backendowa**:
  - Endpointy API zorganizowane w dedykowanym module `/src/pages/api/auth` umożliwiające rejestrację, logowanie, wylogowywanie i inicjację resetu hasła.
  - Walidacja i obsługa wyjątków zapewniające bezpieczeństwo i spójność danych wejściowych.

- **System Autentykacji**:
  - Wykorzystanie Supabase Auth jako centralnego mechanizmu zarządzania użytkownikami, zapewniającego skalowalne i bezpieczne rozwiązanie.
  - Middleware oraz serwis AuthService zapewniający jednolity interfejs i zabezpieczenie dostępu do stron wymagających autoryzacji.

Architektura ta gwarantuje uporządkowaną separację między warstwą interfejsu użytkownika, logiką biznesową backendu oraz systemem autentykacji, spełniając wymagania US-004 (bezpieczny dostęp i autoryzacja) oraz US-006 (bezpieczne logowanie i uwierzytelnianie) zgodnie z przyjętym stackiem technologicznym (Astro, React, Supabase, Tailwind, Shadcn/ui). 