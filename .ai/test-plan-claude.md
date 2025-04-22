# Plan Testów dla Projektu 10x-cards

## 1. Wprowadzenie i cele testowania

Niniejszy plan testów został opracowany dla projektu 10x-cards, aplikacji do tworzenia i zarządzania fiszkami edukacyjnymi z wykorzystaniem sztucznej inteligencji. Główne cele testowania obejmują:

- Weryfikację poprawności działania generowania fiszek z wykorzystaniem AI
- Sprawdzenie funkcjonalności edycji, akceptacji i odrzucania propozycji fiszek
- Testowanie integracji z Supabase jako backendem aplikacji
- Zapewnienie responsywności interfejsu użytkownika na różnych urządzeniach
- Walidację bezpieczeństwa danych użytkowników i procesu autentykacji
- Weryfikację zgodności interfejsu z projektami i makietami

## 2. Zakres testów

Zakres testów obejmuje:

- Frontend: komponenty Astro i React
- Backend: API oparte na Supabase
- Integracja z usługami zewnętrznymi (Openrouter.ai)
- Przetwarzanie i walidacja danych wejściowych/wyjściowych
- Obsługa błędów i przypadków brzegowych
- Wydajność aplikacji pod różnym obciążeniem
- Zabezpieczenia i autoryzacja
- Spójność wizualna komponentów UI

## 3. Typy testów

### 3.1. Testy jednostkowe (Unit tests)
- **Narzędzia**: Vitest, React Testing Library, Testing Library Hooks
- **Zakres**:
  - Komponenty React (np. GenerateFlashcardsForm, FlashcardProposalItem)
  - Funkcje walidacyjne (np. dla długości tekstu źródłowego)
  - Hooki własne (hooks) z wykorzystaniem Testing Library Hooks
  - Usługi integracyjne

### 3.2. Testy integracyjne
- **Narzędzia**: Vitest, MSW (Mock Service Worker), Playwright API Testing
- **Zakres**:
  - Integracja komponentów (np. generowanie i wyświetlanie fiszek)
  - Komunikacja z API (np. `/api/generate`, `/api/flashcards`)
  - Integracja z Supabase
  - Testowanie API endpoints z wykorzystaniem Playwright API Testing

### 3.3. Testy e2e (end-to-end)
- **Narzędzia**: Playwright
- **Zakres**:
  - Przepływy użytkownika (np. logowanie -> generowanie -> zapisywanie)
  - Responsywność interfejsu na różnych urządzeniach
  - Poprawność nawigacji między stronami

### 3.4. Testy wydajnościowe
- **Narzędzia**: Lighthouse, Artillery
- **Zakres**:
  - Czas ładowania strony
  - Wydajność renderowania (CLS, LCP, FID)
  - Zużycie pamięci przy dużych zestawach fiszek
  - Testy obciążeniowe API z wykorzystaniem Artillery

### 3.5. Testy bezpieczeństwa
- **Narzędzia**: OWASP ZAP, Snyk, SonarQube
- **Zakres**:
  - Podatności OWASP Top 10
  - Autoryzacja dostępu do API
  - Bezpieczeństwo przechowywania danych w Supabase
  - Statyczna analiza kodu pod kątem podatności bezpieczeństwa

### 3.6. Testy dostępności (a11y)
- **Narzędzia**: axe-core, Lighthouse
- **Zakres**:
  - Zgodność z WCAG 2.1 AA
  - Obsługa czytników ekranu
  - Kontrast kolorów i responsywność

### 3.7. Testy wizualne i testy komponentów UI
- **Narzędzia**: Storybook, Chromatic
- **Zakres**:
  - Dokumentacja i testowanie komponentów UI w izolacji
  - Testy regresji wizualnej z wykorzystaniem Chromatic
  - Interaktywne testy komponentów UI
  - Weryfikacja zgodności komponentów z projektami

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Generowanie fiszek z wykorzystaniem AI

