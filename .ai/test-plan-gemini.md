# Plan Testów Projektu "10x Cards"

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji "10x Cards", narzędzia do nauki opartego na fiszkach, wykorzystującego algorytm powtórek rozłożonych w czasie oraz integrację ze sztuczną inteligencją do generowania treści. Plan ten obejmuje strategię, zakres, zasoby i harmonogram działań testowych mających na celu zapewnienie jakości, funkcjonalności, niezawodności i bezpieczeństwa aplikacji przed jej wdrożeniem. Projekt wykorzystuje nowoczesny stos technologiczny oparty na Astro, React, Supabase i Openrouter.ai.

### 1.2. Cele testowania

Główne cele procesu testowania to:

*   **Weryfikacja funkcjonalności:** Potwierdzenie, że wszystkie funkcje aplikacji działają zgodnie z wymaganiami specyfikacji (PRD) i oczekiwaniami użytkownika.
*   **Zapewnienie jakości:** Identyfikacja i raportowanie defektów w celu ich naprawy przed wydaniem produkcyjnym.
*   **Ocena użyteczności:** Sprawdzenie, czy interfejs użytkownika jest intuicyjny, łatwy w obsłudze i responsywny.
*   **Weryfikacja niezawodności:** Upewnienie się, że aplikacja działa stabilnie w różnych warunkach i pod obciążeniem.
*   **Ocena bezpieczeństwa:** Identyfikacja potencjalnych luk bezpieczeństwa i zapewnienie ochrony danych użytkownika.
*   **Weryfikacja integracji:** Sprawdzenie poprawności działania integracji z usługami zewnętrznymi (Supabase, Openrouter.ai).
*   **Potwierdzenie zgodności:** Upewnienie się, że aplikacja spełnia standardy wydajności, dostępności i kompatybilności przeglądarek.

## 2. Zakres testów

Testowanie obejmie następujące obszary funkcjonalne i niefunkcjonalne aplikacji:

### 2.1. Testy funkcjonalne

*   **Zarządzanie kontem użytkownika:** Rejestracja, logowanie, wylogowanie, resetowanie hasła, zarządzanie profilem.
*   **Zarządzanie taliami fiszek:** Tworzenie, edycja, usuwanie talii.
*   **Zarządzanie fiszkami:**
    *   Ręczne tworzenie, edycja, usuwanie fiszek.
    *   Generowanie fiszek z wykorzystaniem AI (integracja z Openrouter.ai).
*   **Proces nauki:**
    *   Prezentacja fiszek.
    *   Implementacja algorytmu powtórek rozłożonych w czasie (Spaced Repetition System - SRS).
    *   Oznaczanie odpowiedzi (łatwa, dobra, trudna itp.).
    *   Śledzenie postępów nauki.
*   **Interfejs użytkownika (UI):** Nawigacja, układ strony, wyświetlanie danych, interakcje z elementami UI.
*   **API:** Testowanie punktów końcowych API (`./src/pages/api`) pod kątem poprawności żądań i odpowiedzi, obsługi błędów, autoryzacji.
*   **Middleware:** Testowanie logiki middleware (`./src/middleware/index.ts`), np. w kontekście autentykacji i przetwarzania żądań.

### 2.2. Testy niefunkcjonalne

*   **Testy wydajnościowe:** Ocena czasu ładowania stron (szczególnie w kontekście Astro SSG/SSR), responsywności API pod obciążeniem, wydajności zapytań do bazy danych Supabase.
*   **Testy bezpieczeństwa:** Weryfikacja mechanizmów autentykacji i autoryzacji (Supabase Auth, middleware), ochrona przed typowymi atakami webowymi (XSS, CSRF), bezpieczeństwo komunikacji z API (własnym i zewnętrznymi), konfiguracja reguł bezpieczeństwa Supabase.
*   **Testy użyteczności:** Ocena intuicyjności interfejsu, łatwości nawigacji, responsywności na różnych urządzeniach (desktop, mobile).
*   **Testy kompatybilności:** Sprawdzenie poprawnego działania aplikacji w najpopularniejszych przeglądarkach internetowych (Chrome, Firefox, Safari, Edge) i na różnych systemach operacyjnych.
*   **Testy wizualne/regresji wizualnej:** Weryfikacja spójności wyglądu interfejsu na różnych urządzeniach i przeglądarkach, szczególnie w kontekście Tailwind i komponentów Shadcn/ui.
*   **Testy instalacji/wdrożenia:** Weryfikacja poprawności procesu CI/CD (GitHub Actions) i działania aplikacji w środowisku docelowym (DigitalOcean).

