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
Użytkownicy, szczególnie uczniowie, mają trudność w tworzeniu wysokiej jakości fiszek edukacyjnych. Ręczne tworzenie fiszek zajmuje średnio 3 minuty na jedną fiszkę, co jest czasochłonne. Początkujący użytkownicy często mają problem z optymalnym podziałem informacji, co wpływa negatywnie na efektywność nauki metodą spaced repetition.

Wpływ problemu:
- Wydłużony czas przygotowania materiałów do nauki.
- Zniechęcenie do regularnego korzystania z metody powtórek.
- Ryzyko pominięcia kluczowych informacji, które mogłyby zostać lepiej zapamiętane przy poprawnie zdefiniowanych fiszkach.

## 3. Wymagania funkcjonalne

1. **Generowanie fiszek przez AI**
   - Użytkownik wprowadza tekst (kopiuj-wklej) do systemu.
   - AI generuje kandydatów na fiszki na podstawie wprowadzonego tekstu.
   - Kandydaci wyświetlają się w interfejsie recenzji, nie są automatycznie zapisywani.
   - Użytkownik ma możliwość:
     - Szybkiej recenzji (do 10 sekund na fiszkę)
     - Edycji treści proponowanych fiszek
     - Akceptacji lub odrzucenia każdej fiszki
   - Walidacja limitów znaków dla pól tekstowych zapewnia spójność danych.

2. **Ręczne tworzenie fiszek**
   - Formularz umożliwiający użytkownikowi tworzenie fiszek poprzez wpisanie zawartości pól:
     - Pole "przód" (front)
     - Pole "tył" (back)
   - Możliwość:
     - Zapisywania nowej fiszki
     - Edytowania już zapisanych fiszek
     - Usuwania niepotrzebnych fiszek
   - Automatyczna walidacja danych wprowadzanych przez użytkownika.

3. **Przeglądanie, edycja i usuwanie fiszek**
   - Interfejs do przeglądania wszystkich fiszek użytkownika.
   - Funkcjonalność edycji umożliwiająca modyfikację zawartości fiszki.
   - Mechanizm usuwania z potwierdzeniem akcji dla zapobiegania przypadkowemu usunięciu.

4. **Zarządzanie kontem użytkownika**
   - System kont użytkowników oparty na Supabase (PostgreSQL).
   - Funkcje obejmują:
     - Bezpieczne logowanie i uwierzytelnianie
     - Zmianę hasła
     - Usunięcie konta
   - Użytkownik musi być zalogowany, aby uzyskać dostęp do swoich fiszek i ustawień konta.

5. **Integracja z algorytmem powtórek**
   - Zatwierdzone fiszki są automatycznie integrowane z open-source algorytmem powtórek.
   - Proces integracji odbywa się bez dodatkowych konfiguracji przez użytkownika.
   - System zapewnia potwierdzenie poprawnego przesłania fiszek do modułu powtórek.

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
  
Dodatkowo, w przyszłych iteracjach planowane jest rozszerzenie o funkcjonalność rozwiązywania quizów.

## 5. Historyjki użytkowników

US-001  
Tytuł: Generowanie fiszek przez AI  
Opis: Użytkownik wprowadza tekst, z którego system AI generuje kandydatów na fiszki. Kandydaci są prezentowani w interfejsie recenzji, gdzie użytkownik może je edytować, zatwierdzać lub odrzucać przed zapisaniem do bazy.  
Kryteria akceptacji:
- Użytkownik wprowadza tekst przez dedykowany formularz.
- System generuje listę kandydatów na fiszki.
- Kandydaci wyświetlają się w czytelnym interfejsie z opcjami edycji, zatwierdzenia lub odrzucenia.
- Średni czas recenzji pojedynczego kandydata nie przekracza 10 sekund.

US-002  
Tytuł: Ręczne tworzenie fiszek  
Opis: Użytkownik może stworzyć nową fiszkę ręcznie, wypełniając formularz z polami "przód" i "tył".  
Kryteria akceptacji:
- Formularz do tworzenia fiszki zawiera pola "przód" i "tył" z ograniczeniem znaków.
- Użytkownik może zapisać nową fiszkę.
- Po zapisaniu fiszka jest widoczna w interfejsie przeglądania.
- Opcje edycji i usuwania działają poprawnie.

US-003  
Tytuł: Zarządzanie fiszkami  
Opis: Użytkownik może przeglądać, edytować oraz usuwać istniejące fiszki przy użyciu intuicyjnego interfejsu.  
Kryteria akceptacji:
- Lista wszystkich fiszek użytkownika jest wyświetlana.
- Każda fiszka posiada opcje edycji i usuwania.
- Przed usunięciem fiszki użytkownik musi potwierdzić akcję.

US-004  
Tytuł: Zarządzanie kontem użytkownika  
Opis: Użytkownik może zmienić swoje hasło lub usunąć konto poprzez interfejs konta, wykorzystując funkcjonalności oferowane przez Supabase.  
Kryteria akceptacji:
- Użytkownik musi być zalogowany, aby zarządzać kontem.
- Formularz umożliwia zmianę hasła i wysyła potwierdzenie zmiany.
- Proces usuwania konta wymaga potwierdzenia i po jego wykonaniu konto zostaje usunięte.

US-005  
Tytuł: Integracja fiszek z algorytmem powtórek  
Opis: Po zatwierdzeniu fiszki, system automatycznie przesyła jej dane do open-source algorytmu powtórek, który ustala harmonogram powtórek.  
Kryteria akceptacji:
- Po zatwierdzeniu fiszki, dane są automatycznie przesyłane do modułu powtórek.
- Integracja następuje bez konieczności dodatkowej konfiguracji przez użytkownika.
- Użytkownik otrzymuje komunikat potwierdzający integrację.

US-006  
Tytuł: Bezpieczne logowanie i uwierzytelnianie  
Opis: System wymaga, aby użytkownik zalogował się przed uzyskaniem dostępu do funkcji aplikacji. Proces uwierzytelniania zabezpiecza dane użytkownika i ogranicza dostęp wyłącznie do autoryzowanych użytkowników.  
Kryteria akceptacji:
- Użytkownik musi przejść proces logowania przed uzyskaniem dostępu do głównych funkcjonalności.
- Uwierzytelnianie odbywa się za pomocą bezpiecznych metod (np. HTTPS, tokeny).
- Dostęp do danych użytkownika oraz funkcji zmiany konta jest zarezerwowany dla zalogowanych użytkowników.

## 6. Metryki sukcesu

- 75% fiszek wygenerowanych przez AI musi być zaakceptowanych przez użytkowników.
- Użytkownicy powinni korzystać z AI do tworzenia co najmniej 75% wszystkich fiszek.
- Średni czas tworzenia fizycznej fiszki ręcznie wynosi około 3 minuty.
- Średni czas recenzji pojedynczego kandydata wygenerowanego przez AI wynosi około 10 sekund.
- System powinien monitorować stosunek zaakceptowanych kandydatów do wszystkich wygenerowanych fiszek.
- Dodatkowo, liczba aktywnych i zaangażowanych użytkowników będzie monitorowana jako wskaźnik skuteczności wdrożenia produktu.