1. **Walidacja tekstu źródłowego**
   - **ID**: GEN-001
   - **Opis**: Sprawdzenie walidacji długości tekstu źródłowego (min. 1000, max. 10000 znaków)
   - **Priorytet**: Wysoki
   - **Warunki wstępne**: Użytkownik zalogowany
   - **Kroki**:
     1. Wprowadź tekst krótszy niż 1000 znaków
     2. Sprawdź komunikat o błędzie
     3. Wprowadź tekst dłuższy niż 10000 znaków
     4. Sprawdź komunikat o błędzie
     5. Wprowadź tekst o poprawnej długości
     6. Sprawdź aktywację przycisku "Generate Flashcard Proposals"
   - **Oczekiwany wynik**: System poprawnie waliduje długość tekstu i wyświetla odpowiednie komunikaty

2. **Generowanie propozycji fiszek**
   - **ID**: GEN-002
   - **Opis**: Weryfikacja procesu generowania fiszek z poprawnego tekstu źródłowego
   - **Priorytet**: Krytyczny
   - **Warunki wstępne**: Użytkownik zalogowany, wprowadzony tekst o poprawnej długości
   - **Kroki**:
     1. Kliknij przycisk "Generate Flashcard Proposals"
     2. Zweryfikuj wyświetlenie stanu ładowania
     3. Zweryfikuj wyświetlenie wygenerowanych propozycji fiszek
   - **Oczekiwany wynik**: System generuje propozycje fiszek z podanego tekstu i wyświetla je użytkownikowi

3. **Obsługa błędów generowania**
   - **ID**: GEN-003
   - **Opis**: Weryfikacja obsługi błędów podczas generowania fiszek
   - **Priorytet**: Wysoki
   - **Warunki wstępne**: Użytkownik zalogowany, wprowadzony tekst o poprawnej długości
   - **Kroki**:
     1. Symuluj błąd API (np. brak dostępu do usługi AI)
     2. Zweryfikuj wyświetlenie komunikatu o błędzie
   - **Oczekiwany wynik**: System informuje użytkownika o błędzie i umożliwia ponowną próbę

### 4.2. Zarządzanie propozycjami fiszek

1. **Akceptacja propozycji fiszki**
   - **ID**: PROP-001
   - **Opis**: Weryfikacja możliwości akceptacji propozycji fiszki
   - **Priorytet**: Wysoki
   - **Warunki wstępne**: Użytkownik zalogowany, wygenerowane propozycje fiszek
   - **Kroki**:
     1. Kliknij przycisk "Accept" dla wybranej propozycji
     2. Zweryfikuj zmianę statusu fiszki na "accepted"
     3. Zweryfikuj możliwość zapisania zaakceptowanych fiszek
   - **Oczekiwany wynik**: System zmienia status fiszki na "accepted" i umożliwia jej zapisanie

2. **Edycja propozycji fiszki**
   - **ID**: PROP-002
   - **Opis**: Weryfikacja możliwości edycji propozycji fiszki
   - **Priorytet**: Wysoki
   - **Warunki wstępne**: Użytkownik zalogowany, wygenerowane propozycje fiszek
   - **Kroki**:
     1. Kliknij przycisk "Edit" dla wybranej propozycji
     2. Zmodyfikuj tekst na froncie i tyle fiszki
     3. Zweryfikuj walidację długości tekstu (max 200 znaków dla frontu, max 500 dla tyłu)
     4. Zapisz zmiany
     5. Zweryfikuj zmianę statusu fiszki na "edited"
   - **Oczekiwany wynik**: System umożliwia edycję fiszki, waliduje wprowadzone zmiany i aktualizuje status

3. **Odrzucanie propozycji fiszki**
   - **ID**: PROP-003
   - **Opis**: Weryfikacja możliwości odrzucenia propozycji fiszki
   - **Priorytet**: Średni
   - **Warunki wstępne**: Użytkownik zalogowany, wygenerowane propozycje fiszek
   - **Kroki**:
     1. Kliknij przycisk "Reject" dla wybranej propozycji
     2. Zweryfikuj zmianę statusu fiszki na "rejected"
     3. Zweryfikuj, że odrzucone fiszki nie są zapisywane
   - **Oczekiwany wynik**: System zmienia status fiszki na "rejected" i nie uwzględnia jej przy zapisywaniu

