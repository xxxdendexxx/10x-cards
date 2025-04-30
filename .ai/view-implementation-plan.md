# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom "miękkiego" usuwania (soft-delete) własnych fiszek. Usunięcie polega na oznaczeniu fiszki w bazie danych flagą `is_deleted = true`, a nie na fizycznym usunięciu rekordu. Zapewnia to możliwość ewentualnego przywrócenia danych w przyszłości i zachowuje integralność referencyjną (np. powiązania z `generation_id`).

## 2. Szczegóły żądania
- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/flashcards/:id`
- **Parametry:**
  - **Wymagane:**
    - `id` (w ścieżce URL): Identyfikator UUID fiszki do usunięcia.
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- `context.params.id`: String (przed walidacją)
- Zod Schema for UUID validation
- `context.locals.user`: User object from Supabase (provided by middleware)
- `Database["public"]["Tables"]["flashcards"]["Row"]`: Internal representation of the flashcard data from the DB.
- No specific DTOs for request/response body.

## 4. Szczegóły odpowiedzi
- **Sukces:**
  - **Kod statusu:** `204 No Content`
  - **Body:** Brak
- **Błędy:**
  - **Kod statusu:** `400 Bad Request` (niepoprawny format `id`)
  - **Kod statusu:** `401 Unauthorized` (brak uwierzytelnienia)
  - **Kod statusu:** `404 Not Found` (fiszka nie znaleziona lub brak uprawnień)
  - **Kod statusu:** `500 Internal Server Error` (błąd serwera/bazy danych)

## 5. Przepływ danych
1.  Żądanie `DELETE /api/flashcards/:id` trafia do serwera Astro.
2.  Middleware (`src/middleware/index.ts`) weryfikuje sesję użytkownika za pomocą `context.locals.supabase`. Jeśli użytkownik nie jest uwierzytelniony, zwraca `401`. Dane użytkownika (`context.locals.user`) są dostępne dla handlera.
3.  Handler API (`src/pages/api/flashcards/[id].ts`) otrzymuje żądanie.
4.  Handler waliduje parametr `:id` z `context.params.id` używając Zod, sprawdzając, czy jest to poprawny UUID. Jeśli nie, zwraca `400`.
5.  Handler wywołuje metodę `softDeleteFlashcard` w serwisie `FlashcardService` (`src/lib/services/flashcard.service.ts`), przekazując `userId` (z `context.locals.user.id`) i `flashcardId` (zwalidowany `id`).
6.  `FlashcardService` używa klienta Supabase (`context.locals.supabase`) do:
    a.  Znalezienia fiszki w tabeli `flashcards` po `flashcardId`.
    b.  Sprawdzenia, czy fiszka istnieje i czy jej `user_id` zgadza się z przekazanym `userId`. Jeśli nie istnieje lub `user_id` się nie zgadza, serwis zwraca błąd wskazujący na `not_found` lub `unauthorized`.
    c.  Jeśli fiszka istnieje i należy do użytkownika, serwis aktualizuje rekord, ustawiając `is_deleted = true` i aktualizując `updated_at`.
7.  `FlashcardService` zwraca wynik operacji do handlera API.
8.  Handler API:
    - Jeśli operacja w serwisie zakończyła się sukcesem, zwraca odpowiedź `204 No Content`.
    - Jeśli serwis zwrócił błąd `not_found` lub `unauthorized`, handler zwraca `404 Not Found`.
    - Jeśli serwis zwrócił błąd `db_error` lub wystąpił inny nieoczekiwany błąd, handler loguje błąd i zwraca `500 Internal Server Error`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Zapewnione przez middleware Astro i integrację z Supabase Auth. Każde żądanie musi zawierać prawidłowe dane uwierzytelniające.
- **Autoryzacja:** Kluczowa jest weryfikacja w `FlashcardService`, czy `flashcard.user_id` zgadza się z `context.locals.user.id`. Zapobiega to usuwaniu fiszek przez nieuprawnionych użytkowników (IDOR). Zwracanie `404` w przypadku braku uprawnień maskuje istnienie zasobu.
- **Walidacja danych wejściowych:** Sprawdzenie formatu `id` (UUID) zapobiega błędom przetwarzania i potencjalnym atakom.
- **Soft Delete:** Chroni przed przypadkową permanentną utratą danych.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy `id` w URL nie jest poprawnym UUID. Implementacja walidacji w handlerze API przy użyciu Zod.
- **401 Unauthorized:** Zwracany przez middleware lub handler, jeśli brak jest prawidłowej sesji użytkownika.
- **404 Not Found:** Zwracany, gdy fiszka o podanym `id` nie istnieje LUB gdy istnieje, ale nie należy do uwierzytelnionego użytkownika (obsługa w `FlashcardService` i mapowanie w handlerze API).
- **500 Internal Server Error:** Zwracany w przypadku nieoczekiwanych błędów serwera, np. problemów z połączeniem do bazy danych lub błędów podczas operacji `UPDATE`. Błędy te powinny być logowane po stronie serwera.

## 8. Rozważania dotyczące wydajności
- Operacja `UPDATE` na pojedynczym rekordzie w bazie danych PostgreSQL z indeksem na `id` (PRIMARY KEY) i potencjalnie na `user_id` jest zazwyczaj bardzo szybka.
- Wąskie gardła są mało prawdopodobne przy oczekiwanym obciążeniu.
- Upewnić się, że kolumny `id` i `user_id` w tabeli `flashcards` są odpowiednio zindeksowane (co jest standardem dla PRIMARY KEY i FOREIGN KEY).

## 9. Etapy wdrożenia
1.  **Utworzenie/Aktualizacja Serwisu:**
    - W pliku `src/lib/services/flashcard.service.ts` dodać nową metodę asynchroniczną `softDeleteFlashcard(supabase: SupabaseClient, userId: string, flashcardId: string)`.
    - Metoda powinna przyjmować klienta Supabase, ID użytkownika i ID fiszki.
    - Zaimplementować logikę pobrania fiszki (`select().match({ id: flashcardId }).single()`).
    - Dodać sprawdzenie istnienia fiszki i porównanie `flashcard.user_id` z `userId`.
    - Jeśli warunki są spełnione, wykonać operację `update({ is_deleted: true, updated_at: new Date().toISOString() }).match({ id: flashcardId })`.
    - Zwrócić obiekt wskazujący na sukces lub typ błędu (`{ success: true }` lub `{ success: false, error: 'not_found' | 'unauthorized' | 'db_error' }`).
    - Dodać odpowiednie typy TypeScript dla parametrów i zwracanej wartości.
2.  **Utworzenie Handlera API:**
    - Utworzyć plik `src/pages/api/flashcards/[id].ts`.
    - Dodać `export const prerender = false;` zgodnie z `astro.mdc`.
    - Zaimplementować `export async function DELETE({ params, locals }: APIContext)`.
    - Sprawdzić, czy `locals.user` istnieje (jeśli nie, middleware powinien to obsłużyć, ale można dodać dodatkowe zabezpieczenie). `if (!locals.user) { return new Response(null, { status: 401 }); }`
    - Zwalidować `params.id` przy użyciu schemy Zod dla UUID. `const parseResult = z.string().uuid().safeParse(params.id); if (!parseResult.success) { return new Response(null, { status: 400 }); } const flashcardId = parseResult.data;`
    - Wywołać metodę `flashcardService.softDeleteFlashcard(locals.supabase, locals.user.id, flashcardId)`.
    - Na podstawie wyniku zwróconego przez serwis, zwrócić odpowiednią odpowiedź HTTP (`204`, `404`, `500`).
    - W przypadku błędu 500, zalogować szczegóły błędu po stronie serwera.
3.  **Middleware (Weryfikacja):**
    - Upewnić się, że istniejące middleware (`src/middleware/index.ts`) poprawnie obsługuje uwierzytelnianie dla ścieżek `/api/*` i udostępnia `locals.user` oraz `locals.supabase`.
4.  **Testowanie:**
    - Napisać testy jednostkowe dla metody `softDeleteFlashcard` w serwisie (używając mocków dla Supabase).
    - Napisać testy integracyjne/E2E dla endpointu API, obejmujące przypadki:
        - Pomyślne usunięcie przez właściciela.
        - Próba usunięcia nieistniejącej fiszki.
        - Próba usunięcia fiszki przez nieuwierzytelnionego użytkownika.
        - Próba usunięcia fiszki przez innego uwierzytelnionego użytkownika.
        - Próba usunięcia z niepoprawnym formatem ID.
