# Plan implementacji widoku: Lista Fiszek

## 1. Przegląd
Widok "Lista Fiszek" umożliwia zalogowanym użytkownikom przeglądanie, edytowanie i usuwanie własnych fiszek. Wyświetla fiszki w formie listy z podziałem na strony (paginacja) i zapewnia interfejs do zarządzania nimi poprzez modal edycji oraz dialog potwierdzenia usunięcia. Widok jest kluczowym elementem zarządzania fiszkami zgodnie z historyjką użytkownika US-003.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/flashcards`. Dostęp do tej ścieżki powinien być chroniony i wymagać zalogowania użytkownika. Niezalogowani użytkownicy powinni być przekierowywani do strony logowania.

## 3. Struktura komponentów
Hierarchia komponentów React zagnieżdżonych w stronie Astro:

```
FlashcardsPage (Astro /src/pages/flashcards.astro)
└── FlashcardsListView (React /src/components/FlashcardsListView.tsx)
    ├── FlashcardsList (/src/components/FlashcardsList.tsx)
    │   └── FlashcardItem (mapowane) (/src/components/FlashcardItem.tsx)
    │       ├── Button (Edytuj - Shadcn)
    │       └── Button (Usuń - Shadcn)
    ├── PaginationControls (/src/components/PaginationControls.tsx) (Shadcn Pagination)
    ├── EditFlashcardModal (/src/components/EditFlashcardModal.tsx) (Shadcn Dialog)
    │   └── FlashcardEditForm (react-hook-form + Shadcn Form)
    │       ├── Input (Przód - Shadcn)
    │       ├── Textarea (Tył - Shadcn)
    │       └── Button (Zapisz - Shadcn)
    └── DeleteConfirmationDialog (/src/components/DeleteConfirmationDialog.tsx) (Shadcn AlertDialog)
        ├── Button (Potwierdź usunięcie - Shadcn)
        └── Button (Anuluj - Shadcn)
