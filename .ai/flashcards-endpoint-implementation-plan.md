# API Endpoint Implementation Plan: Create Flashcards

## 1. Przegląd punktu końcowego
Punkt końcowy służy do tworzenia jednego lub więcej flashcardów. Może być wykorzystywany zarówno do ręcznej kreacji, jak i zapisywania propozycji flashcardów wygenerowanych przez AI (zarówno `ai-full` jak i `ai-edited`) po zatwierdzeniu przez użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **URL:** /api/flashcards
- **Parametry:**
  - **Wymagane:** 
    - `flashcards`: tablica obiektów flashcard
      - W obrębie każdego obiektu flashcard:
        - `front`: tekst (max 200 znaków)
        - `back`: tekst (max 500 znaków)
        - `source`: jedna z wartości: `ai-full`, `ai-edited`, `manual`
        - `generation_id`: liczba albo null (dla `ai-full` oraz `ai-edited` jest wymagane, dla `manual` powinno być null)
  - **Opcjonalne:** Brak dodatkowych parametrów w treści żądania.
- **Request Body:** 
```json
{
  "flashcards": [
    {
      "front": "string (max 200 characters)",
      "back": "string (max 500 characters)",
      "source": "one of ['ai-full', 'ai-edited', 'manual']",
      "generation_id": "number or null"
    }
  ]
}
```

## 3. Wykorzystywane typy
- **DTO i Command Modele:**
  - `FlashcardCreateDTO`: definiuje pojedynczy flashcard dla operacji tworzenia.
  - `CreateFlashcardCommand`: komenda zawierająca tablicę flashcardów.
  - `FlashcardDTO`: reprezentacja flashcarda zwróconego po operacji tworzenia.
  - Dodatkowe typy pomocnicze, np. `PaginationDTO` i `FlashcardsListResponseDTO` dla przyszłych operacji listowania.

## 4. Szczegóły odpowiedzi
- **Kod Statusu:** 201 (Created) przy poprawnym utworzeniu.
- **Struktura odpowiedzi:** 
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "front": "...",
      "back": "...",
      "source": "...",
      "generation_id": null,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

## 5. Przepływ danych
1. **Walidacja wejścia:** 
   - Walidacja danych wejściowych odbywa się przy użyciu schematów Zod, sprawdzając długość pól `front` (max 200) i `back` (max 500), akceptując tylko dozwolone wartości pola `source`, oraz weryfikując obecność i poprawność `generation_id` w zależności od wartości pola `source`.
2. **Przekazanie danych do warstwy serwisowej:**
   - Po walidacji, dane są przekazane do funkcji serwisowej odpowiedzialnej za interakcję z bazą danych (usługa umieszczona w `src/lib/services`).
   - Serwis powinien obsługiwać tworzenie flashcardów i wiązanie ich z identyfikatorem użytkownika (user_id uzyskiwany z kontekstu sesji Supabase).
3. **Operacja na bazie danych:**
   - Wstawienie rekordów do tabeli `flashcards`. Operacja powinna być wykonana w ramach transakcji (jeśli dotyczy) aby zagwarantować spójność danych.
4. **Zwracanie odpowiedzi:**
   - Po pomyślnym wstawieniu, serwer zwraca odpowiedź z kodem 201 oraz nowo utworzonymi rekordami.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Endpoint wymaga autoryzacji, co oznacza, że tylko zalogowani użytkownicy mogą tworzyć flashcardy.
- **Autoryzacja:** Upewnić się, że dodawany rekord jest powiązany z właściwym użytkownikiem, poprzez weryfikację `user_id` z kontekstu sesji Supabase.
- **Walidacja danych:** Użycie Zod do walidacji danych wejściowych zmniejsza ryzyko wprowadzenia niepoprawnych danych.
- **Ochrona przed SQL Injection:** Korzystać z parametrów zapytań oferowanych przez Supabase lub innego ORM aby zapobiec atakom SQL Injection.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy walidacja danych wejściowych nie przejdzie (np. tekst za długi, błąd w formacie `source` lub niepoprawny `generation_id`).
- **401 Unauthorized:** W przypadku braku autoryzacji użytkownika.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów związanych z bazą danych lub logiką serwerową.
- **Logowanie błędów:** W przypadku błędów krytycznych, zastosować logowanie przy użyciu istniejących mechanizmów logujących, a w razie potrzeby zapisać błąd w tabeli `generation_error_logs` (jeśli dotyczy operacji AI).

## 8. Rozważania dotyczące wydajności
- **Transakcje:** Używanie transakcji podczas wstawiania wielu rekordów jednocześnie zapewnia spójność danych.
- **Walidacja po stronie serwera:** Implementacja walidacji przy użyciu Zod odbywa się szybko i efektywnie.
- **Batch Insert:** Rozważ użycie operacji wsadowego wstawiania flashcardów przy dużej liczbie rekordów, aby zoptymalizować operację na bazie danych.

## 9. Etapy wdrożenia
1. **Utworzenie pliku endpointa:** 
   - Utworzyć plik w katalogu `src/pages/api/flashcards.ts`.
2. **Implementacja walidacji:**
   - Zdefiniować schemat walidacji przy użyciu biblioteki Zod zgodnie z wymaganiami.
3. **Logika serwisowa:**
   - Utworzyć lub rozbudować istniejącą usługę w `src/lib/services` odpowiedzialną za operacje na flashcardach.
   - Zaimplementować funkcję, która pobiera dane z walidacji i wykonuje operację wsadowego wstawiania do bazy danych.
4. **Integracja z Supabase:**
   - Uzyskać identyfikator użytkownika z kontekstu autoryzacji i powiązać go z wstawianymi rekordami.
5. **Obsługa błędów:**
   - Dodać kontrolery błędów, aby odpowiednio reagować na błędy walidacji, autoryzacji lub serwerowe.
