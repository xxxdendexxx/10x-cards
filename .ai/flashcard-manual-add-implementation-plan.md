# Plan implementacji widoku - Ręczne dodawanie fiszki

## 1. Przegląd
Celem jest rozszerzenie istniejącego widoku "Moje fiszki" (`/flashcards`) o funkcjonalność umożliwiającą użytkownikowi ręczne dodanie nowej fiszki. Funkcjonalność ta zostanie zrealizowana poprzez dodanie przycisku "Dodaj fiszkę", który otworzy modal z formularzem do wprowadzenia danych nowej fiszki (przód i tył). Po pomyślnym dodaniu fiszki przez API, lista fiszek w widoku powinna zostać odświeżona, a nowa fiszka powinna być na niej widoczna.

## 2. Routing widoku
Funkcjonalność zostanie dodana do istniejącego widoku dostępnego pod ścieżką `/flashcards`. Nie ma potrzeby tworzenia nowego routingu.

## 3. Struktura komponentów
Istniejący komponent `FlashcardsListView` (`src/components/FlashcardsListView.tsx`) zostanie zmodyfikowany. Dodane zostaną:
- Przycisk `Button` (z Shadcn/ui) do inicjowania dodawania fiszki.
- Modal `Dialog` (z Shadcn/ui) zawierający komponent formularza `AddFlashcardForm`.

```
FlashcardsListView
│
├── Button (Shadcn/ui) - Przycisk "Dodaj fiszkę"
│
└── Dialog (Shadcn/ui) - Modal do dodawania fiszki
    │
    └── AddFlashcardForm (nowy komponent)
        │
        ├── Input (Shadcn/ui) - Pole "Przód"
        ├── Textarea (Shadcn/ui) - Pole "Tył"
        ├── Button (Shadcn/ui) - Przycisk "Zapisz"
        └── Button (Shadcn/ui) - Przycisk "Anuluj"
```

## 4. Szczegóły komponentów

### `FlashcardsListView` (modyfikacja)
- **Opis komponentu:** Główny komponent widoku listy fiszek, odpowiedzialny za wyświetlanie fiszek, paginację oraz teraz także za inicjowanie procesu dodawania nowej fiszki.
- **Główne elementy:** Istniejąca tabela/lista fiszek, paginacja, nowy przycisk "Dodaj fiszkę", nowy komponent `Dialog` (modal).
- **Obsługiwane interakcje:**
    - Kliknięcie przycisku "Dodaj fiszkę" -> Otwiera modal `Dialog`.
    - Zamknięcie modala (przez przycisk Anuluj lub kliknięcie poza obszarem) -> Zamyka modal.
    - Pomyślne dodanie fiszki (zdarzenie z `AddFlashcardForm`) -> Odświeża listę fiszek.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji w tym komponencie; delegowana do `AddFlashcardForm`.
- **Typy:** `FlashcardsListResponseDTO`, `FlashcardDTO`.
- **Propsy:** Brak (komponent ładowany przez `client:load`).

### `AddFlashcardForm` (nowy komponent)
- **Opis komponentu:** Formularz znajdujący się wewnątrz modala, umożliwiający użytkownikowi wprowadzenie danych nowej fiszki (przód i tył) i ich zapisanie.
- **Główne elementy:** `form`, `Input` dla pola "przód", `Textarea` dla pola "tył", przyciski "Zapisz" i "Anuluj". Wyświetlanie komunikatów o błędach walidacji i błędach API.
- **Obsługiwane interakcje:**
    - Wprowadzanie tekstu w polach "Przód" i "Tył".
    - Kliknięcie przycisku "Zapisz" -> Uruchamia walidację i wysłanie danych do API.
    - Kliknięcie przycisku "Anuluj" -> Wywołuje zdarzenie `onCancel`.
- **Obsługiwana walidacja:**
    - Pole "Przód": Wymagane, maksymalnie 200 znaków.
    - Pole "Tył": Wymagane, maksymalnie 500 znaków.
    - Walidacja odbywa się po stronie klienta przed wysłaniem żądania. Komunikaty o błędach wyświetlane są przy odpowiednich polach.
