# API Endpoint Implementation Plan: Update Flashcard

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionemu użytkownikowi aktualizację istniejącej fiszki (`flashcard`), której jest właścicielem. Pozwala na częściową lub pełną aktualizację pól `front`, `back` i `source`.

## 2. Szczegóły żądania
- **Metoda HTTP:** `PUT`
- **Struktura URL:** `/api/flashcards/:id`
  - `:id`: Identyfikator UUID fiszki do zaktualizowania.
- **Parametry:**
  - **Wymagane:**
    - `:id` (parametr URL) - UUID fiszki.
  - **Opcjonalne (w Request Body, wymagane co najmniej jedno):**
    - `front` (string, max 200 znaków)
    - `back` (string, max 500 znaków)
    - `source` (enum: `'ai-full'`, `'ai-edited'`, `'manual'`)
- **Request Body:**
  - **Typ zawartości:** `application/json`
  - **Struktura (przykład częściowej aktualizacji):**
    ```json
    {
      "front": "Zaktualizowany tekst awersu",
      "source": "manual"
    }
    ```
  - **Struktura (przykład pełnej aktualizacji):**
    ```json
    {
      "front": "Pełny nowy tekst awersu",
      "back": "Pełny nowy tekst rewersu",
      "source": "ai-edited"
    }
    ```
  - **Walidacja:** Ciało żądania musi zawierać co najmniej jedno z pól: `front`, `back`, `source`.
  - **Ograniczenia:** Pole `generation_id` nie może być aktualizowane przez ten endpoint.

## 3. Wykorzystywane typy
- `src/types.ts`:
  - `FlashcardUpdateDto`: Definiuje dozwolone pola i typy dla ciała żądania (request body). Używany do walidacji Zod.
    - Uwaga: Choć `FlashcardUpdateDto` technicznie zawiera `generation_id`, pole to powinno być pomijane w schemacie walidacji Zod dla tego endpointu.
  - `FlashcardDTO`: Definiuje strukturę zwracanej fiszki w odpowiedzi na pomyślną aktualizację.

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**
  - **Typ zawartości:** `application/json`
  - **Ciało odpowiedzi:** Zaktualizowany obiekt fiszki zgodny z `FlashcardDTO`.
    ```json
    {
      "id": "...",
      "front": "...",
      "back": "...",
      "source": "...",
      "generation_id": ...,
      "created_at": "...",
      "updated_at": "..."
    }
    ```
- **Błędy:**
  - `400 Bad Request`: Nieprawidłowe dane wejściowe (np. błędny format UUID, niespełnione ograniczenia długości, nieprawidłowa wartość `source`, brak pól do aktualizacji). Odpowiedź powinna zawierać szczegóły błędu walidacji Zod.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `404 Not Found`: Fiszka o podanym `id` nie istnieje lub użytkownik nie ma do niej uprawnień (ze względu na RLS).
  - `500 Internal Server Error`: Wystąpił błąd po stronie serwera (np. błąd bazy danych podczas aktualizacji).

## 5. Przepływ danych
1.  **Żądanie:** Klient wysyła żądanie `PUT` na `/api/flashcards/:id` z ciałem JSON zawierającym pola do aktualizacji.
2.  **Routing (Astro):** Astro kieruje żądanie do handlera w `src/pages/api/flashcards/[id].ts`.
3.  **Middleware (Astro):** Sprawdza uwierzytelnienie użytkownika. Jeśli użytkownik nie jest zalogowany, zwraca `401 Unauthorized`. Pobiera `userId` z `context.locals.user.id`.
4.  **Walidacja (Handler):**
    - Handler weryfikuje format `:id` (musi być UUID). Jeśli nie, zwraca `400 Bad Request`.
    - Handler używa Zod do walidacji ciała żądania (`context.request.json()`) zgodnie ze schematem opartym na `FlashcardUpdateDto` (uwzględniając ograniczenia długości, wartości enum dla `source` i wymaganie co najmniej jednego pola). Jeśli walidacja nie powiodła się, zwraca `400 Bad Request` ze szczegółami błędu.
    - Schemat walidacji powinien ignorować pole `generation_id`, nawet jeśli jest ono obecne w danych wejściowych. Można to osiągnąć używając `.pick()` w schemacie Zod, aby wybrać tylko pola `front`, `back` i `source`.
