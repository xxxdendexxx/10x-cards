# Architektura UI dla Fiszki AI

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika opiera się na modularnej strukturze z wyraźnym podziałem na niezależne widoki, które odpowiadają kluczowym funkcjonalnościom określonym w PRD i planie API. System jest zbudowany przy użyciu React, Astro, Tailwind CSS oraz komponentów Shadcn/ui, co zapewnia responsywność, dostępność (ARIA, obsługa klawiatury) i wysoki poziom bezpieczeństwa. Dane są synchronizowane z API przy użyciu dedykowanych hooków i React Context, a interfejs umożliwia intuicyjną nawigację między widokami przy zachowaniu spójnego stylu graficznego oraz interakcji użytkownika.

## 2. Lista widoków

### Widok logowania (Autoryzacja)
- **Ścieżka widoku:** `/login`
- **Główny cel:** Umożliwić użytkownikowi bezpieczne logowanie do aplikacji.
- **Kluczowe informacje do wyświetlenia:** 
  - Formularz logowania (adres e-mail, hasło)
  - Komunikaty błędów przy niepoprawnych danych
  - Opcja przejścia do rejestracji
- **Kluczowe komponenty widoku:** 
  - Formularz logowania
  - Przycisk submit
  - Alerty/komunikaty błędów
- **UX, dostępność i względy bezpieczeństwa:** 
  - Walidacja pól w locie
  - ARIA i obsługa klawiatury
  - Szyfrowane przesyłanie danych (HTTPS)

### Dashboard z topbarem
- **Ścieżka widoku:** `/dashboard`
- **Główny cel:** Prezentacja ogólnych statystyk oraz umożliwienie szybkiego dostępu do kluczowych funkcji.
- **Kluczowe informacje do wyświetlenia:** 
  - Statystyki generowania fiszek (liczba wygenerowanych propozycji, liczba zaakceptowanych)
  - Podsumowanie profilu użytkownika
- **Kluczowe komponenty widoku:** 
  - Topbar z Navigation Menu (Shadcn/ui)
  - Karty statystyk
  - Skróty do poszczególnych widoków (np. generowanie fiszek, lista fiszek, panel użytkownika)
- **UX, dostępność i względy bezpieczeństwa:** 
  - Intuicyjna nawigacja i responsywność
  - Czytelne wizualizacje danych
  - Zabezpieczenie informacji użytkownika

### Widok generowania fiszek
- **Ścieżka widoku:** `/generate`
- **Główny cel:** Umożliwić generowanie propozycji fiszek przy użyciu AI na podstawie wprowadzonego tekstu.
- **Kluczowe informacje do wyświetlenia:** 
  - Formularz wprowadzania źródłowego tekstu
  - Lista propozycji fiszek (z polami „przód” i „tył”)
  - Dynamiczny przycisk "Zapisz zatwierdzone", aktywny gdy przynajmniej jedna fiszka została zaakceptowana
- **Kluczowe komponenty widoku:** 
  - Formularz inputowy z walidacją
  - Lista elementów reprezentujących fiszki z opcjami: akceptacji, edycji (przez modal) i odrzucenia
  - Modal edycji z inline walidacją
  - Przycisk zbiorczego zapisu zatwierdzonych fiszek
- **UX, dostępność i względy bezpieczeństwa:** 
  - Natychmiastowa walidacja wejścia i wyświetlanie komunikatów błędów inline
  - Responsywny projekt i dostępność ARIA
  - Zabezpieczenie przed nieautoryzowanym dostępem

### Widok listy fiszek
- **Ścieżka widoku:** `/flashcards`
- **Główny cel:** Umożliwić użytkownikowi przegląd, edycję, usuwanie **oraz ręczne dodawanie** zapisanych fiszek.
- **Kluczowe informacje do wyświetlenia:** 
  - Lista wszystkich fiszek użytkownika (sortowanie według daty generacji)
- **Kluczowe komponenty widoku:** 
  - **Przycisk "Dodaj fiszkę"**
  - Lista kart fiszek z przyciskami akcji (edycja, usunięcie)
  - Modal do edycji wybranej fiszki z walidacją inline
  - Mechanizm paginacji
- **UX, dostępność i względy bezpieczeństwa:** 
  - Intuicyjna interakcja z funkcjami edycji oraz potwierdzanie operacji usunięcia
  - Zabezpieczenie operacji modyfikacji danych

### Panel użytkownika
- **Ścieżka widoku:** `/user`
- **Główny cel:** Zapewnić użytkownikowi możliwości zarządzania kontem, takie jak zmiana hasła czy usunięcie konta.
- **Kluczowe informacje do wyświetlenia:** 
  - Dane konta (e-mail, data utworzenia itp.)
  - Formularz do zmiany hasła
  - Opcja usunięcia konta z potwierdzeniem