- **Typy:** `FlashcardCreateDTO` (do wysłania), `ManualFlashcardFormData` (ViewModel).
- **Propsy:**
    - `onSubmit: (data: ManualFlashcardFormData) => Promise<void>`: Funkcja wywoływana po pomyślnej walidacji i kliknięciu "Zapisz". Powinna obsłużyć wywołanie API.
    - `onCancel: () => void`: Funkcja wywoływana po kliknięciu "Anuluj" lub zamknięciu modala.
    - `isLoading: boolean`: Wskazuje, czy trwa proces wysyłania danych do API (do deaktywacji przycisku "Zapisz").

## 5. Typy

### Istniejące typy (z `src/types.ts`)
- `FlashcardDTO`: Reprezentuje pojedynczą fiszkę pobraną z API.
- `FlashcardCreateDTO`: Używane w ciele żądania POST do `/api/flashcards`. Pola:
    - `front: string` (max 200)
    - `back: string` (max 500)
    - `source: FlashcardSource` (ustawione na `"manual"`)
    - `generation_id: number | null` (ustawione na `null`)
- `CreateFlashcardCommand`: Obiekt zawierający tablicę `flashcards` typu `FlashcardCreateDTO`.

### Nowe typy (ViewModel)
- `ManualFlashcardFormData`: Typ reprezentujący dane formularza przed wysłaniem do API.
  ```typescript
  interface ManualFlashcardFormData {
    front: string;
    back: string;
  }
  ```

## 6. Zarządzanie stanem

W komponencie `FlashcardsListView`:
- Stan do zarządzania widocznością modala (`isModalOpen: boolean`).
- Stan do przechowywania aktualnych danych fiszek i paginacji (prawdopodobnie już istnieje, np. przy użyciu `useState` lub `useSWR`/`react-query`).
- Stan `isLoading` do śledzenia procesu dodawania fiszki (przekazywany do `AddFlashcardForm`).
- Stan do przechowywania ewentualnych błędów API (`error: string | null`).

W komponencie `AddFlashcardForm`:
- Stany do przechowywania wartości pól formularza (`front: string`, `back: string`).
- Stany do przechowywania błędów walidacji dla poszczególnych pól (`errors: { front?: string; back?: string }`).

Nie wydaje się konieczne tworzenie dedykowanego custom hooka tylko dla tej funkcjonalności, standardowe hooki React (`useState`, `useCallback`) powinny wystarczyć. Stan listy fiszek jest prawdopodobnie zarządzany już przez istniejący mechanizm pobierania danych (np. `useSWR` lub `react-query`), który należy wykorzystać do odświeżenia danych po dodaniu fiszki.

## 7. Integracja API

- **Endpoint:** `POST /api/flashcards`
- **Cel:** Dodanie nowej, ręcznie stworzonej fiszki.
- **Logika:** W komponencie `FlashcardsListView`, w funkcji obsługującej `onSubmit` z `AddFlashcardForm`:
    1. Ustawić `isLoading` na `true`.
    2. Zbudować obiekt `CreateFlashcardCommand` na podstawie danych z formularza (`ManualFlashcardFormData`):
       ```typescript
       const payload: CreateFlashcardCommand = {
         flashcards: [
           {
             front: formData.front,
             back: formData.back,
             source: "manual",
             generation_id: null,
           },
         ],
       };
       ```
    3. Wykonać żądanie `POST` do `/api/flashcards` z `payload` w ciele.
    4. Obsłużyć odpowiedź:
        - **Sukces (201):** Zamknąć modal, odświeżyć listę fiszek (np. przez rewalidację danych w `useSWR`/`react-query`), zresetować stan błędu, ustawić `isLoading` na `false`. Można wyświetlić powiadomienie typu "toast" o sukcesie.
        - **Błąd (400, 401, 500):** Nie zamykać modala, wyświetlić komunikat błędu (np. pod formularzem lub jako "toast"), ustawić `isLoading` na `false`, zapisać błąd w stanie `error`.