5.  **Wywołanie Usługi (Handler):** Handler wywołuje metodę `flashcardService.updateFlashcard(userId, id, validatedUpdateData)`, przekazując `userId`, `flashcardId` i zwalidowane dane do aktualizacji.
6.  **Logika Biznesowa (Service - `FlashcardService`):**
    - Metoda `updateFlashcard` używa `context.locals.supabase` (przekazanego lub wstrzykniętego do serwisu).
    - Konstruuje zapytanie `UPDATE` do tabeli `flashcards`.
    - Zapytanie `UPDATE` zawiera klauzulę `WHERE id = flashcardId`. Supabase RLS automatycznie doda warunek `AND user_id = auth.uid()`, zapewniając, że tylko właściciel może dokonać aktualizacji. Zapytanie powinno również zwracać zaktualizowany wiersz (`returning('*')` lub podobne).
    - Zapytanie automatycznie zaktualizuje pole `updated_at` (dzięki triggerowi bazodanowemu).
7.  **Obsługa Wyniku Zapytania (Service):**
    - Jeśli zapytanie `UPDATE` nie zwróci żadnego wiersza (np. fiszka nie istnieje lub RLS zablokował dostęp), serwis zgłasza błąd (np. `NotFoundError`), który handler przetłumaczy na `404 Not Found`.
    - Jeśli zapytanie zakończy się sukcesem, serwis mapuje zwrócony wiersz bazy danych na `FlashcardDTO`.
    - Jeśli wystąpi błąd bazy danych, serwis przechwytuje go i zgłasza dalej (np. `DatabaseError`), który handler przetłumaczy na `500 Internal Server Error`.
8.  **Odpowiedź (Handler):**
    - Jeśli serwis zwróci `FlashcardDTO`, handler zwraca odpowiedź `200 OK` z tym DTO jako ciałem JSON.
    - Jeśli serwis zgłosi błąd, handler mapuje go na odpowiedni kod statusu HTTP (404, 500) i zwraca odpowiedź błędu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Obsługiwane przez middleware Astro i integrację Supabase Auth. Punkt końcowy musi być dostępny tylko dla zalogowanych użytkowników.
- **Autoryzacja:** Kluczowa jest poprawna konfiguracja **Row Level Security (RLS)** w Supabase na tabeli `flashcards`. Polityka RLS musi zezwalać na operacje `UPDATE` tylko wtedy, gdy `user_id` wiersza pasuje do `auth.uid()` uwierzytelnionego użytkownika. To zapobiega modyfikowaniu fiszek przez innych użytkowników.
- **Walidacja danych wejściowych:** Stosowanie Zod w handlerze Astro do walidacji parametru `:id` i ciała żądania chroni przed nieprawidłowymi danymi i potencjalnymi atakami (np. przez ograniczenie długości pól `front` i `back`).
- **Ochrona przed nadmiernym użyciem (Rate Limiting):** Rozważyć implementację rate limitingu na poziomie API Gateway lub middleware, aby zapobiec nadużyciom.

## 7. Obsługa błędów
- **Walidacja (400):** Błędy walidacji Zod (format `:id`, typy danych, ograniczenia długości, wartości enum, brak pól w ciele) są zwracane jako `400 Bad Request` ze szczegółowym komunikatem błędu.
- **Uwierzytelnianie (401):** Brak aktywnej sesji użytkownika zwraca `401 Unauthorized`.
- **Autoryzacja/Nie znaleziono (404):** Próba aktualizacji nieistniejącej fiszki lub fiszki nienależącej do użytkownika (ze względu na RLS) skutkuje `404 Not Found`.
- **Błędy serwera (500):** Niespodziewane błędy podczas operacji bazodanowych lub w logice serwisu skutkują `500 Internal Server Error`. Należy logować te błędy po stronie serwera w celu diagnozy.