- **Kluczowe komponenty widoku:** 
  - Formularze zarządzania kontem
  - Przycisk akcji dla krytycznych operacji (usun konto) z potwierdzeniem
- **UX, dostępność i względy bezpieczeństwa:** 
  - Bezpieczne przetwarzanie danych i walidacja formularzy
  - Zgodność z RODO oraz stosowanie standardów dostępności
  - Jasne komunikaty dotyczące ryzykownych operacji

### Widok sesji powtórkowych (przyszłościowy)
- **Ścieżka widoku:** `/session`
- **Główny cel:** Umożliwić prowadzenie sesji nauki fiszek przy użyciu algorytmu spaced repetition (funkcja do wdrożenia w kolejnych iteracjach).
- **Kluczowe informacje do wyświetlenia:** 
  - Prezentacja fiszek do powtórek
  - Mechanizm oceny przyswajania (przyciski oceny, licznik postępów)
- **Kluczowe komponenty widoku:** 
  - Interaktywny interfejs sesji
  - Komponenty oceny i prezentacji kolejnych fiszek
- **UX, dostępność i względy bezpieczeństwa:** 
  - Minimalistyczny i intuicyjny interfejs
  - Responsywny design oraz dostępność (np. użycie ARIA)
  - Przyszła integracja z zabezpieczeniami API

## 3. Mapa podróży użytkownika

1. **Start i logowanie:**
   - Użytkownik wchodzi na stronę i trafia do widoku logowania (`/login`).
   - Po poprawnym logowaniu następuje przekierowanie na dashboard.

2. **Dashboard i wybór funkcji:**
   - Na dashboardzie widoczne są statystyki oraz skróty do głównych funkcji.
   - Użytkownik wybiera widok generowania fiszek lub jest automatycznie przekierowywany do `/generate`.

3. **Generowanie fiszek:**
   - Użytkownik wprowadza tekst źródłowy, który jest przesyłany do API generującego propozycje fiszek.
   - Na tej samej stronie wyświetlana jest lista fiszek, z opcjami edycji (przez modal), akceptacji i odrzucenia.
   - Aktywacja przycisku "Zapisz zatwierdzone" następuje po zaakceptowaniu co najmniej jednej fiszki.

4. **Zarządzanie zapisanymi fiszkami:**
   - Po zatwierdzeniu fiszek użytkownik przechodzi do widoku listy fiszek (`/flashcards`), gdzie może przeglądać, edytować lub usuwać fiszki.
   - **Użytkownik może również ręcznie dodać nową fiszkę, klikając przycisk "Dodaj fiszkę", co otworzy modal/formularz do wprowadzenia danych.**
   - Paginacja ułatwia przeglądanie dużych zbiorów fiszek.

5. **Zarządzanie kontem:**
   - Użytkownik przechodzi do panelu użytkownika (`/user`) w celu zmiany hasła lub usunięcia konta.

6. **Sesja nauki (wydanie przyszłościowe):**
   - Użytkownik wybiera widok sesji powtórkowych (`/session`), aby rozpocząć naukę przy użyciu algorytmu spaced repetition.

## 4. Układ i struktura nawigacji

- **Topbar/Navigation Menu:** 
  - Stały element widoczny na wszystkich stronach po zalogowaniu, wykorzystujący komponent Navigation Menu z Shadcn/ui.
  - Zawiera linki do głównych widoków: Generowanie fiszek, Moje fiszki, Panel użytkownika oraz (w przyszłości) Sesja powtórkowa.
  - Dodatkowo wyświetla skrót do statystyk oraz przycisk wylogowania.

- **Nawigacja wewnętrzna:**
  - W widoku listy fiszek zastosowany zostanie mechanizm paginacji oraz opcje sortowania (na razie według daty).
  - Responsywne menu mobilne zapewni łatwy dostęp do wszystkich funkcji.

## 5. Kluczowe komponenty

- **Topbar/Navigation Menu:** Centralny element nawigacyjny umożliwiający szybki dostęp do głównych widoków i funkcji.
- **Formularze:** Wykorzystywane w widokach logowania, generowania fiszek oraz zarządzania kontem, z walidacją inline i obsługą błędów.
- **Lista fiszek:** Komponent do wyświetlania zestawu fiszek z funkcjami edycji, usuwania oraz paginacji.
- **Modal edycji:** Dynamiczny interfejs do modyfikacji treści pojedynczych fiszek z natychmiastową walidacją.
- **Modal/Formularz dodawania fiszki:** Interfejs do ręcznego tworzenia nowej fiszki (przód, tył) z walidacją.
- **Komponenty statystyk:** Wizualizacja danych (np. liczba wygenerowanych i zaakceptowanych fiszek) na dashboardzie.
- **Alerty i komunikaty błędów:** System wyświetlania komunikatów informujących o błędach lub potwierdzających wykonanie akcji w sposób jasny i dostępny.