### 4.3. Zapisywanie zatwierdzonych fiszek

1. **Zapisywanie fiszek do bazy danych**
   - **ID**: SAVE-001
   - **Opis**: Weryfikacja zapisywania zaakceptowanych/edytowanych fiszek do bazy danych
   - **Priorytet**: Krytyczny
   - **Warunki wstępne**: Użytkownik zalogowany, wygenerowane i zaakceptowane/edytowane propozycje fiszek
   - **Kroki**:
     1. Kliknij przycisk "Save Approved Flashcards"
     2. Zweryfikuj komunikat o sukcesie
     3. Sprawdź, czy tylko zaakceptowane i edytowane fiszki zostały zapisane
   - **Oczekiwany wynik**: System zapisuje tylko zaakceptowane/edytowane fiszki do bazy danych

### 4.4. Autentykacja użytkownika

1. **Rejestracja nowego użytkownika**
   - **ID**: AUTH-001
   - **Opis**: Weryfikacja procesu rejestracji nowego użytkownika
   - **Priorytet**: Wysoki
   - **Warunki wstępne**: Niezalogowany użytkownik
   - **Kroki**:
     1. Przejdź do strony rejestracji
     2. Wprowadź wymagane dane (email, hasło)
     3. Zatwierdź formularz
     4. Zweryfikuj komunikat o wysłaniu maila weryfikacyjnego
   - **Oczekiwany wynik**: System tworzy nowe konto i wysyła email weryfikacyjny

2. **Logowanie użytkownika**
   - **ID**: AUTH-002
   - **Opis**: Weryfikacja procesu logowania istniejącego użytkownika
   - **Priorytet**: Krytyczny
   - **Warunki wstępne**: Zarejestrowany, niezalogowany użytkownik
   - **Kroki**:
     1. Przejdź do strony logowania
     2. Wprowadź poprawne dane (email, hasło)
     3. Zatwierdź formularz
     4. Zweryfikuj przekierowanie do strony głównej
   - **Oczekiwany wynik**: System loguje użytkownika i przekierowuje do strony głównej

## 5. Środowisko testowe

### 5.1. Konfiguracja środowiska

- **Środowisko deweloperskie (DEV)**
  - Lokalne środowisko developerskie
  - Baza danych Supabase w trybie deweloperskim
  - Uruchamiane przez `npm run dev`

- **Środowisko testowe (TEST)**
  - Dedykowana instancja testowa
  - Izolowana baza danych Supabase
  - Deployment przez GitHub Actions

- **Środowisko produkcyjne (PROD)**
  - Hosting na DigitalOcean
  - Produkcyjna baza danych Supabase
  - Deployment przez GitHub Actions po zatwierdzeniu w TEST

### 5.2. Wymagania sprzętowe

- **Frontend**: 
  - Przeglądarki: Chrome, Firefox, Safari, Edge (najnowsze wersje)
  - Urządzenia: Desktop (min. 1024px), Tablet (768px), Mobile (320px)
  - Systemy operacyjne: Windows, macOS, Android, iOS

- **Backend**: 
  - Node.js 20.x
  - Supabase

## 6. Narzędzia do testowania

- **Testy jednostkowe i integracyjne**: Vitest, React Testing Library, MSW, Testing Library Hooks
- **Testy e2e i API**: Playwright, Playwright API Testing
- **Testy komponentów UI**: Storybook, Chromatic
- **Testy wydajnościowe**: Lighthouse, Artillery
- **Testy bezpieczeństwa**: OWASP ZAP, Snyk, SonarQube
- **Testy dostępności**: axe-core, Lighthouse
- **Analiza kodu**: ESLint, TypeScript, SonarQube, Husky (pre-commit hooks)
- **CI/CD**: GitHub Actions

## 7. Harmonogram testów