## 8. Rozważania dotyczące wydajności
- Operacja `UPDATE` na pojedynczym wierszu z użyciem klucza głównego (`id`) i indeksu na `user_id` (dla RLS) powinna być wydajna.
- Głównym czynnikiem wpływającym na wydajność będzie czas odpowiedzi bazy danych Supabase.
- Upewnić się, że indeksy na `flashcards.id` (PK) i `flashcards.user_id` istnieją i są używane.

## 9. Etapy wdrożenia
1.  **Utworzenie/Aktualizacja Usługi:**
    - Upewnij się, że istnieje plik `src/lib/services/flashcard.service.ts`.
    - Zaimplementuj metodę `updateFlashcard(userId: string, flashcardId: string, updateData: FlashcardUpdateDto): Promise<FlashcardDTO>` w `FlashcardService`.
    - Metoda powinna używać `SupabaseClient` do wykonania zapytania `UPDATE` na tabeli `flashcards`.
    - Należy poprawnie obsłużyć przypadki, gdy zapytanie nie zaktualizuje żadnego wiersza (potencjalny 404) lub gdy wystąpi błąd bazy danych (potencjalny 500).
    - Użyj `.update(updateData).eq('id', flashcardId).select().single()` lub podobnej metody klienta Supabase, która wykonuje update i zwraca zaktualizowany wiersz, jednocześnie respektując RLS.
    - Zamapuj wynik na `FlashcardDTO`.
2.  **Konfiguracja RLS (Supabase):**
    - Sprawdź lub utwórz politykę RLS na tabeli `flashcards`, która zezwala na `UPDATE` dla roli `authenticated`, używając warunku `user_id = auth.uid()`.
3.  **Implementacja Handlera API (Astro):**
    - Utwórz plik `src/pages/api/flashcards/[id].ts`.
    - Dodaj `export const prerender = false;`.
    - Zaimplementuj funkcję `export function PUT({ params, request, locals })`.
    - Pobierz `id` z `params.id`.
    - Pobierz `userId` z `locals.user.id` (upewniając się, że `locals.user` istnieje - obsługa przez middleware).
    - Zwaliduj `id` jako UUID.
    - Odczytaj i zwaliduj ciało żądania (`request.json()`) używając schemy Zod opartej na `FlashcardUpdateDto` (z ograniczeniami długości, enum i wymogiem co najmniej jednego pola).
      - Użyj `.pick()` aby wybrać tylko pola `front`, `back` i `source`, odrzucając inne pola (jak `generation_id`), nawet jeśli występują w żądaniu.
    - W przypadku błędów walidacji zwróć `Response` z kodem `400` i szczegółami błędu.
    - Utwórz instancję `FlashcardService`.
    - Wywołaj `flashcardService.updateFlashcard(userId, id, validatedData)`.
    - Obsłuż potencjalne błędy zwrócone przez serwis (mapując je na 404 lub 500).
    - W przypadku sukcesu, zwróć `Response.json(updatedFlashcardDto)` z kodem `200`.
4.  **Definicje Typów:**
    - Upewnij się, że typy `FlashcardUpdateDto` i `FlashcardDTO` w `src/types.ts` są zgodne ze specyfikacją i schemą bazy danych.
5.  **Testowanie:**
    - **Testy jednostkowe (Vitest):** Przetestuj logikę `FlashcardService`, mockując klienta Supabase. Przetestuj walidację Zod.
    - **Testy integracyjne/E2E (Playwright):** Utwórz testy, które symulują wywołanie API `PUT /api/flashcards/:id` z różnymi scenariuszami (poprawna aktualizacja, próba aktualizacji cudzej fiszki, nieprawidłowe dane, brak uwierzytelnienia) i weryfikują kody statusu oraz treść odpowiedzi.