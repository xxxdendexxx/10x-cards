
## 4. Szczegóły komponentów

### `GenerateFlashcardsContainer.tsx`
- **Opis:** Główny kontener React zarządzający stanem i logiką całego widoku generowania. Wykorzystuje customowy hook `useGenerateFlashcards` do enkapsulacji logiki. Renderuje formularz, listę propozycji, przycisk zapisu i modal edycji.
- **Główne elementy:** `GenerateFlashcardsForm`, `FlashcardProposalList`, `SaveApprovedButton`, `EditFlashcardModal`.
- **Obsługiwane interakcje:** Orkiestruje przepływ danych i zdarzeń między komponentami podrzędnymi (przekazuje handlery z hooka).
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji, deleguje do komponentów podrzędnych.
- **Typy:** Korzysta ze stanu i funkcji zwróconych przez `useGenerateFlashcards`.
- **Propsy:** Potencjalnie `userSession` (informacje o zalogowanym użytkowniku, jeśli potrzebne bezpośrednio).

### `GenerateFlashcardsForm.tsx`
- **Opis:** Formularz do wprowadzania tekstu źródłowego i inicjowania procesu generowania fiszek. Wyświetla błędy walidacji dla pola tekstowego i obsługuje stan ładowania podczas generowania.
- **Główne elementy:** `Textarea` (Shadcn) dla `sourceText`, `Button` (Shadcn) "Generuj propozycje", komunikaty o błędach walidacji.
- **Obsługiwane interakcje:** Wprowadzanie tekstu (`onChange`), wysłanie formularza (`onSubmit`).
- **Obsługiwana walidacja:** Długość `sourceText` musi być między 1000 a 10000 znaków. Wyświetla błąd inline. Przycisk "Generuj" jest nieaktywny, jeśli walidacja nie przechodzi lub trwa ładowanie (`isLoadingGenerate`).
- **Typy:** Wewnętrzny stan dla `sourceText`.
- **Propsy:**
    - `onSubmit: (sourceText: string) => void`
    - `isLoading: boolean`
    - `initialSourceText: string`

### `FlashcardProposalList.tsx`
- **Opis:** Komponent renderujący listę propozycji fiszek (`FlashcardProposalItem`). Wyświetla komunikat, jeśli lista jest pusta.
- **Główne elementy:** Mapowanie tablicy `proposals` na komponenty `FlashcardProposalItem`, warunkowe wyświetlanie komunikatu o pustej liście.
- **Obsługiwane interakcje:** Brak bezpośrednich, deleguje do `FlashcardProposalItem`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardProposalViewModel[]`.
- **Propsy:**
    - `proposals: FlashcardProposalViewModel[]`
    - `onAccept: (id: string) => void`
    - `onReject: (id: string) => void`
    - `onEdit: (proposal: FlashcardProposalViewModel) => void`

### `FlashcardProposalItem.tsx`
- **Opis:** Reprezentuje pojedynczą propozycję fiszki na liście. Wyświetla treść przodu i tyłu oraz przyciski akcji ("Akceptuj", "Edytuj", "Odrzuć"). Wizualnie sygnalizuje status propozycji (np. kolor ramki, przezroczystość).
- **Główne elementy:** `Card` (Shadcn) zawierający `front` i `back` text, `Button` (Shadcn) dla każdej akcji.
- **Obsługiwane interakcje:** Kliknięcie przycisków "Akceptuj", "Edytuj", "Odrzuć".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardProposalViewModel`.
- **Propsy:**
    - `proposal: FlashcardProposalViewModel`
    - `onAccept: (id: string) => void`
    - `onReject: (id: string) => void`
    - `onEdit: (proposal: FlashcardProposalViewModel) => void`

### `EditFlashcardModal.tsx`
- **Opis:** Modal (Shadcn `Dialog`) do edycji treści (`front`, `back`) wybranej propozycji fiszki. Zawiera formularz z walidacją inline.
- **Główne elementy:** `Dialog` (Shadcn), `Input` (Shadcn) dla `front`, `Textarea` (Shadcn) dla `back`, `Button` (Shadcn) "Zapisz zmiany", `Button` (Shadcn) "Anuluj", komunikaty o błędach walidacji.
- **Obsługiwane interakcje:** Wprowadzanie tekstu w polach (`onChange`), zapisanie zmian (`onSave`), anulowanie (`onCancel`).
- **Obsługiwana walidacja:** `front` (max 200 znaków), `back` (max 500 znaków). Błędy wyświetlane inline. Przycisk "Zapisz zmiany" nieaktywny, jeśli walidacja nie przechodzi.
- **Typy:** Wewnętrzny stan formularza (edytowany `front`, `back`), `FlashcardProposalViewModel`.
- **Propsy:**
    - `proposal: FlashcardProposalViewModel | null` (Propozycja do edycji)
    - `isOpen: boolean`
    - `onSave: (updatedProposal: FlashcardProposalViewModel) => void`
    - `onClose: () => void`