### 2.3. Obszary wyłączone z testów (jeśli dotyczy)

*   Na tym etapie (MVP) mogą zostać wyłączone zaawansowane testy obciążeniowe symulujące bardzo dużą liczbę jednoczesnych użytkowników, które zostaną przeprowadzone w późniejszych fazach rozwoju.
*   Szczegółowe testy wewnętrznych mechanizmów Supabase i Openrouter.ai (traktowane jako "czarne skrzynki").

## 3. Typy testów do przeprowadzenia

W celu zapewnienia kompleksowego pokrycia testowego, zostaną zastosowane następujące typy testów:

*   **Testy jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, moduły w `./src/lib`).
    *   **Technologie:** Vitest (preferowany w ekosystemie Vite/Astro), React Testing Library, Storybook (do testowania komponentów UI w izolacji).
    *   **Zakres:** Logika biznesowa (algorytm SRS, helpery), komponenty React (renderowanie, interakcje), funkcje narzędziowe.
*   **Testy integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja poprawności współpracy pomiędzy różnymi modułami systemu.
    *   **Technologie:** Vitest, React Testing Library, Supertest (dla API), Mock Service Worker (MSW) do mockowania API (Supabase, Openrouter.ai).
    *   **Zakres:** Interakcja komponentów React, komunikacja Frontend-Backend (API), integracja z Supabase (mockowana), integracja z Openrouter.ai (mockowana), działanie middleware Astro.
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego, testowanie kompletnych przepływów.
    *   **Technologie:** Playwright (preferowany ze względu na nowocześniejszą architekturę).
    *   **Zakres:** Kluczowe przepływy użytkownika (rejestracja -> logowanie -> tworzenie talii -> dodawanie fiszek (ręczne/AI) -> sesja nauki -> wylogowanie).
*   **Testy API:**
    *   **Cel:** Bezpośrednia weryfikacja punktów końcowych API pod kątem logiki, obsługi danych i bezpieczeństwa.
    *   **Technologie:** Hoppscotch (lżejsza, open source alternatywa dla Postman/Insomnia), Supertest (do zintegrowania testów API w pipeline CI), Pactflow (do testów kontraktowych API).
    *   **Zakres:** Wszystkie endpointy w `./src/pages/api`.
*   **Testy manualne eksploracyjne:**
    *   **Cel:** Nieskryptowane testowanie w celu odkrycia nieoczekiwanych błędów i problemów z użytecznością.
    *   **Technologie:** Przeglądarka, narzędzia deweloperskie przeglądarki, LogRocket (do nagrywania sesji testowych).
    *   **Zakres:** Cała aplikacja, ze szczególnym uwzględnieniem nowych funkcjonalności i obszarów ryzyka.
*   **Testy wydajnościowe:**
    *   **Cel:** Ocena szybkości i responsywności aplikacji.
    *   **Technologie:** Lighthouse CI (do automatyzacji testów wydajnościowych), WebPageTest (do szczegółowej analizy), narzędzia deweloperskie przeglądarki, k6 (do testów obciążeniowych API).
    *   **Zakres:** Czas ładowania kluczowych stron, czas odpowiedzi API.
*   **Testy bezpieczeństwa:**
    *   **Cel:** Identyfikacja luk bezpieczeństwa.
    *   **Technologie:** Narzędzia deweloperskie przeglądarki, skanery bezpieczeństwa (np. OWASP ZAP), Snyk (do skanowania zależności), manualna weryfikacja kodu i konfiguracji.
    *   **Zakres:** Autentykacja, autoryzacja, walidacja danych wejściowych, konfiguracja Supabase RLS (Row Level Security).
*   **Testy regresji (Automated & Manual):**
    *   **Cel:** Zapewnienie, że wprowadzone zmiany (nowe funkcje, poprawki błędów) nie spowodowały pojawienia się nowych błędów w istniejących funkcjonalnościach.
    *   **Technologie:** Uruchomienie istniejących zestawów testów automatycznych (jednostkowych, integracyjnych, E2E), xState (do modelowania i testowania przepływów), selektywne testy manualne.
    *   **Zakres:** Obszary powiązane z wprowadzonymi zmianami oraz kluczowe funkcjonalności aplikacji.
