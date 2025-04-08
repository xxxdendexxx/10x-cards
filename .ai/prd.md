# Dokument wymagań produktu (PRD) - Fiszki AI

## 1. Przegląd produktu

Fiszki AI to aplikacja webowa stworzona z myślą o uczniach, którzy przygotowują się do bieżących lekcji i sprawdzianów. Aplikacja umożliwia szybkie tworzenie fiszek edukacyjnych przez wsparcie sztucznej inteligencji, a także oferuje możliwość ręcznego tworzenia, edycji i usuwania fiszek. Kluczową cechą jest integracja fiszek z gotowym, open-source algorytmem powtórek – metodą spaced repetition, która znacząco zwiększa efektywność nauki.

Kluczowe funkcjonalności:
- Generowanie propozycji fiszek przez AI na podstawie wprowadzonego tekstu.
- Ręczne tworzenie fiszek z polami "przód" i "tył".
- Przeglądanie, edycja oraz usuwanie fiszek.
- Zarządzanie kontem użytkownika (zmiana hasła, usunięcie konta).
- Automatyczna integracja zatwierdzonych fiszek z algorytmem powtórek.

## 2. Problem użytkownika

Problem:
Użytkownicy, szczególnie uczniowie, mają trudność w tworzeniu wysokiej jakości fiszek edukacyjnych. Manualne tworzenie wysokiej jakości fiszek wymaga dużych nakładów czasu i wysiłku, co zniechęca do korzystania z efektywnej metody nauki, jaką jest spaced repetition. Początkujący użytkownicy często mają problem z optymalnym podziałem informacji, co wpływa negatywnie na efektywność nauki metodą spaced repetition.

Wpływ problemu:
- Wydłużony czas przygotowania materiałów do nauki.
- Zniechęcenie do regularnego korzystania z metody powtórek.
- Ryzyko pominięcia kluczowych informacji, które mogłyby zostać lepiej zapamiętane przy poprawnie zdefiniowanych fiszkach.

## 3. Wymagania funkcjonalne

1. **Generowanie fiszek przez AI**
   - Użytkownik wprowadza tekst (kopiuj-wklej) do systemu.
   - AI generuje kandydatów na fiszki na podstawie wprowadzonego tekstu.
   - Kandydaci wyświetlają się w postaci listy, nie są automatycznie zapisywani.
   - Użytkownik ma możliwość:
     - Akceptacji lub odrzucenia każdej fiszki
     - Edycji treści proponowanych fiszek


2. **Ręczne tworzenie fiszek**
   - Formularz umożliwiający użytkownikowi tworzenie fiszek poprzez wpisanie zawartości pól:
     - Pole "przód" (front)
     - Pole "tył" (back)
   - Możliwość:
     - Zapisywania nowej fiszki
     - Edytowania już zapisanych fiszek
     - Usuwania niepotrzebnych fiszek
   - Ręczne tworzenie i wyświetlanie w ramach widoku listy "Moje fiszki"

3. **Przeglądanie, edycja i usuwanie fiszek**
   - Interfejs do przeglądania wszystkich fiszek użytkownika.
   - Funkcjonalność edycji umożliwiająca modyfikację zawartości fiszki.
   - Mechanizm usuwania z potwierdzeniem akcji dla zapobiegania przypadkowemu usunięciu.

4. **Zarządzanie kontem użytkownika**
   - Funkcje obejmują:
     - Bezpieczne logowanie i uwierzytelnianie
     - Zmianę hasła
     - Usunięcie konta (i powiązanych fiszek)
   - Użytkownik musi być zalogowany, aby uzyskać dostęp do swoich fiszek i ustawień konta.

5. **Integracja z algorytmem powtórek**
   - Zapewnienie mechanizmu przypisywania fiszek do harmonogramu powtórek (korzystanie z gotowego algorytmu).
   - Brak dodatkowych metadanych i zaawansowanych funkcji powiadomień w MVP.

6. **Statystyki generowania fiszek**
   - Zbieranie informacji o tym, ile fiszek zostało wygenerowanych przez AI i ile z nich ostatecznie zaakceptowano.

7. **Wymagania prawne i ograniczenia**
   - Dane osobowe użytkowników i fiszek przechowywane zgodnie z RODO.
   - Prawo do wglądu i usunięcia danych (konto wraz z fiszkami) na wniosek użytkownika.

## 4. Granice produktu

Zakres MVP obejmuje:
- Generowanie fiszek przez AI oraz ręczne tworzenie fiszek.
- Przeglądanie, edycję i usuwanie fiszek.
- Podstawowe zarządzanie kontem użytkownika (zmiana hasła, usunięcie konta) przy użyciu Supabase.
- Integrację z istniejącym algorytmem powtórek.

Nie wchodzi w zakres MVP:
- Opracowanie własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
- Import wielu formatów plików (PDF, DOCX, itp.).
- Udostępnianie i współdzielenie zestawów fiszek między użytkownikami.
- Integracje z innymi platformami edukacyjnymi.
- Aplikacje mobilne (wersja na początek tylko web).
- Zaawansowane funkcjonalności interfejsu użytkownika, które zostaną określone w kolejnych iteracjach.
  
## 5. Historyjki użytkowników