### `SaveApprovedButton.tsx`
- **Opis:** Przycisk inicjujący zapisanie zaakceptowanych/edytowanych propozycji fiszek poprzez wywołanie API `/api/flashcards`. Jest nieaktywny, jeśli żadna propozycja nie jest zaakceptowana/edytowana lub trwa proces zapisywania.
- **Główne elementy:** `Button` (Shadcn) "Zapisz zatwierdzone".
- **Obsługiwane interakcje:** Kliknięcie przycisku (`onClick`).
- **Obsługiwana walidacja:** Sprawdza, czy `isEnabled` jest `true`.
- **Typy:** Brak specyficznych.
- **Propsy:**
    - `onClick: () => void`
    - `isEnabled: boolean`
    - `isLoading: boolean`

## 5. Typy
Oprócz typów DTO importowanych z `src/types.ts` (`GenerateFlashcardProposalsCommand`, `GenerationCreateResponseDTO`, `FlashcardProposalDTO`, `CreateFlashcardCommand`, `FlashcardCreateDTO`), wprowadzony zostanie ViewModel:

- **`FlashcardProposalViewModel`:**
    - **Cel:** Reprezentacja propozycji fiszki w stanie UI, rozszerzająca `FlashcardProposalDTO` o status i identyfikator klienta.
    - **Pola:**
        - `id: string` - Unikalny identyfikator po stronie klienta (np. `crypto.randomUUID()`), używany jako klucz w listach React i do śledzenia stanu.
        - `front: string` - Aktualna treść przodu fiszki (może być edytowana). Max 200 znaków.
        - `back: string` - Aktualna treść tyłu fiszki (może być edytowana). Max 500 znaków.
        - `originalFront: string` - Oryginalna treść przodu z API.
        - `originalBack: string` - Oryginalna treść tyłu z API.
        - `status: "pending" | "accepted" | "rejected" | "edited"` - Stan propozycji wynikający z interakcji użytkownika. `pending` - stan początkowy, `accepted` - zaakceptowana, `rejected` - odrzucona, `edited` - zaakceptowana po edycji.
        - `source: "ai-full" | "ai-edited"

## 6. Zarządzanie stanem
Logika i stan widoku zostaną zamknięte w customowym hooku `useGenerateFlashcards`, aby utrzymać czystość komponentu `GenerateFlashcardsContainer`.

- **`useGenerateFlashcards` Hook:**
    - **Cel:** Zarządzanie tekstem źródłowym, listą propozycji (`FlashcardProposalViewModel[]`), stanami ładowania (`isLoadingGenerate`, `isLoadingSave`), błędami (`errorGenerate`, `errorSave`), stanem edycji (`editingProposal`, `isModalOpen`) oraz logiką wywołań API.
    - **Zwracane wartości:**
        - Stany: `sourceText`, `proposals`, `isLoadingGenerate`, `isLoadingSave`, `errorGenerate`, `errorSave`, `editingProposal`, `isModalOpen`.
        - Stan pochodny: `canSave` (boolean - czy przycisk "Zapisz zatwierdzone" powinien być aktywny).
        - Handlery: `handleSourceTextChange`, `handleGenerateSubmit`, `handleAccept`, `handleReject`, `handleEditClick`, `handleModalSave`, `handleModalClose`, `handleSaveApproved`.

## 7. Integracja API

- **Generowanie propozycji:**
    - **Trigger:** Wysłanie formularza `GenerateFlashcardsForm`.
    - **Wywołanie:** `POST /api/generate`
    - **Request Body:** `GenerateFlashcardProposalsCommand` (`{ sourceText: string }`) - `sourceText` pobrany ze stanu hooka.
    - **Response Body (Success 200):** `GenerationCreateResponseDTO` (`{ generation_id: number; flashcards_proposals: FlashcardProposalDTO[]; generated_count: number }`). *(Uwaga: użyto `flashcards_proposals` zgodnie z planem implementacji endpointu)*.
    - **Obsługa:** Hook `useGenerateFlashcards` przetwarza odpowiedź, mapuje `flashcards_proposals` na `FlashcardProposalViewModel[]`, dodaje unikalne `id`, zapisuje `generation_id` i aktualizuje stan `proposals`.
- **Zapisywanie zatwierdzonych fiszek:**
    - **Trigger:** Kliknięcie przycisku `SaveApprovedButton`.
    - **Wywołanie:** `POST /api/flashcards`
    - **Request Body:** `CreateFlashcardCommand` (`{ flashcards: FlashcardCreateDTO[] }`). Hook `useGenerateFlashcards` filtruje stan `proposals` wybierając te ze statusem `"accepted"` lub `"edited"`, a następnie mapuje je do formatu `FlashcardCreateDTO`, ustawiając `source` na `"ai-edited"` i dołączając zapisane `generation_id`.
    - **Response Body (Success 201):** `{ flashcards: FlashcardDTO[] }` (lub podobna struktura potwierdzająca zapis).
    - **Obsługa:** Hook `useGenerateFlashcards` obsługuje odpowiedź, potencjalnie czyści listę propozycji lub wywołuje nawigację, wyświetla komunikat o sukcesie.

## 8. Interakcje użytkownika
- **Wpisanie tekstu źródłowego:** Aktualizuje stan `sourceText`, walidacja długości (1000-10000) odbywa się na bieżąco, wpływając na stan przycisku "Generuj".
- **Kliknięcie "Generuj propozycje":** Wywołuje `handleGenerateSubmit`. Przycisk i pole tekstowe są blokowane, pojawia się wskaźnik ładowania. Po zakończeniu (sukces/błąd) stan ładowania jest usuwany, pojawia się lista propozycji lub komunikat o błędzie.
- **Kliknięcie "Akceptuj" na propozycji:** Wywołuje `handleAccept(id)`. Status propozycji zmienia się na `"accepted"`, aktualizowany jest jej wygląd. Przycisk "Zapisz zatwierdzone" może zostać aktywowany.
- **Kliknięcie "Odrzuć" na propozycji:** Wywołuje `handleReject(id)`. Status propozycji zmienia się na `"rejected"`, aktualizowany jest jej wygląd (np. wyszarzenie). Przycisk "Zapisz zatwierdzone" może zostać dezaktywowany.
- **Kliknięcie "Edytuj" na propozycji:** Wywołuje `handleEditClick(proposal)`. Otwiera `EditFlashcardModal` z danymi wybranej propozycji.
- **Edycja w modalu:** Pola `front`/`back` są aktualizowane, walidacja (max 200/500) działa na bieżąco, wpływając na stan przycisku "Zapisz zmiany".
- **Kliknięcie "Zapisz zmiany" w modalu:** Wywołuje `handleModalSave(updatedProposal)`. Jeśli walidacja przejdzie, modal jest zamykany, propozycja na liście aktualizuje `front`/`back`, a jej status zmienia się na `"edited"`. Przycisk "Zapisz zatwierdzone" może zostać aktywowany.
- **Kliknięcie "Anuluj" w modalu:** Wywołuje `handleModalClose()`. Modal jest zamykany bez zapisywania zmian.
- **Kliknięcie "Zapisz zatwierdzone":** Wywołuje `handleSaveApproved()`. Przycisk jest blokowany, pojawia się wskaźnik ładowania. Wywoływane jest API `/api/flashcards`. Po zakończeniu (sukces/błąd) stan ładowania jest usuwany, pojawia się komunikat o sukcesie/błędzie.

## 9. Warunki i walidacja
- **Pole `sourceText` (`GenerateFlashcardsForm`):**
    - Warunek: Długość tekstu musi być w przedziale [1000, 10000] znaków.
    - Weryfikacja: W komponencie `GenerateFlashcardsForm` przy każdej zmianie (`onChange`) i przed wysłaniem (`onSubmit`).
    - Wpływ na UI: Wyświetlanie komunikatu o błędzie pod polem tekstowym, blokowanie przycisku "Generuj".
- **Pola `front`/`back` w modalu (`EditFlashcardModal`):**
    - Warunek: `front` <= 200 znaków, `back` <= 500 znaków.
    - Weryfikacja: W komponencie `EditFlashcardModal` przy każdej zmianie (`onChange`).
    - Wpływ na UI: Wyświetlanie komunikatów o błędach pod odpowiednimi polami, blokowanie przycisku "Zapisz zmiany".
- **Przycisk "Zapisz zatwierdzone" (`SaveApprovedButton`):**
    - Warunek: Co najmniej jedna propozycja w stanie `proposals` ma status `"accepted"` lub `"edited"`.
    - Weryfikacja: Obliczane w hooku `useGenerateFlashcards` (stan pochodny `canSave`).
    - Wpływ na UI: Włączenie/wyłączenie (atrybut `disabled`) przycisku.

## 10. Obsługa błędów
- **Błędy walidacji (frontend):** Wyświetlane jako komunikaty inline przy odpowiednich polach formularza (`GenerateFlashcardsForm`, `EditFlashcardModal`). Uniemożliwiają wysłanie danych (blokada przycisków).
- **Błędy API (`/api/generate`):**
    - **400 Bad Request (np. serwerowa walidacja długości):** Wyświetlić komunikat błędu (np. Toast lub Alert) informujący o problemie z danymi wejściowymi.
    - **401 Unauthorized:** Globalna obsługa (np. przekierowanie na logowanie).
    - **500 Internal Server Error / Błędy sieci:** Wyświetlić generyczny komunikat o błędzie generowania (np. Toast/Alert), zachęcający do spróbowania ponownie. Zalogować szczegóły błędu w konsoli deweloperskiej.
- **Błędy API (`/api/flashcards`):**
    - **400 Bad Request (np. błąd walidacji DTO):** Wyświetlić komunikat o błędzie zapisu (Toast/Alert). Zalogować szczegóły.
    - **401 Unauthorized:** Globalna obsługa.
    - **500 Internal Server Error / Błędy sieci:** Wyświetlić generyczny komunikat o błędzie zapisu (Toast/Alert). Zalogować szczegóły. Przycisk "Zapisz zatwierdzone" powinien pozostać aktywny, aby umożliwić ponowienie próby.
- **Wyświetlanie błędów:** Zalecane użycie komponentu `Toast` lub `Alert` z Shadcn/ui do informowania użytkownika o błędach API.

## 11. Kroki implementacji
1.  **Utworzenie strony Astro:** Stworzyć plik `src/pages/generate.astro`. Zapewnić ochronę routingu (wymóg zalogowania) poprzez layout lub middleware Astro.
2.  **Utworzenie kontenera React:** Stworzyć `src/components/GenerateFlashcardsContainer.tsx` i osadzić go w `generate.astro` jako client island (`client:load` lub `client:idle`).
3.  **Implementacja Hooka:** Stworzyć szkielet hooka `useGenerateFlashcards` (`src/hooks/useGenerateFlashcards.ts`) z podstawowym stanem (`sourceText`, `proposals`, `isLoadingGenerate`, etc.) i pustymi handlerami.
4.  **Implementacja formularza:** Stworzyć komponent `GenerateFlashcardsForm.tsx` z `Textarea` i `Button` (Shadcn). Podłączyć stan `sourceText` i `isLoadingGenerate` z hooka. Zaimplementować walidację długości i logikę `onSubmit` wywołującą `handleGenerateSubmit` z hooka.
5.  **Implementacja listy i elementu:** Stworzyć komponenty `FlashcardProposalList.tsx` i `FlashcardProposalItem.tsx`. Wyrenderować listę na podstawie stanu `proposals` z hooka. Dodać przyciski akcji w `FlashcardProposalItem` i podpiąć je do odpowiednich handlerów (`handleAccept`, `handleReject`, `handleEditClick`) z hooka. Dodać wizualne rozróżnienie statusów propozycji.
6.  **Implementacja modala edycji:** Stworzyć komponent `EditFlashcardModal.tsx` używając `Dialog` (Shadcn). Dodać formularz z `Input`, `Textarea` i przyciskami. Zaimplementować wewnętrzny stan formularza, walidację inline (max 200/500) i podpiąć przyciski do handlerów (`handleModalSave`, `handleModalClose`) z hooka. Sterować widocznością modala za pomocą `isModalOpen` i `editingProposal` ze stanu hooka.
7.  **Implementacja przycisku zapisu:** Stworzyć komponent `SaveApprovedButton.tsx`. Podłączyć jego stan `disabled` do `!canSave || isLoadingSave` z hooka, a `onClick` do `handleSaveApproved`.
8.  **Logika API w hooku:** Zaimplementować logikę wywołań API (`fetch` lub biblioteka np. `axios`/`ky`) wewnątrz `handleGenerateSubmit` i `handleSaveApproved` w hooku `useGenerateFlashcards`. Dodać obsługę stanów ładowania, mapowanie DTO <-> ViewModel, aktualizację stanu `proposals`, `generationId` oraz obsługę błędów (aktualizacja stanu `errorGenerate`/`errorSave`).
9.  **Obsługa błędów UI:** Dodać wyświetlanie komunikatów o błędach (np. `Toast` lub `Alert` z Shadcn/ui) w `GenerateFlashcardsContainer` na podstawie stanów `errorGenerate` i `errorSave`.
10. **Stylowanie i dostępność:** Dopracować stylowanie za pomocą Tailwind. Upewnić się, że wszystkie interaktywne elementy są dostępne (ARIA attributes, focus management). Zapewnić responsywność widoku.
11. **Testowanie:** Przetestować cały przepływ: wprowadzanie tekstu, generowanie, różne akcje na propozycjach (akceptacja, odrzucenie, edycja), zapisywanie, obsługę błędów i przypadki brzegowe (pusta odpowiedź AI, błędy sieci).