```

## 4. Szczegóły komponentów

### `FlashcardsPage` (Astro)
-   **Opis:** Główny kontener strony Astro. Renderuje layout i osadza główny komponent React (`FlashcardsListView`). Odpowiada za wstępną weryfikację autentykacji po stronie serwera i ewentualne przekierowanie.
-   **Główne elementy:** `<Layout>`, `<FlashcardsListView client:load>` (lub inna dyrektywa Astro).
-   **Obsługiwane interakcje:** Brak bezpośrednich.
-   **Obsługiwana walidacja:** Sprawdzenie `Astro.locals.user` i przekierowanie, jeśli użytkownik nie jest zalogowany.
-   **Typy:** Brak.
-   **Propsy:** Brak.

### `FlashcardsListView` (React)
-   **Opis:** Główny komponent React zarządzający stanem widoku listy fiszek. Odpowiada za pobieranie danych, obsługę paginacji, inicjowanie akcji edycji i usuwania, zarządzanie widocznością modali oraz komunikację z API. Zaleca się użycie customowego hooka (`useFlashcardsData`) do enkapsulacji logiki.
-   **Główne elementy:** `<FlashcardsList>`, `<PaginationControls>`, `<EditFlashcardModal>`, `<DeleteConfirmationDialog>`, logika ładowania/błędów.
-   **Obsługiwane interakcje:** Zmiana strony paginacji, kliknięcie "Edytuj" na fiszce, kliknięcie "Usuń" na fiszce, zapisanie zmian w modalu edycji, potwierdzenie usunięcia w dialogu.
-   **Obsługiwana walidacja:** Brak bezpośredniej (delegacja do API i modalu).
-   **Typy:** Wewnętrzny stan (zarządzany przez hook): `FlashcardDTO[]`, `PaginationDTO`, `boolean` (loading), `Error | null`, `FlashcardDTO | null` (editing), `number | null` (deleting), `boolean` (modal/dialog open states).
-   **Propsy:** Brak (pobiera dane samodzielnie).

### `FlashcardsList` (React)
-   **Opis:** Komponent odpowiedzialny za renderowanie listy fiszek na podstawie przekazanych danych. Iteruje po tablicy fiszek i renderuje `FlashcardItem` dla każdej z nich.
-   **Główne elementy:** Kontener listy (np. `div` z `grid`/`flex`), mapowanie `flashcards` do `<FlashcardItem>`.
-   **Obsługiwane interakcje:** Brak (przekazuje zdarzenia w górę).
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** `FlashcardDTO[]`.
-   **Propsy:**
    -   `flashcards: FlashcardDTO[]`
    -   `onEdit: (id: number) => void`
    -   `onDelete: (id: number) => void`

### `FlashcardItem` (React)
-   **Opis:** Reprezentuje pojedynczą fiszkę w liście. Wyświetla jej przód i tył oraz przyciski akcji "Edytuj" i "Usuń". Używa komponentu `Card` z Shadcn/ui.
-   **Główne elementy:** `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Button` (Edit), `Button` (Delete).
-   **Obsługiwane interakcje:** Kliknięcie przycisku "Edytuj", kliknięcie przycisku "Usuń". Wywołuje odpowiednie callbacki (`onEdit`, `onDelete`) przekazując ID fiszki.
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** `FlashcardDTO`.
-   **Propsy:**
    -   `flashcard: FlashcardDTO`
    -   `onEdit: (id: number) => void`
    -   `onDelete: (id: number) => void`

### `EditFlashcardModal` (React)
-   **Opis:** Modal (Shadcn `Dialog`) zawierający formularz (Shadcn `Form` + `react-hook-form`) do edycji pól "przód" i "tył" wybranej fiszki. Implementuje walidację inline i obsługuje zapis/anulowanie.
-   **Główne elementy:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Form`, `FormField`, `Input` (dla `front`), `Textarea` (dla `back`), `Button` (Save), `Button` (Cancel/Close).
-   **Obsługiwane interakcje:** Wprowadzanie tekstu w polach formularza, kliknięcie "Zapisz", kliknięcie "Anuluj" lub zamknięcie modala.
-   **Obsługiwana walidacja:** (Użycie `react-hook-form` z `zodResolver`):
    -   `front`: Wymagane, Maksymalna długość: 200 znaków.
    -   `back`: Wymagane, Maksymalna długość: 500 znaków.
    -   Wyświetlanie błędów walidacji przy polach formularza.
-   **Typy:** `FlashcardDTO` (dla wartości początkowych), `FlashcardUpdateDto` (dla danych do zapisu), `FlashcardEditFormValues` (stan formularza `react-hook-form`).
-   **Propsy:**
    -   `isOpen: boolean`
    -   `flashcard: FlashcardDTO | null` (Fiszka do edycji)
    *   `onSave: (id: number, data: FlashcardUpdateDto) => Promise<void>` (asynchroniczna funkcja zapisu)
    -   `onCancel: () => void`
    *   `isLoading: boolean` (do wyłączenia przycisku Zapisz podczas zapisu)

### `DeleteConfirmationDialog` (React)
-   **Opis:** Dialog potwierdzenia (Shadcn `AlertDialog`) wyświetlany przed usunięciem fiszki.
-   **Główne elementy:** `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction` (Confirm), `AlertDialogCancel`.
-   **Obsługiwane interakcje:** Kliknięcie "Potwierdź usunięcie", kliknięcie "Anuluj".
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** Brak.
-   **Propsy:**
    -   `isOpen: boolean`
    *   `onConfirm: () => Promise<void>` (asynchroniczna funkcja potwierdzenia)
    -   `onCancel: () => void`
    *   `isLoading: boolean` (do wyłączenia przycisku Potwierdź podczas usuwania)

### `PaginationControls` (React)
-   **Opis:** Komponent do nawigacji między stronami listy fiszek. Używa komponentu `Pagination` z Shadcn/ui.
-   **Główne elementy:** `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationPrevious`, `PaginationLink`, `PaginationEllipsis`, `PaginationNext`.
-   **Obsługiwane interakcje:** Kliknięcie przycisków nawigacji (Previous, Next, numery stron).
-   **Obsługiwana walidacja:** Brak (logika paginacji zarządzana przez rodzica).
-   **Typy:** `PaginationDTO`.
-   **Propsy:**
    -   `pagination: PaginationDTO`
    -   `onPageChange: (page: number) => void`