- **Typy żądania:** `CreateFlashcardCommand` (zawierający `FlashcardCreateDTO`).
- **Typy odpowiedzi (sukces):** `{ flashcards: FlashcardDTO[] }`.

## 8. Interakcje użytkownika

1. **Użytkownik klika przycisk "Dodaj fiszkę" w widoku `/flashcards`:**
   - Oczekiwany wynik: Otwiera się modal (`Dialog`) z pustym formularzem `AddFlashcardForm`.
2. **Użytkownik wypełnia pola "Przód" i "Tył" w formularzu:**
   - Oczekiwany wynik: Wprowadzony tekst pojawia się w odpowiednich polach. Ewentualne błędy walidacji z poprzedniej próby zapisu są czyszczone w miarę pisania.
3. **Użytkownik klika przycisk "Zapisz":**
   - **Walidacja nie przechodzi:**
     - Oczekiwany wynik: Pod polami z błędami pojawiają się komunikaty walidacyjne (np. "Pole wymagane", "Maksymalna liczba znaków: 200"). Formularz nie jest wysyłany. Przycisk "Zapisz" pozostaje aktywny.
   - **Walidacja przechodzi:**
     - Oczekiwany wynik: Przycisk "Zapisz" staje się nieaktywny (`disabled`), pokazywany jest wskaźnik ładowania. Rozpoczyna się wysyłanie żądania POST do `/api/flashcards`.
4. **API zwraca sukces (201):**
   - Oczekiwany wynik: Modal zostaje zamknięty. Lista fiszek w tle zostaje odświeżona, a nowo dodana fiszka jest widoczna (prawdopodobnie na początku listy lub na odpowiedniej stronie paginacji). Opcjonalnie pojawia się komunikat "toast" o sukcesie. Przycisk "Zapisz" w (już zamkniętym) modalu wraca do stanu aktywnego.
5. **API zwraca błąd (np. 400, 500):**
   - Oczekiwany wynik: Modal pozostaje otwarty. Pod formularzem lub jako "toast" pojawia się komunikat o błędzie (np. "Wystąpił błąd serwera. Spróbuj ponownie."). Przycisk "Zapisz" wraca do stanu aktywnego. Pola formularza zachowują wprowadzone wartości.
6. **Użytkownik klika przycisk "Anuluj" lub klika poza modalem:**
   - Oczekiwany wynik: Modal zostaje zamknięty. Żadne zmiany nie są zapisywane. Stan formularza jest resetowany przy następnym otwarciu.

## 9. Warunki i walidacja

- **Miejsce walidacji:** Komponent `AddFlashcardForm`.
- **Warunki:**
    - Pole `front`:
        - Nie może być puste (`required`).
        - Długość nie może przekraczać 200 znaków (`maxLength: 200`).
    - Pole `back`:
        - Nie może być puste (`required`).
        - Długość nie może przekraczać 500 znaków (`maxLength: 500`).
- **Obsługa w interfejsie:**
    - Walidacja powinna być uruchamiana przy próbie wysłania formularza (kliknięcie "Zapisz").
    - Komunikaty o błędach powinny być wyświetlane bezpośrednio pod odpowiednimi polami formularza.
    - Przycisk "Zapisz" powinien być aktywny, dopóki walidacja nie przejdzie pomyślnie i nie rozpocznie się wysyłanie danych (stan `isLoading`). Biblioteka `react-hook-form` z integracją `zod` może ułatwić implementację.

## 10. Obsługa błędów

- **Błędy walidacji:** Obsługiwane lokalnie w `AddFlashcardForm` przez wyświetlanie komunikatów przy polach.
- **Błędy API (np. 400, 401, 500):**
    - W komponencie `FlashcardsListView`, w bloku `catch` po wywołaniu API.
    - Wyświetlić generyczny komunikat błędu użytkownikowi (np. "Nie udało się dodać fiszki. Spróbuj ponownie." lub bardziej szczegółowy, jeśli API go dostarcza) za pomocą komponentu `Alert` z Shadcn/ui lub systemu powiadomień "toast".
    - Zapisać błąd w stanie, aby ewentualnie wyświetlić go w UI.
    - Upewnić się, że stan `isLoading` jest ustawiony z powrotem na `false`.
