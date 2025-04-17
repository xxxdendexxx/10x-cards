<authentication_analysis>
Diagram przedstawia pełny cykl autentykacji wykorzystywany w aplikacji. 
Główni aktorzy to:
- Przeglądarka (interfejs użytkownika)
- Middleware (obsługa sesji i wstępna konfiguracja)
- Astro API (endpointy autoryzacyjne, np. /api/auth/login, /api/auth/signup, /api/auth/logout, /api/auth/password-reset)
- Supabase Auth (mechanizm autentykacji Supabase, odpowiadający za signIn, signUp, signOut oraz reset hasła)

Procesy autentykacji:
1. Logowanie: 
   - Użytkownik wypełnia formularz logowania w przeglądarce.
   - Przeglądarka wysyła żądanie (POST /api/auth/login) z danymi logowania do Astro API.
   - Astro API wywołuje metodę signInWithPassword na Supabase Auth.
   - Supabase Auth weryfikuje dane i zwraca token sesji lub błąd.
   - Token jest przekazywany do przeglądarki, która rozpoczyna sesję.

2. Rejestracja:
   - Użytkownik wypełnia formularz rejestracji.
   - Przeglądarka wysyła żądanie (POST /api/auth/signup) do Astro API.
   - Astro API kieruje dane do Supabase Auth, wywołując metodę signUp.
   - W odpowiedzi użytkownik otrzymuje potwierdzenie utworzenia konta lub komunikat o błędzie.

3. Odzyskiwanie hasła:
   - Użytkownik inicjuje proces resetu hasła (POST /api/auth/password-reset).
   - Astro API wywołuje metodę resetPasswordForEmail na Supabase Auth.
   - Użytkownik otrzymuje potwierdzenie wysłania linku resetującego.

4. Wylogowywanie:
   - Użytkownik wysyła żądanie wylogowania (POST /api/auth/logout).
   - Astro API wywołuje metodę signOut na Supabase Auth, co kończy sesję.

5. Odświeżanie tokenu:
   - W przypadku wygasłego tokena, przeglądarka wykrywa błąd autoryzacji i wysyła żądanie odświeżenia tokena.
   - Astro API kontaktuje się z Supabase Auth, aby uzyskać nowy token, który jest przekazywany z powrotem do przeglądarki.
</authentication_analysis>

<mermaid_diagram>
```mermaid
sequenceDiagram
    autonumber
    participant B as Przeglądarka
    participant M as Middleware
    participant A as Astro API
    participant S as Supabase Auth

    B->>A: POST /api/auth/login (dane logowania)
    activate A
    A->>S: signInWithPassword(email, password)
    activate S
    S-->>A: Token/Session lub błąd
    deactivate S
    A-->>B: Response (token lub komunikat o błędzie)
    deactivate A

    B->>A: POST /api/auth/signup (dane rejestracji)
    activate A
    A->>S: signUp (email, password)
    activate S
    S-->>A: Nowe konto lub błąd
    deactivate S
    A-->>B: Response (potwierdzenie rejestracji)
    deactivate A

    B->>A: POST /api/auth/password-reset (email)
    activate A
    A->>S: resetPasswordForEmail(email)
    activate S
    S-->>A: Potwierdzenie wysłania linku resetowania
    deactivate S
    A-->>B: Response (link wysłany lub błąd)
    deactivate A

    B->>A: POST /api/auth/logout
    activate A
    A->>S: signOut()
    activate S
    S-->>A: Potwierdzenie wylogowania
    deactivate S
    A-->>B: Response (wylogowano)
    deactivate A

    Note right of B: Po zalogowaniu przeglądarkaprzechowuje token i synchronizuje sesję

    alt Token wygasł
       B-->>A: Żądanie odświeżenia tokena
       activate A
       A->>S: Request token refresh
       activate S
       S-->>A: Nowy token
       deactivate S
       A-->>B: Response (nowy token)
       deactivate A
    else Token ważny
       Note over B: Kontynuacja normalnej sesji
    end
```
</mermaid_diagram> 