## 5. Typy
Kluczowe typy danych używane w widoku (większość zdefiniowana w `src/types.ts`):

-   **`FlashcardDTO`**: Reprezentuje pojedynczą fiszkę pobraną z API.
    ```typescript
    type FlashcardDTO = {
      id: number;
      front: string;
      back: string;
      source: "ai-full" | "ai-edited" | "manual";
      generation_id: number | null;
      created_at: string; // ISO Date string
      updated_at: string; // ISO Date string
    };
    ```
-   **`PaginationDTO`**: Zawiera informacje o paginacji.
    ```typescript
    interface PaginationDTO {
      page: number;
      pageSize: number;
      total: number;
    }
    ```
-   **`FlashcardsListResponseDTO`**: Struktura odpowiedzi z API `GET /api/flashcards`.
    ```typescript
    interface FlashcardsListResponseDTO {
      data: FlashcardDTO[];
      pagination: PaginationDTO;
    }
    ```
-   **`FlashcardUpdateDto`**: Payload dla żądania `PUT /api/flashcards/{id}`. W tym widoku edytujemy tylko `front` i `back`.
    ```typescript
    type FlashcardUpdateDto = Partial<{
      front: string;
      back: string;
      // source and generation_id likely not editable here
    }>;
    ```
-   **`FlashcardEditFormValues` (ViewModel - Custom)**: Typ dla `react-hook-form` w modalu edycji.
    ```typescript
    type FlashcardEditFormValues = {
      front: string;
      back: string;
    };
    ```
-   **`FlashcardsListViewState` (ViewModel - Custom)**: Przybliżony kształt stanu zarządzanego w `FlashcardsListView` lub hooku `useFlashcardsData`.
    ```typescript
    type FlashcardsListViewState = {
      flashcards: FlashcardDTO[];
      pagination: PaginationDTO;
      isLoading: boolean;
      error: Error | string | null;
      editingFlashcard: FlashcardDTO | null;
      deletingFlashcardId: number | null;
      isEditModalOpen: boolean;
      isDeleteDialogOpe: boolean;
      currentPage: number;
    };
    ```

## 6. Zarządzanie stanem
Stan widoku (lista fiszek, paginacja, stan ładowania, błędy, stan modali) będzie zarządzany w komponencie `FlashcardsListView`.

Zalecane jest stworzenie **customowego hooka `useFlashcardsData`**:
-   **Cel:** Zamknięcie logiki pobierania danych (fetch), paginacji, obsługi edycji (otwieranie modala, wywoływanie API `PUT`), obsługi usuwania (otwieranie dialogu, wywoływanie API `DELETE`) oraz zarządzania stanami `isLoading`, `error`, `currentPage`, `modal/dialog open`.
-   **Implementacja:** Hook używałby `useState` i `useEffect` (lub biblioteki do fetchingu jak `swr` lub `react-query`) do zarządzania danymi i efektami ubocznymi (API calls).
-   **Zwracane wartości:** Obiekt zawierający: `flashcards`, `pagination`, `isLoading`, `error`, `currentPage`, `editFlashcard` (funkcja), `deleteFlashcard` (funkcja), `saveEdit` (funkcja), `confirmDelete` (funkcja), `changePage` (funkcja), `currentlyEditing` (FlashcardDTO | null), `currentlyDeleting` (number | null), `isEditModalOpen`, `isDeleteDialogOpen`, `openEditModal`, `closeEditModal`, `openDeleteDialog`, `closeDeleteDialog`.

## 7. Integracja API
Komponent `FlashcardsListView` (lub hook `useFlashcardsData`) będzie komunikował się z następującymi endpointami API:

-   **`GET /api/flashcards`**:
    -   **Cel:** Pobranie listy fiszek dla bieżącej strony.
    -   **Parametry:** `page` (numer strony), `pageSize` (liczba elementów na stronę, np. 10), opcjonalnie `sortBy=created_at`, `sortOrder=desc`.
    -   **Typ odpowiedzi:** `FlashcardsListResponseDTO`.
    -   **Wywołanie:** Przy montowaniu komponentu i przy zmianie strony (`currentPage`).