- **Przypadki brzegowe:**
    - Użytkownik traci połączenie internetowe podczas wysyłania: Obsłużyć błąd sieciowy, informując użytkownika.
    - Sesja użytkownika wygasła (401 Unauthorized): Idealnie, globalny mechanizm obsługi błędów API powinien przechwycić 401 i przekierować użytkownika do logowania. Jeśli nie, wyświetlić odpowiedni komunikat i ewentualnie zablokować dalsze akcje.

## 11. Kroki implementacji

1.  **Modyfikacja `FlashcardsListView.tsx`:**
    - Dodaj stan `isModalOpen` (np. `useState(false)`).
    - Dodaj przycisk `Button` z Shadcn/ui z etykietą "Dodaj fiszkę". Ustaw `onClick`, aby zmieniał `isModalOpen` na `true`. Umieść go w odpowiednim miejscu layoutu (np. nad listą fiszek).
    - Dodaj komponent `Dialog` z Shadcn/ui. Ustaw jego atrybut `open` na `isModalOpen` i `onOpenChange` na funkcję ustawiającą `isModalOpen`.
    - Wewnątrz `Dialog` dodaj `DialogContent`, `DialogHeader`, `DialogTitle` ("Dodaj nową fiszkę"), `DialogDescription` (opcjonalnie), `DialogFooter`.
2.  **Utworzenie `AddFlashcardForm.tsx`:**
    - Zdefiniuj interfejs `Props` (`onSubmit`, `onCancel`, `isLoading`).
    - Zaimplementuj formularz przy użyciu `react-hook-form` i `zod` do walidacji (zgodnie z sekcją 9).
    - Dodaj pola `Input` (dla `front`) i `Textarea` (dla `back`) z odpowiednimi etykietami i powiązaniami z `react-hook-form`. Wyświetlaj błędy walidacji.
    - Dodaj przycisk "Zapisz" (`type="submit"`, `disabled={isLoading}`).
    - Dodaj przycisk "Anuluj" (`type="button"`, `onClick={onCancel}`).
    - Umieść przyciski w `DialogFooter` przekazanym z `FlashcardsListView` lub bezpośrednio w formularzu, jeśli jest on renderowany wewnątrz `DialogContent`.
3.  **Integracja `AddFlashcardForm` w `FlashcardsListView.tsx`:**
    - Zaimportuj i umieść `<AddFlashcardForm />` wewnątrz `DialogContent`.
    - Zdefiniuj funkcję `handleAddFlashcardSubmit(data: ManualFlashcardFormData)`:
        - Ustaw `isLoading` na `true`.
        - Wywołaj API `POST /api/flashcards` z danymi przekształconymi do `CreateFlashcardCommand`.
        - W bloku `then`: zamknij modal (`setIsModalOpen(false)`), odśwież dane listy fiszek (np. `mutate()` z `useSWR`), pokaż sukces (toast).
        - W bloku `catch`: pokaż błąd (toast/alert), zapisz błąd w stanie.
        - W bloku `finally`: ustaw `isLoading` na `false`.
    - Zdefiniuj funkcję `handleCancel()` ustawiającą `isModalOpen` na `false`.
    - Przekaż `handleAddFlashcardSubmit`, `handleCancel` i `isLoading` jako propsy do `<AddFlashcardForm />`.
4.  **Styling i UI:**
    - Upewnij się, że przycisk "Dodaj fiszkę" i modal są poprawnie ostylowane zgodnie z resztą aplikacji (Tailwind, Shadcn/ui).
    - Dodaj odpowiednie komunikaty ładowania i błędów.
5.  **Testowanie:**
    - Przetestuj ręcznie przepływ dodawania fiszki, w tym walidację i obsługę błędów API.
    - Rozważ dodanie testów jednostkowych dla logiki walidacji w `AddFlashcardForm` i testów integracyjnych dla przepływu w `FlashcardsListView`. 