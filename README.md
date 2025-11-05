# Aplikacja Spedycyjna

## Opis Funkcjonalny
Planujemy stworzyć aplikację umożliwiającą zarządzanie firmą spedycyjną. Aplikacja będzie zawierała w sobie dashboard dzięki, któremu zarządzający firmą będą mogli:
- Zarządzać klientami - wyciągać informacje min. o imionach, nazwiskach, numerach NIP itp. swoich klientów
- Obsługiwać zlecenia - rejestrowanie, edytowanie oraz śledzenie statusów zleceń
- Zarządzać kierowcami - przypisywanie kierowcom zleceń/pojazdów
- Zarządzanie flotą pojazdów - dodawanie pojazdów do bazy danych, modyfikowanie informacji o nich oraz ich usuwanie
- Zarządzanie trasami przewozów - Dodawanie nowych tras, edycja aktualnie istniejących, obliczanie dystansu i przewidywanego czasu przejazdów

Możliwe dodatkowe feature-y aplikacji (jeżeli czas pozwoli):
- Autentykacja użytkowników (w szczególności sprawdzanie czy ktoś ma uprawnienia admina)
- Zgłaszanie błędów na temat aplikacji (feedback)

## Opis Technologiczny
Planujemy użyć następującego tech-stacku:
- Frontend - React, Bootstrap - z możliwością rozszerzenia o dodatkowe frameworki/biblioteki
- Backend - .NET Web API
- Hosting - Render
- CI/CD - Github Actions