-   **`PUT /api/flashcards/{id}`**:
    -   **Cel:** Zaktualizowanie fiszki o podanym `id`.
    -   **Parametry:** `id` w ścieżce.
    -   **Typ żądania (Body):** `FlashcardUpdateDto` (zawierające `front` i `back`).
    -   **Typ odpowiedzi:** Prawdopodobnie zaktualizowany `FlashcardDTO` lub status 200 OK.
    -   **Wywołanie:** Po zatwierdzeniu formularza w `EditFlashcardModal`.
-   **`DELETE /api/flashcards/{id}`**:
    -   **Cel:** Usunięcie fiszki o podanym `id`.
    -   **Parametry:** `id` w ścieżce.
    -   **Typ odpowiedzi:** Status 200 OK lub 204 No Content.
    -   **Wywołanie:** Po potwierdzeniu w `DeleteConfirmationDialog`.

Wszystkie żądania muszą zawierać odpowiednie nagłówki autoryzacyjne (obsługiwane przez mechanizm fetch/middleware Astro). Należy używać `fetch` API lub dedykowanej biblioteki (`swr`, `react-query`).

## 8. Interakcje użytkownika
-   **Przeglądanie listy:** Użytkownik widzi listę fiszek. Może użyć kontrolek paginacji do nawigacji.
-   **Edycja fiszki:**
    1.  Kliknięcie przycisku "Edytuj" na `FlashcardItem`.
    2.  Otwarcie `EditFlashcardModal` z danymi fiszki.
    3.  Modyfikacja pól "przód" i/lub "tył".
    4.  Kliknięcie "Zapisz".
    5.  Wysyłanie żądania `PUT`.
    6.  Po sukcesie: zamknięcie modala, odświeżenie listy (lub aktualizacja lokalna).
    7.  Przy błędzie: wyświetlenie komunikatu w modalu.
-   **Anulowanie edycji:** Kliknięcie "Anuluj" lub zamknięcie modala.
-   **Usuwanie fiszki:**
    1.  Kliknięcie przycisku "Usuń" na `FlashcardItem`.
    2.  Otwarcie `DeleteConfirmationDialog`.
    3.  Kliknięcie "Potwierdź usunięcie".
    4.  Wysyłanie żądania `DELETE`.
    5.  Po sukcesie: zamknięcie dialogu, odświeżenie listy.
    6.  Przy błędzie: wyświetlenie komunikatu.
-   **Anulowanie usuwania:** Kliknięcie "Anuluj" w dialogu.
-   **Paginacja:** Kliknięcie kontrolek paginacji powoduje pobranie i wyświetlenie danych dla nowej strony.

## 9. Warunki i walidacja
-   **Autentykacja:** Widok dostępny tylko dla zalogowanych użytkowników (weryfikacja w Astro i na API).
-   **Walidacja formularza edycji (`EditFlashcardModal`):**
    -   Pole `front` nie może być puste i nie może przekraczać 200 znaków.
    -   Pole `back` nie może być puste i nie może przekraczać 500 znaków.
    -   Walidacja przeprowadzana za pomocą `react-hook-form` i schemy Zod (lub równoważnej), z błędami wyświetlanymi inline przy polach. Przycisk "Zapisz" powinien być nieaktywny, jeśli formularz jest nieważny lub trwa zapisywanie.
-   **Potwierdzenie usunięcia:** Operacja usunięcia wymaga dodatkowego potwierdzenia w `DeleteConfirmationDialog`.