1. **Testy deweloperskie**
   - Testy jednostkowe przy każdej zmianie kodu (automatyczne uruchamianie)
   - Testy komponentów UI w Storybook podczas rozwoju interfejsu
   - Testy integracyjne przed każdym pull requestem

2. **Testy w środowisku testowym**
   - Testy e2e po każdym wdrożeniu do TEST
   - Testy wizualne w Chromatic przy zmianach w komponentach UI
   - Testy wydajnościowe z Artillery raz w tygodniu
   - Testy bezpieczeństwa raz w miesiącu lub przy istotnych zmianach

3. **Testy przedprodukcyjne**
   - Pełen zestaw testów przed wdrożeniem do produkcji
   - Testy regresji dla kluczowych funkcjonalności
   - Analiza kodu przez SonarQube

## 8. Kryteria akceptacji testów

- **Testy jednostkowe i integracyjne**: 90% pokrycia kodu
- **Testy e2e**: 100% powodzenia dla wszystkich scenariuszy testowych
- **Testy wydajnościowe**: 
  - LCP < 2.5s
  - CLS < 0.1
  - FID < 100ms
  - Lighthouse Performance Score > 90
  - Testy obciążeniowe: odpowiedź API < 1s przy 100 równoczesnych użytkownikach
- **Testy bezpieczeństwa**: Brak krytycznych i wysokich zagrożeń
- **Testy dostępności**: Zgodność z WCAG 2.1 AA
- **Testy wizualne**: Brak niezamierzonych zmian wizualnych w Chromatic

## 9. Role i odpowiedzialności w procesie testowania

- **Deweloperzy**: 
  - Tworzenie testów jednostkowych
  - Dokumentacja komponentów w Storybook
  - Wykonywanie testów lokalnych przed push
  - Analiza i naprawa błędów
  - Monitorowanie wyników SonarQube

- **QA Engineers**: 
  - Projektowanie i wykonywanie testów integracyjnych i e2e
  - Zarządzanie procesem testowania
  - Raportowanie błędów
  - Prowadzenie testów wizualnych w Chromatic
  - Projektowanie testów obciążeniowych w Artillery

- **DevOps**:
  - Konfiguracja i utrzymanie środowiska testowego
  - Automatyzacja procesu testowania w CI/CD

- **Kierownik Projektu**:
  - Zatwierdzanie planów testów
  - Podejmowanie decyzji o wdrożeniu do produkcji
  - Ustalanie priorytetów testowania

## 10. Procedury raportowania błędów

1. **Klasyfikacja błędów**:
   - **Krytyczny**: Błąd uniemożliwiający podstawowe funkcjonowanie aplikacji
   - **Wysoki**: Błąd znacząco ograniczający kluczowe funkcjonalności
   - **Średni**: Błąd wpływający na niektóre funkcjonalności, ale z możliwością obejścia problemu
   - **Niski**: Drobne usterki kosmetyczne, nie wpływające na funkcjonalność

2. **Szablon zgłoszenia błędu**:
   - Tytuł
   - Środowisko (DEV/TEST/PROD)
   - Priorytet (Krytyczny/Wysoki/Średni/Niski)
   - Opis problemu
   - Kroki reprodukcji
   - Oczekiwane zachowanie
   - Rzeczywiste zachowanie
   - Zrzuty ekranu/nagrania (jeśli dostępne)
   - Informacje o urządzeniu/przeglądarce

3. **Cykl życia błędu**:
   - Zgłoszony -> Przypisany -> W trakcie naprawy -> Naprawiony -> Weryfikacja -> Zamknięty

4. **Narzędzia do śledzenia błędów**:
   - GitHub Issues

## 11. Zarządzanie zmianami w planie testów

Plan testów będzie regularnie aktualizowany w następujących sytuacjach:
- Istotne zmiany w wymaganiach lub funkcjonalnościach projektu
- Wprowadzenie nowych technologii lub narzędzi
- Identyfikacja nowych obszarów ryzyka
- Dostosowanie do harmonogramu projektu

Każda zmiana w planie testów będzie dokumentowana z podaniem daty, autora i uzasadnienia zmiany.
