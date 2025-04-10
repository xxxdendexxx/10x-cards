# API Endpoint Implementation Plan: Generate Flashcard Proposals (AI Generation)

## 1. Przegląd punktu końcowego
Endpoint służy do generowania propozycji fiszek za pomocą usługi AI. Umożliwia użytkownikowi przesłanie surowego tekstu, który zostanie wykorzystany do generowania propozycji fiszek. Endpoint:
- Waliduje długość przekazanego tekstu (między 1000 a 10000 znaków).
- Wywołuje zewnętrzny serwis AI do generacji fiszek.
- Rejestruje metadane generacji (np. czas trwania, liczba wygenerowanych fiszek) w tabeli `generations`.
- W przypadku błędów, loguje je w tabeli `generation_error_logs`.
- Zwraća klientowi dane wygenerowanych propozycji bez ich bezpośredniego zapisywania jako fiszki.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **URL:** /api/generate
- **Parametry:**
  - **Wymagane:**
    - `sourceText` (string): Tekst wejściowy dla AI, długość musi wynosić od 1000 do 10000 znaków.
  - **Opcjonalne:** Brak
- **Przykładowy Request Body:**
```json
{
  "sourceText": "Lorem ipsum dolor sit amet, ..." 
}
```

## 3. Wykorzystywane typy
- **GenerateFlashcardProposalsCommand:** Interfejs, który zawiera pole `sourceText`.
- **FlashcardProposalDTO:** Definiuje strukturę propozycji fiszki z polami:
  - `front`: string
  - `back`: string
  - `source`: stała wartość "ai-full"
- **GenerationCreateResponseDTO:** Odpowiedź zawiera:
  - `generation_id`: number
  - `generated_count`: number (w niektórych implementacjach może występować jako "generated_count")
  - `flashcards_proposals`: lista obiektów typu FlashcardProposalDTO
- **FlashcardSource:** Typ definiujący możliwe źródła: "ai-full", "ai-edited", "manual"

## 4. Szczegóły odpowiedzi
- **Status:** 200 OK (przy powodzeniu)
- **Response Body (przykład):**
```json
{
  "generation_id": 123,
  "flashcards_proposals": [
    { "front": "generated front text", "back": "generated back text", "source": "ai-full" }
  ],
  "generated_count": 5
}
```
- **Kody błędów:**
  - 400 Bad Request – gdy `sourceText` nie spełnia wymagań długościowych.
  - 401 Unauthorized – brak autoryzacji użytkownika.
  - 500 Internal Server Error – błędy po stronie serwera, np. niepowodzenie wywołania serwisu AI.

## 5. Przepływ danych
1. Klient wysyła żądanie POST na `/api/generate` z polem `sourceText` w treści żądania.
2. Endpoint weryfikuje, czy długość `sourceText` mieści się w przedziale [1000, 10000] znaków.
3. Użytkownik jest autoryzowany (np. poprzez token sesyjny lub inny mechanizm uwierzytelniania).
4. Endpoint wywołuje zewnętrzny serwis AI (np. `generationservice` ) przesyłając `sourceText` jako dane wejściowe.
5. Po otrzymaniu odpowiedzi od AI, endpoint:
   - Rejestruje metadane generacji w tabeli `generations` (np. model, czas generacji, liczba wygenerowanych propozycji, hash tekstu źródłowego).
   - Zwraca klientowi (zgodne z modelem `GenerationCreateResponseDTO`) wygenerowane propozycje fiszek bez ich zapisywania w tabeli `flashcards_proposals`.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Endpoint powinien być dostępny tylko dla autoryzowanych użytkowników. Zabezpieczenie przez użycie Supabase Auth.
- **Walidacja:** Skrupulatna walidacja długości `sourceText` przez `zod`, aby nie dopuścić do przetwarzania zbyt krótkich lub zbyt długich danych.
- **Sanityzacja danych:** Dbałość o to, aby dane wejściowe były odpowiednio przetwarzane, unikając potencjalnych ataków (np. XSS).
- **Rejestrowanie błędów:** W przypadku wystąpienia błędów, szczególnie podczas wywołania AI, rejestracja błędów w tabeli `generation_error_logs` wraz z identyfikatorem użytkownika.

## 7. Obsługa błędów
- **400 Bad Request:** Gdy `sourceText` nie mieści się w wymaganym zakresie znaków.
- **401 Unauthorized:** Gdy użytkownik nie jest autoryzowany do wykonania operacji.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów, m.in. problemów z serwisem AI lub problemów z bazą danych. 
- Każdy błąd powinien być logowany – w szczególności błędy generacji powinny być zapisywane w `generation_error_logs` z odpowiednimi danymi (np. model, hasz tekstu źródłowego, długość tekstu, komunikat błędu).

## 8. Rozważania dotyczące wydajności
- **Optymalizacja wywołań AI:** Minimalizowanie liczby wywołań do serwisu AI, ewentualne cachowanie wyników dla podobnych zapytań.
- **Monitorowanie wydajności:** Śledzenie czasu odpowiedzi serwisu AI oraz optymalizacja zapytań do bazy danych.
- **Skalowalność:** Upewnienie się, że endpoint działa w sposób asynchroniczny oraz radzi sobie z dużą liczbą równoczesnych żądań.

## 9. Kroki implementacji
1. **Utworzenie endpointu:** Stworzyć plik `/src/pages/api/generate.ts` zgodnie z wytycznymi Astro.
2. **Walidacja wejścia:** Zaimplementować walidację długości `sourceText` przy użyciu `zod` (sprawdzenie, czy liczba znaków mieści się w przedziale [1000, 10000]).
3. **Autoryzacja:** Integracja mechanizmu autoryzacji przez wykorzystanie Supabase Auth
4. **Integracja z AI:** Implementacja logiki wywołania zewnętrznego serwisu AI, przesyłając poprawne dane wejściowe (na etapie developmentu skorzystami z mocków)
5. **Rejestracja metadanych:** Po otrzymaniu odpowiedzi od AI, zapisanie metadanych generacji w tabeli `generations`.
6. **Obsługa błędów:** Implementacja logiki obsługi błędów, w tym rejestrowanie błędów w `generation_error_logs` przy problemach z wywołaniem AI.
7. **Tworzenie odpowiedzi:** Zwrócenie struktury odpowiedzi zgodnej z wymaganiami (status 200 oraz body zawierające generation_id, flashcards_proposals oraz generated_count).