## 10. Obsługa błędów
-   **Błąd pobierania listy (GET):** Wyświetlenie komunikatu błędu (np. "Nie udało się załadować fiszek. Spróbuj ponownie.") zamiast listy. Można dodać przycisk "Spróbuj ponownie".
-   **Błąd aktualizacji (PUT):** Wyświetlenie komunikatu błędu w `EditFlashcardModal` (np. "Nie udało się zapisać zmian."). Należy rozróżnić błędy walidacji (400) od błędów serwera (500).
-   **Błąd usuwania (DELETE):** Wyświetlenie komunikatu błędu (np. używając `toast` z Shadcn lub w dedykowanym miejscu widoku).
-   **Brak fiszek:** Jeśli API zwróci pustą listę (`total: 0`), należy wyświetlić informację dla użytkownika (np. "Nie masz jeszcze żadnych fiszek. Utwórz nową!").
-   **Błędy 401/403 (Unauthorized/Forbidden):** Przekierowanie użytkownika do strony logowania.
-   **Błędy 404 (Not Found) na PUT/DELETE:** Mało prawdopodobne przy operacjach na liście, ale defensywnie można obsłużyć, informując użytkownika i odświeżając listę.

## 11. Kroki implementacji
1.  **Utworzenie strony Astro (`/src/pages/flashcards.astro`):** Skonfiguruj routing, dodaj podstawowy layout i mechanizm sprawdzania autentykacji z przekierowaniem. Osadź pusty komponent React `FlashcardsListView` z dyrektywą `client:load`.
2.  **Stworzenie komponentu `FlashcardsListView.tsx`:** Dodaj podstawową strukturę, stan ładowania i błędu.
3.  **Implementacja pobierania danych (GET):** W `FlashcardsListView` (lub hooku `useFlashcardsData`), zaimplementuj logikę pobierania danych z `GET /api/flashcards` przy użyciu `useEffect` lub `swr`/`react-query`. Obsłuż stany ładowania i błędu.
4.  **Stworzenie komponentów `FlashcardsList.tsx` i `FlashcardItem.tsx`:** Zaimplementuj renderowanie listy na podstawie pobranych danych, używając `Card` z Shadcn. Dodaj przyciski "Edytuj" i "Usuń" (na razie bez logiki).
5.  **Implementacja paginacji:** Dodaj komponent `PaginationControls.tsx` używając `Pagination` z Shadcn. Połącz go ze stanem `currentPage` i funkcją `onPageChange` w `FlashcardsListView` (lub hooku), która będzie aktualizować stan i ponownie pobierać dane dla nowej strony.
6.  **Stworzenie komponentu `EditFlashcardModal.tsx`:** Zaimplementuj modal z formularzem (`Dialog`, `Form`, `Input`, `Textarea` z Shadcn). Użyj `react-hook-form` i `zodResolver` do zarządzania stanem formularza i walidacją (pola `front`, `back`).
7.  **Implementacja logiki edycji:** Połącz przycisk "Edytuj" w `FlashcardItem` z funkcją w `FlashcardsListView`, która otworzy `EditFlashcardModal` i przekaże dane fiszki. Zaimplementuj funkcję `onSave` w modalu, która wywoła `PUT /api/flashcards/{id}`. Obsłuż sukces (zamknięcie modala, odświeżenie danych) i błąd (komunikat w modalu).
8.  **Stworzenie komponentu `DeleteConfirmationDialog.tsx`:** Zaimplementuj dialog potwierdzenia (`AlertDialog` z Shadcn).
9.  **Implementacja logiki usuwania:** Połącz przycisk "Usuń" w `FlashcardItem` z funkcją w `FlashcardsListView`, która otworzy `DeleteConfirmationDialog`. Zaimplementuj funkcję `onConfirm` w dialogu, która wywoła `DELETE /api/flashcards/{id}`. Obsłuż sukces (zamknięcie dialogu, odświeżenie danych) i błąd.
10. **Obsługa stanu braku fiszek:** W `FlashcardsListView`, jeśli `total === 0`, wyświetl odpowiedni komunikat.
11. **Styling i dopracowanie:** Upewnij się, że wszystkie komponenty są spójne wizualnie (Tailwind + Shadcn), a interakcje są płynne. Dodaj wskaźniki ładowania dla operacji API.
12. **Testowanie:** Napisz testy jednostkowe dla logiki hooka/komponentów (Vitest, React Testing Library) oraz testy E2E (Playwright) dla kluczowych przepływów użytkownika (wyświetlanie listy, paginacja, edycja, usuwanie). 