*   **Testy wizualne (Visual Regression Testing):**
    *   **Cel:** Automatyczne wykrywanie niezamierzonych zmian w interfejsie użytkownika.
    *   **Technologie:** Chromatic (preferowany, dobrze zintegrowany ze Storybook), Reg-suit (lżejsza alternatywa).
    *   **Zakres:** Kluczowe strony i komponenty UI.
*   **Monitorowanie produkcji:**
    *   **Cel:** Proaktywne wykrywanie i diagnozowanie problemów w środowisku produkcyjnym.
    *   **Technologie:** Sentry (do śledzenia błędów), LogRocket (do nagrywania sesji użytkowników i analizy UX).
    *   **Zakres:** Wszystkie krytyczne ścieżki aplikacji, kluczowe przepływy użytkownika.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

Poniżej przedstawiono przykładowe, wysokopoziomowe scenariusze testowe. Szczegółowe przypadki testowe zostaną opracowane oddzielnie.

*   **SCN-AUTH-001: Pomyślna rejestracja i logowanie nowego użytkownika**
    *   Kroki: Przejdź do strony rejestracji -> Wypełnij formularz poprawnymi danymi -> Zarejestruj się -> Sprawdź przekierowanie/komunikat sukcesu -> Przejdź do strony logowania -> Zaloguj się używając nowo utworzonych danych -> Sprawdź dostęp do panelu użytkownika.
    *   Oczekiwany rezultat: Użytkownik zostaje pomyślnie zarejestrowany i zalogowany, ma dostęp do chronionych zasobów.
*   **SCN-DECK-001: Tworzenie nowej talii fiszek**
    *   Kroki: Zaloguj się -> Przejdź do sekcji zarządzania taliami -> Kliknij "Utwórz nową talię" -> Wprowadź nazwę i opis -> Zapisz talię -> Sprawdź, czy nowa talia pojawiła się na liście.
    *   Oczekiwany rezultat: Talia zostaje pomyślnie utworzona i jest widoczna dla użytkownika.
*   **SCN-CARD-001: Ręczne dodawanie fiszki do talii**
    *   Kroki: Zaloguj się -> Wybierz istniejącą talię -> Kliknij "Dodaj fiszkę" -> Wprowadź treść awersu i rewersu -> Zapisz fiszkę -> Sprawdź, czy fiszka została dodana do talii.
    *   Oczekiwany rezultat: Fiszka zostaje pomyślnie dodana do wybranej talii.
*   **SCN-CARD-002: Generowanie fiszek przy użyciu AI**
    *   Kroki: Zaloguj się -> Wybierz istniejącą talię -> Kliknij opcję generowania fiszek AI -> Wprowadź temat/tekst źródłowy -> Uruchom generowanie -> Poczekaj na zakończenie procesu -> Sprawdź, czy nowe fiszki (zgodne z tematem) zostały dodane do talii.
    *   Oczekiwany rezultat: Fiszki zostają wygenerowane przez AI na podstawie podanego wejścia i dodane do talii. Należy również przetestować obsługę błędów (np. błąd API Openrouter.ai).
*   **SCN-LEARN-001: Przeprowadzenie sesji nauki**
    *   Kroki: Zaloguj się -> Wybierz talię do nauki -> Rozpocznij sesję -> Przeglądaj prezentowane fiszki -> Oznaczaj odpowiedzi (np. "łatwa", "trudna") -> Zakończ sesję -> Sprawdź aktualizację postępów nauki.
    *   Oczekiwany rezultat: Użytkownik może przeprowadzić sesję nauki, algorytm SRS poprawnie planuje kolejne powtórki na podstawie odpowiedzi użytkownika.
*   **SCN-API-001: Testowanie endpointu pobierania talii użytkownika**
    *   Kroki: Wygeneruj token JWT dla zalogowanego użytkownika -> Wyślij żądanie GET do odpowiedniego endpointu API z nagłówkiem autoryzacyjnym -> Sprawdź kod odpowiedzi (200 OK) -> Sprawdź, czy odpowiedź zawiera listę talii należących do danego użytkownika.
    *   Oczekiwany rezultat: API zwraca poprawną listę talii dla autoryzowanego użytkownika. Należy również przetestować przypadki braku autoryzacji (401/403).

## 5. Środowisko testowe

