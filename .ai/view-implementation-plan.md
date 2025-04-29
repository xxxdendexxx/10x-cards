# API Endpoint Implementation Plan: List Flashcards

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionemu użytkownikowi pobranie stronicowanej listy fiszek, z możliwością sortowania i filtrowania po źródle. Zwracane są wyłącznie fiszki nieoznaczone jako usunięte (`is_deleted = false`) należące do bieżącego użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: GET  
- URL: `/api/flashcards`  
- Query Parameters:
  - **page** (opcjonalny, domyślnie `1`): numer strony, integer ≥ 1  
  - **pageSize** (opcjonalny, domyślnie `10`): liczba elementów na stronie, integer 1–100  
  - **sortBy** (opcjonalny, domyślnie `created_at`): pole sortowania — dozwolone wartości: `created_at` lub `updated_at`  
  - **filter** (opcjonalny): filtr po źródle fiszek — dozwolone wartości: `ai-full`, `ai-edited`, `manual`  

### Walidacja danych wejściowych
- Zdefiniować Zod schema w `src/lib/schemas/flashcards.schema.ts`:
  ```ts
  import { z } from "zod";

  export const listFlashcardsQuerySchema = z.object({
    page: z
      .coerce.number()
      .int()
      .min(1)
      .default(1),
    pageSize: z
      .coerce.number()
      .int()
      .min(1)
      .max(100)
      .default(10),
    sortBy: z
      .enum(["created_at", "updated_at"])
      .default("created_at"),
    filter: z
      .enum(["ai-full", "ai-edited", "manual"])
      .optional(),
  });
  ```
- Paragraf z walidacją powinien być wykonywany w handlerze przed wywołaniem logiki biznesowej.

## 3. Szczegóły odpowiedzi
- Kod statusu: **200 OK**  
- Body (JSON) zgodne z typem `FlashcardsListResponseDTO`:
  ```json
  {
    "data": [ /* FlashcardDTO[] */ ],
    "pagination": {
      "page": number,
      "pageSize": number,
      "total": number
    }
  }
  ```

### Wykorzystywane typy
- **FlashcardDTO** (z `src/types.ts`):
  ```ts
  export type FlashcardDTO = Pick<
    Flashcard,
    "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
  >;
  ```
- **PaginationDTO** (z `src/types.ts`):
  ```ts
  export interface PaginationDTO {
    page: number;
    limit: number;
    total: number;
  }
  ```

## 4. Przepływ danych
- **POPRAWKA:** zamiast manualnej inicjalizacji klienta Supabase opisuję wykorzystanie `createSupabaseServerInstance()` z pliku `src/db/supabase.client.ts`:
1. **Middleware** (`src/middleware/index.ts`):
   ```ts
   import { createSupabaseServerInstance } from "../db/supabase.client";

   export async function onRequest({ request, cookies, locals }) {
     // Inicjalizacja klienta Supabase przez helper
     const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });
     locals.supabase = supabase;

     // Pobranie uwierzytelnionego użytkownika
     const { data: { user } } = await supabase.auth.getUser();
     locals.user = user;
   }
   ```
   - Użyj `createSupabaseServerInstance({ headers, cookies })` do stworzenia `SupabaseClient` i przypisania go do `locals.supabase`.
   - Pobierz bieżącego użytkownika przez `supabase.auth.getUser()` i zapisz w `locals.user`.

2. **Handler GET** w `src/pages/api/flashcards.ts`:
   - Parsuje `request.url.searchParams`
   - Waliduje je przy pomocy Zod schema
   - Jeżeli walidacja nie powiodła się → zwraca **400 Bad Request**
3. **Wywołanie serwisu** `flashcardsService.listFlashcards(userId, params)`:
   - Tworzy zapytanie do Supabase:
     ```ts
     const { data, count, error } = await supabase
       .from('flashcards')
       .select(
         'id, front, back, source, generation_id, created_at, updated_at',
         { count: 'exact' }
       )
       .eq('user_id', userId)
       .eq('is_deleted', false)
       .maybeFilter('source', params.filter)
       .order(params.sortBy, { ascending: false })
       .range(
         (params.page - 1) * params.pageSize,
         params.page * params.pageSize - 1
       );
     ```
   - Obsługuje błąd połączenia lub zapytania → rzuca wyjątek do handlera
   - Zwraca obiekt zgodny z `FlashcardsListResponseDTO`
4. **Handler** zwraca wynik **200 OK** z `JSON.stringify(responseDto)`.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie**: tylko użytkownicy z ważną sesją Supabase (`401 Unauthorized` w przeciwnym razie).
- **Autoryzacja**: ograniczenie zwracanych fiszek do tych, których `user_id` = `locals.user.id`.
- **Walidacja wejścia**: Zod chroni przed nieprawidłowymi lub podrobionymi parametrami.
- **Ograniczenie wyników**: limit `pageSize` do 100, by zapobiec DoS poprzez ogromne paginacje.

## 6. Obsługa błędów
| Sytuacja                                         | Kod statusu      | Opis                                         |
|--------------------------------------------------|------------------|----------------------------------------------|
| Brak uwierzytelnienia                            | 401 Unauthorized | Użytkownik nie jest zalogowany               |
| Nieprawidłowe parametry (Błąd walidacji Zod)     | 400 Bad Request  | Zwrot szczegółów błędów walidacji            |
| Błąd zapytania do Supabase                       | 500 Internal     | Wejście do logów, zwrot ogólnego komunikatu  |
| Pusta strona (page > totalPages)                 | 200 OK           | `data: []`, paginacja z parametrem `total`   |

> **Uwaga:** Nie stosujemy logów błędów do tabeli `generation_error_logs`, ponieważ endpoint nie generuje treści AI.

## 7. Rozważania dotyczące wydajności
- Indeksy na kolumnach: `user_id`, `is_deleted`, `created_at`.
- Paginacja oparta na `OFFSET`/`LIMIT` — przy bardzo dużych zbiorach można rozważyć cursor-based pagination.
- Ograniczenie `pageSize` chroni serwer przed przeciążeniem.
- Selekcja tylko niezbędnych kolumn minimalizuje transfer danych.

## 8. Kroki implementacji
1. **Schemat Zod**: utworzyć plik `src/lib/schemas/flashcards.schema.ts` z `listFlashcardsQuerySchema`.  
2. **Serwis**: utworzyć/rozszerzyć `src/lib/services/flashcardsService.ts` o metodę `listFlashcards(userId, params)`.  
3. **Endpoint**: utworzyć plik `src/pages/api/flashcards.ts`, zaimplementować handler GET.  
4. **Middleware**: Zaimplementować w `src/middleware/index.ts` wykorzystanie `createSupabaseServerInstance` do inicjalizacji `locals.supabase` oraz przypisania `locals.user`.  
5. **Walidacja**: zaimportować i wywołać `listFlashcardsQuerySchema.safeParse` w handlerze.  
6. **Integracja z serwisem**: wywołać `flashcardsService.listFlashcards` i zmapować wynik do DTO.  
7. **Obsługa odpowiedzi**: zwrócić prawidłowy kod statusu i body.  
8. **Testy**: napisać testy jednostkowe (Vitest) dla schemy i serwisu; testy integracyjne/E2E (Playwright).  