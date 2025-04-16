# Przewodnik wdrożenia usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter integruje się z interfejsem API OpenRouter, aby wzbogacić czaty oparte na LLM. Główne zadania usługi to:

1. Budowanie zapytań zawierających:
   - **Komunikat systemowy** (np. "You are a helpful assistant."), definiujący kontekst działania modelu.
   - **Komunikat użytkownika** – dynamiczny input od użytkownika.
   - **Ustrukturyzowane odpowiedzi** poprzez `response_format`, przykładowo:
     ```json
     { "type": "json_schema", "json_schema": { "name": "ChatResponse", "strict": true, "schema": { "answer": "string", "metadata": "object" } } }
     ```
   - **Nazwa modelu** (np. "openrouter-llm-v1").
   - **Parametry modelu** (np. { temperature: 0.7, max_tokens: 500, top_p: 0.9 }).
2. Wysyłanie zapytań do API OpenRouter.
3. Przetwarzanie i walidacja odpowiedzi, zapewniając zgodność z ustalonym schematem.

## 2. Opis konstruktora

Konstruktor usługi powinien przyjmować następujące parametry:

- **API Key** oraz **URL endpoint** API OpenRouter.
- Domyślny **komunikat systemowy** (np. "You are a helpful assistant.").
- Domyślną konfigurację modelu:
  - **Nazwa modelu** (np. "openrouter-llm-v1").
  - **Parametry modelu** (np. { temperature: 0.7, max_tokens: 500, top_p: 0.9 }).
- Opcjonalne ustawienia, takie jak retry logic oraz timeouty.

**Przykład inicjalizacji:**

- apiKey: "TWÓJ_API_KEY"
- endpoint: "https://api.openrouter.ai/v1/chat"
- systemMessage: "You are a helpful assistant."
- modelName: "openrouter-llm-v1"
- modelParams: { temperature: 0.7, max_tokens: 500, top_p: 0.9 }

## 3. Publiczne metody i pola

Główne publiczne metody i pola usługi powinny obejmować:

1. **sendMessage(userMessage: string, additionalContext?: object): Promise<Response>**
   - Buduje payload, który łączy:
     1. Komunikat systemowy (np. "You are a helpful assistant.")
     2. Komunikat użytkownika (otrzymany jako argument)
     3. Ustrukturyzowany response_format, np.:
        ```json
        { "type": "json_schema", "json_schema": { "name": "ChatResponse", "strict": true, "schema": { "answer": "string", "metadata": "object" } } }
        ```
     4. Nazwę modelu i parametry modelu (np. "openrouter-llm-v1" i { temperature: 0.7, max_tokens: 500, top_p: 0.9 }).
   - Wysyła zapytanie do API oraz zwraca i waliduje odpowiedź.

2. **configure(options: object): void**
   - Umożliwia aktualizację konfiguracji, np. zmianę domyślnego komunikatu systemowego, parametrów modelu itp.

3. **getLastResponse(): object**
   - Umożliwia dostęp do ostatnio otrzymanej odpowiedzi, przydatne w debugowaniu i analizie.

## 4. Prywatne metody i pola

Prywatne elementy mogą zawierać:

1. **_buildPayload(userMessage: string, additionalContext?: object): object**
   - Metoda budująca kompletny obiekt zapytania.
2. **_validateResponse(response: object): boolean**
   - Walidacja odpowiedzi API względem ustalonego schematu JSON.
3. **_handleError(error: any): void**
   - Centralny moduł obsługi błędów, odpowiedzialny za logowanie i wywołanie retry logic, jeśli to konieczne.
4. Prywatne pola, takie jak:
   - _apiKey
   - _endpoint
   - _defaultSystemMessage
   - _modelName
   - _modelParams
   - _lastResponse (cache ostatniej odpowiedzi)

## 5. Obsługa błędów

Potencjalne scenariusze błędów i rekomendacje:

1. **Błąd połączenia (Connection Error):**
   - Wyzwanie: API jest nieosiągalne lub występują problemy sieciowe.
   - Rozwiązanie: Implementacja retry logic, logowanie błędu, mechanizm powiadamiania użytkownika o problemie.