US-001  
Tytuł: Generowanie fiszek przez AI  
Opis: Użytkownik wprowadza tekst, z którego system AI generuje kandydatów na fiszki. Kandydaci są prezentowani w interfejsie w formie listy, gdzie użytkownik może je edytować, zatwierdzać lub odrzucać przed zapisaniem do bazy.  
Kryteria akceptacji:
- Użytkownik musi być zalogowany,
- Użytkownik wprowadza tekst przez dedykowany formularz.
- Po kliknięciu przycisku generowania aplikacja komunikuje się z API modelu LLM i wyświetla listę wygenerowanych propozycji fiszek,
- Kandydaci wyświetlają się w czytelnym interfejsie z opcjami edycji, zatwierdzenia lub odrzucenia.
- W przypadku problemów z API lub braku odpowiedzi modelu użytkownik zobaczy stosowny komunikat o błędzie.

US-002  
Tytuł: Ręczne tworzenie fiszek  
Opis: Użytkownik może stworzyć nową fiszkę ręcznie, wypełniając formularz z polami "przód" i "tył".  
Kryteria akceptacji:
- Użytkownik musi być zalogowany,
- W widoku "Moje fiszki" znajduje się przycisk dodania nowej fiszki.
- Formularz do tworzenia fiszki zawiera pola "przód" i "tył" z ograniczeniem znaków.
- Użytkownik może zapisać nową fiszkę.
- Po zapisaniu fiszka jest widoczna w interfejsie przeglądania.
- Opcje edycji i usuwania działają poprawnie.

US-003  
Tytuł: Zarządzanie fiszkami  
Opis: Użytkownik może przeglądać, edytować oraz usuwać istniejące fiszki przy użyciu intuicyjnego interfejsu.  
Kryteria akceptacji:
- Użytkownik musi być zalogowany,
- Lista wszystkich fiszek użytkownika jest wyświetlana.
- Każda fiszka posiada opcje edycji i usuwania.
- Przed usunięciem fiszki użytkownik musi potwierdzić akcję.

US-004
Tytuł: Bezpieczny dostęp i autoryzacja
Opis: Jako zalogowany użytkownik chcę mieć pewność, że moje fiszki nie są dostępne dla innych użytkowników, aby zachować prywatność i bezpieczeństwo danych.
Kryteria akceptacji:
- Tylko zalogowany użytkownik może wyświetlać, edytować i usuwać swoje fiszki.
- Nie ma dostępu do fiszek innych użytkowników ani możliwości współdzielenia.

US-005  
Tytuł: Sesja nauki z algorytmem powtórek
Opis: Użytkownik chce, aby dodane fiszki były dostępne w widoku "Sesja nauki" opartym na zewnętrznym algorytmie, aby móc efektywnie się uczyć (spaced repetition).
Kryteria akceptacji:
- Użytkownik musi być zalogowany,
- W widoku "Sesja nauki" algorytm przygotowuje dla mnie sesję nauki fiszek
- Na start wyświetlany jest przód fiszki, poprzez interakcję użytkownik wyświetla jej tył
- Użytkownik ocenia zgodnie z oczekiwaniami algorytmu na ile przyswoił fiszkę
- Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki

US-006  
Tytuł: Bezpieczne logowanie i uwierzytelnianie  
Opis: System wymaga, aby użytkownik zalogował się przed uzyskaniem dostępu do funkcji aplikacji. Proces uwierzytelniania zabezpiecza dane użytkownika i ogranicza dostęp wyłącznie do autoryzowanych użytkowników.  
Kryteria akceptacji:
- Użytkownik musi przejść proces logowania przed uzyskaniem dostępu do głównych funkcjonalności.
- Uwierzytelnianie odbywa się za pomocą bezpiecznych metod (np. HTTPS, tokeny).
- Dostęp do danych użytkownika oraz funkcji zmiany konta jest zarezerwowany dla zalogowanych użytkowników.

US-007
Tytuł: Rejestracja konta
Opis: Jako nowy użytkownik chcę się zarejestrować, aby mieć dostęp do własnych fiszek i móc korzystać z generowania fiszek przez AI.
Kryteria akceptacji:
- Formularz rejestracyjny zawiera pola na adres e-mail i hasło.
- Po poprawnym wypełnieniu formularza i weryfikacji danych konto jest aktywowane.
- Użytkownik otrzymuje potwierdzenie pomyślnej rejestracji i zostaje zalogowany.

US-008
Tytuł: Zarządzanie kontem użytkownika  
Opis: Użytkownik może zmienić swoje hasło lub usunąć konto poprzez interfejs konta, wykorzystując funkcjonalności oferowane przez Supabase.  
Kryteria akceptacji:
- Użytkownik musi być zalogowany, aby zarządzać kontem.
- Formularz umożliwia zmianę hasła i wysyła potwierdzenie zmiany.
- Proces usuwania konta wymaga potwierdzenia i po jego wykonaniu konto zostaje usunięte.

## 6. Metryki sukcesu
1. Efektywność generowania fiszek:
   - 75% wygenerowanych przez AI fiszek jest akceptowanych przez użytkownika.
   - Użytkownicy tworzą co najmniej 75% fiszek z wykorzystaniem AI (w stosunku do wszystkich nowo dodanych fiszek).
3. Zaangażowanie:
   - Monitorowanie liczby wygenerowanych fiszek i porównanie z liczbą zatwierdzonych do analizy jakości i użyteczności.