*   **Środowisko deweloperskie (Lokalne):** Do uruchamiania testów jednostkowych i integracyjnych podczas rozwoju.
*   **Środowisko testowe/stagingowe:** Odizolowane środowisko naśladujące środowisko produkcyjne, hostowane na DigitalOcean lub podobnej platformie. Połączone z oddzielną instancją Supabase (lub dedykowanym schematem w bazie danych) do celów testowych. Na tym środowisku będą uruchamiane testy E2E, testy API, testy manualne i wydajnościowe. Dane w tym środowisku powinny być regularnie czyszczone lub resetowane.
*   **Środowisko produkcyjne:** Testy na produkcji będą ograniczone do minimum (smoke tests po wdrożeniu), aby nie zakłócać działania usługi dla rzeczywistych użytkowników.

## 6. Narzędzia do testowania

*   **Frameworki do testów jednostkowych/integracyjnych:** Vitest (preferowany w ekosystemie Vite/Astro).
*   **Biblioteka do testowania komponentów React:** React Testing Library.
*   **Narzędzia do testowania komponentów UI:** Storybook (do izolowanego testowania komponentów).
*   **Framework do testów E2E:** Playwright (preferowany ze względu na nowocześniejszą architekturę).
*   **Narzędzia do testowania API:** Hoppscotch (open source), Supertest (do integracji w CI), Pactflow (testy kontraktowe).
*   **Mockowanie API:** Mock Service Worker (MSW).
*   **Testy wydajnościowe:** Lighthouse CI, WebPageTest, k6 (do testów obciążeniowych API).
*   **Testy wizualne:** Chromatic (zintegrowany ze Storybook), Reg-suit (lżejsza alternatywa).
*   **System zarządzania testami (TMS):** QA Wolf (bardziej nowoczesne rozwiązanie), GitHub Projects z rozszerzeniami (jeśli używany jest GitHub).
*   **System śledzenia błędów (Bug Tracking):** GitHub Issues z rozszerzeniami (jeśli używany jest GitHub), Jira (alternatywnie).
*   **Platforma CI/CD:** GitHub Actions (do automatycznego uruchamiania testów).
*   **Monitorowanie produkcji:** Sentry (do śledzenia błędów), LogRocket (do nagrywania sesji).
*   **Modelowanie przepływów:** xState (do modelowania i testowania złożonych przepływów).
*   **Skanery bezpieczeństwa:** Snyk (do sprawdzania zależności), OWASP ZAP.

## 7. Harmonogram testów

Harmonogram testów będzie ściśle powiązany z harmonogramem rozwoju projektu (sprintami).

*   **Testy jednostkowe i integracyjne:** Pisane i uruchamiane ciągle przez deweloperów podczas kodowania nowych funkcji i refaktoryzacji. Uruchamiane automatycznie w pipeline CI przed każdym mergem do głównej gałęzi.
*   **Testy API:** Wykonywane po zaimplementowaniu lub modyfikacji endpointów API. Mogą być częściowo zautomatyzowane i włączone do CI.
*   **Testy E2E:** Rozwijane równolegle z implementacją kluczowych przepływów użytkownika. Uruchamiane automatycznie w pipeline CI/CD na środowisku stagingowym przed wdrożeniem na produkcję.
*   **Testy manualne eksploracyjne:** Przeprowadzane przed końcem sprintu/wydania na środowisku stagingowym.
*   **Testy regresji:** Uruchamiane przed każdym wydaniem (automatyczne) oraz selektywnie manualnie.
*   **Testy wydajnościowe i bezpieczeństwa:** Przeprowadzane okresowo (np. przed większymi wydaniami) lub ad-hoc w przypadku podejrzenia problemów.
*   **Testy akceptacyjne użytkownika (UAT):** (Opcjonalnie, jeśli dotyczy) Przeprowadzane przez interesariuszy/testerów biznesowych przed finalnym zatwierdzeniem wydania.

Dokładne daty będą ustalane w ramach planowania sprintów.

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia (Rozpoczęcie testów)

*   Kod źródłowy jest dostępny w repozytorium.
*   Aplikacja jest wdrożona na środowisku testowym/stagingowym.
*   Podstawowa dokumentacja (np. opis API, kluczowe przepływy) jest dostępna.
*   Środowisko testowe jest stabilne i skonfigurowane.
*   Wszystkie testy jednostkowe i podstawowe testy integracyjne przechodzą pomyślnie w CI.

### 8.2. Kryteria wyjścia (Zakończenie testów)