2. **Błąd odpowiedzi API (API Error Response):**
   - Wyzwanie: API zwraca błąd (np. nieprawidłowy status lub komunikat błędu).
   - Rozwiązanie: Analiza kodu statusu, przekazanie zrozumiałego komunikatu błędu, fallback response.

3. **Niepoprawny format odpowiedzi:**
   - Wyzwanie: Odpowiedź nie spełnia ustalonego schematu `response_format`.
   - Rozwiązanie: Walidacja za pomocą _validateResponse; w przypadku niezgodności, zgłoszenie wyjątku.

4. **Timeout żądania:**
   - Wyzwanie: Przekroczenie oczekiwanego czasu odpowiedzi od API.
   - Rozwiązanie: Ustawienie limitu czasu, retry logic lub zwrócenie specyficznego błędu timeout.

5. **Błędy walidacji parametrów wejściowych:**
   - Wyzwanie: Brak lub nieprawidłowy format wymaganych danych wejściowych.
   - Rozwiązanie: Wstępna walidacja wejścia przed wysłaniem żądania oraz jasne komunikaty o błędach.

## 6. Kwestie bezpieczeństwa

1. **Przechowywanie API Key:**
   - Przechowywanie w zmiennych środowiskowych lub bezpiecznym vaultcie, unikanie hardkodowania.
2. **Szyfrowanie połączenia:**
   - Wymuszenie korzystania z HTTPS dla wszystkich połączeń z API.
3. **Walidacja danych:**
   - Walidacja zarówno danych wejściowych, jak i odpowiedzi względem określonych schematów.
4. **Ograniczenie logowania:**
   - Unikanie logowania wrażliwych informacji, takich jak API Key i pełne zapytania.
5. **Rate Limiting:**
   - Implementacja mechanizmów ograniczania zapytań, by zabezpieczyć się przed nadużyciami.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska:**
   - Skonfigurować zmienne środowiskowe (API Key, endpoint, domyślny komunikat systemowy).
   - Zweryfikować dostępność endpointu API OpenRouter.

2. **Implementacja klasy OpenRouterService:**
   - Utworzyć nowy moduł (np. w /src/lib/openrouterService.ts) i zdefiniować konstruktor wraz z prywatnymi polami (_apiKey, _endpoint, _defaultSystemMessage, _modelName, _modelParams).

3. **Budowanie i weryfikacja zapytań:**
   - Zaimplementować metodę _buildPayload, która skomponuje zapytanie zawierające:
     a. Komunikat systemowy (np. "You are a helpful assistant.")
     b. Komunikat użytkownika (dynamiczny, przekazany do sendMessage)
     c. Ustrukturyzowany response_format, np.:
        { "type": "json_schema", "json_schema": { "name": "ChatResponse", "strict": true, "schema": { "answer": "string", "metadata": "object" } } }
     d. Nazwę modelu (np. "openrouter-llm-v1") oraz parametry modelu (np. { temperature: 0.7, max_tokens: 500, top_p: 0.9 }).

4. **Implementacja publicznych metod:**
   - Zaimplementować metodę sendMessage:
     a. Przyjmowanie komunikatu użytkownika oraz opcjonalnego dodatkowego kontekstu.
     b. Budowanie payload za pomocą _buildPayload.
     c. Wysyłanie zapytania do API oraz odbieranie odpowiedzi.
     d. Walidacja odpowiedzi za pomocą _validateResponse i zapisywanie jej w _lastResponse.
   - Zaimplementować metodę configure do aktualizacji konfiguracji usługi.
   - Zaimplementować metodę getLastResponse dla celów debugowania.

5. **Implementacja obsługi błędów:**
   - Zaimplementować metodę _handleError:
     a. Logowanie wystąpienia błędu.
     b. Wywołanie retry logic w przypadku błędów tymczasowych (np. Connection Error, Timeout).
     c. Zwracanie czytelnych komunikatów błędu do wywołującej metody.