*   Wszystkie zaplanowane scenariusze testowe zostały wykonane.
*   Osiągnięto zdefiniowany poziom pokrycia kodu testami (np. >80% dla testów jednostkowych/integracyjnych - do ustalenia z zespołem).
*   Wszystkie krytyczne (Critical) i wysokie (High) błędy zostały naprawione i zweryfikowane.
*   Liczba znanych błędów o niskim priorytecie (Low/Medium) jest na akceptowalnym poziomie (zgodnie z decyzją zespołu/produktu).
*   Testy regresji zakończyły się pomyślnie.
*   Dokumentacja testowa (wyniki testów, raporty błędów) jest kompletna i zaktualizowana.
*   Plan testów został zrealizowany.

## 9. Role i odpowiedzialności w procesie testowania

*   **Deweloperzy:**
    *   Pisanie i utrzymanie testów jednostkowych i integracyjnych.
    *   Naprawianie błędów zgłoszonych przez QA/zespół.
    *   Uczestnictwo w przeglądach kodu pod kątem testowalności.
    *   Podstawowe testowanie własnych funkcji przed przekazaniem do QA.
*   **Inżynier QA (Tester):**
    *   Tworzenie i utrzymanie planu testów oraz strategii testowania.
    *   Projektowanie, implementacja i utrzymanie testów automatycznych (E2E, API, wizualne).
    *   Wykonywanie testów manualnych (eksploracyjnych, funkcjonalnych, regresji).
    *   Raportowanie, śledzenie i weryfikacja błędów.
    *   Przygotowywanie raportów z postępu i wyników testów.
    *   Zarządzanie środowiskiem testowym (we współpracy z DevOps/deweloperami).
    *   Analiza wymagań pod kątem testowalności.
*   **Product Owner/Manager:**
    *   Definiowanie kryteriów akceptacji dla funkcji.
    *   Priorytetyzacja błędów.
    *   Uczestnictwo w testach akceptacyjnych użytkownika (UAT), jeśli dotyczy.
    *   Podejmowanie decyzji o wydaniu produktu na podstawie wyników testów.
*   **DevOps/Inżynier Platformy (jeśli dotyczy):**
    *   Konfiguracja i utrzymanie środowisk testowych i produkcyjnych.
    *   Konfiguracja i utrzymanie pipeline'ów CI/CD, w tym integracja automatycznych testów.

## 10. Procedury raportowania błędów

*   **Narzędzie:** Wszystkie błędy będą raportowane i śledzone w systemie śledzenia błędów (np. GitHub Issues, Jira).
*   **Format zgłoszenia błędu:** Każde zgłoszenie powinno zawierać:
    *   **Tytuł:** Krótki, zwięzły opis problemu.
    *   **Środowisko:** Gdzie zaobserwowano błąd (np. Staging, Produkcja, konkretna przeglądarka/system).
    *   **Kroki do reprodukcji:** Szczegółowa lista kroków pozwalająca na odtworzenie błędu.
    *   **Obserwowany rezultat:** Co się stało po wykonaniu kroków.
    *   **Oczekiwany rezultat:** Co powinno się stać zgodnie z wymaganiami/oczekiwaniami.
    *   **Priorytet/Waga:** Ocena wpływu błędu na system (np. Krytyczny, Wysoki, Średni, Niski).
    *   **Załączniki:** Zrzuty ekranu, nagrania wideo, logi (jeśli to możliwe i pomocne).
    *   **Przypisanie:** Początkowo może być nieprzypisane lub przypisane do lidera zespołu/QA do weryfikacji.
*   **Cykl życia błędu:**
    1.  `New/Open`: Nowo zgłoszony błąd.
    2.  `In Analysis/Triage`: Błąd jest analizowany, potwierdzana jest jego zasadność i ustalany priorytet.
    3.  `Accepted/To Do`: Błąd zaakceptowany do naprawy.
    4.  `In Progress`: Deweloper pracuje nad naprawą błędu.
    5.  `Ready for QA/Resolved`: Deweloper zakończył naprawę, błąd gotowy do weryfikacji przez QA.
    6.  `In QA/Testing`: QA weryfikuje poprawkę na środowisku testowym.
    7.  `Closed/Done`: Poprawka zweryfikowana pomyślnie.
    8.  `Reopened`: Jeśli weryfikacja nie powiodła się, błąd wraca do dewelopera.
    9.  `Rejected/Won't Fix`: Jeśli błąd zostanie odrzucony (np. nie jest błędem, duplikat, nie będzie naprawiany).
*   **Komunikacja:** Wszelkie niejasności dotyczące zgłoszeń błędów powinny być wyjaśniane bezpośrednio między QA a deweloperem lub na spotkaniach zespołu.