# MENTAL BALANCE by Anna

Mobilna aplikacja webowa (MVP) wspierająca codzienny balans i zdrowie mózgu.
Bez logowania, bez backendu, bez zewnętrznych API. Wszystkie dane zostają w przeglądarce.

## Czym to jest

Prosty model człowieka w siedmiu obszarach — **Emocje, Regeneracja, Umysł, Działanie, Ciało,
Relacje, Sens** — plus talia 28 aktywacji od 3 do 15 minut. Aplikacja dobiera kartę do aktualnej
potrzeby, dostępnego czasu i wcześniejszych reakcji użytkowniczki.

Zasada produktu: *personalizacja nie oznacza losowych porad. Oznacza dobór sprawdzonych aktywacji
do konkretnej osoby, jej stanu, dostępnego czasu i wcześniejszych reakcji.*

### Bez ekranu onboardingu

Nie ma testu na wejściu. Aplikacja startuje od razu w **Talii**, a Mapa Balansu buduje się w tle:

- co trzy karty pojawia się **karta-sonda** — jedno pytanie o jeden obszar, skala 1–5,
- odpowiedź dopisuje obszar do dzisiejszego wyniku Mapy Balansu,
- obszary bez odpowiedzi zostają widoczne jako „jeszcze nie wiemy” — nic nie jest zgadywane,
- kto woli, może uzupełnić wszystkie pytania naraz na ekranie **Balans**.

### Gest na stosie kart

Lewo i prawo znaczą co innego, choć oba zdejmują kartę:

| Gest | Znaczenie | Skutek |
| --- | --- | --- |
| przeciągnięcie w prawo | „to o mnie” | karta trafia do zapisanych, obszar zyskuje +2 w doborze |
| przeciągnięcie w lewo | „nie teraz” | karta schodzi niżej w rankingu (do −3), wraca później |
| przycisk „Wykonaj” | start aktywacji | pełny tryb skupienia z timerem |

Gest obsługuje mysz i dotyk (Pointer Events). Klawiatura: strzałki w lewo i w prawo.
Wykonanie karty celowo nie jest gestem — za łatwo odpalić je przypadkiem.

## Uruchomienie

```bash
npm install
npm run dev
```

Build produkcyjny i kontrola typów:

```bash
npm run build      # tsc --noEmit && vite build
npm run typecheck  # sama kontrola typów
npm run preview    # podgląd builda
```

Stack: Vite + React + TypeScript, zwykły CSS, ikony `lucide-react`. Bez bibliotek UI.

## Struktura

```
src/
  components/   karty, modale, mapa balansu, gest swipe, timer, skale
  screens/      Dzisiaj, Talia, Kalendarz, Balans
  data/         obszary, talia 28 kart, cele, moduł „Mózg na lata”
  services/     storage, rekomendacje, wnioski, dane demonstracyjne
  hooks/        useAppState — jedno źródło prawdy + zapis do localStorage
  utils/        daty, identyfikatory, przeliczanie Mapy Balansu
  types/        BalanceArea, BalanceSnapshot, ActivationCard, UserProfile,
                DailyCheckIn, ActivationSession, CalendarEntry, Swipe, AppState
```

## Przechowywanie danych

- Klucz: `mental-balance:v1` w `localStorage`.
- Odczyt jest odporny na uszkodzony JSON — w razie błędu wraca stan domyślny.
- Migracja uzupełnia brakujące pola zamiast wywalać aplikację.
- Ekran **Balans** pozwala: załadować dane demonstracyjne, wyeksportować dane do pliku JSON,
  usunąć wszystko (z potwierdzeniem w interfejsie).
- Nic nie jest wysyłane na serwery. Nie ma kont ani analityki.

## Algorytm rekomendacji

Deterministyczny, punktowy (`src/services/recommend.ts`), bez losowania i bez AI:

| Warunek | Punkty |
| --- | --- |
| karta pasuje do potrzeby z check-inu | +4 |
| wspiera jeden z dwóch najsłabszych **poznanych** obszarów | +3 |
| trafia w obszar wskazany przez cele lub karty zatrzymane w prawo | +2 |
| mieści się w dostępnym czasie | +2 (poza czasem: −4) |
| nie była używana od co najmniej trzech dni | +2 |
| wcześniej dawała wyraźną poprawę (średnia zmiana ≥2 / ≥1 / >0) | +3 / +2 / +1 |
| wcześniej pogarszała samopoczucie | −1 |
| odrzucona wcześniej w lewo | −1 za każde odrzucenie, maks. −3 |
| stan ≤2, a karta wymaga wysokiej energii | −2 |

Do wyniku dochodzi mikroskopijny, stały tie-break zależny od pozycji karty, żeby kolejność była
powtarzalna między renderami. „Pokaż inną” przechodzi po rankingu w dół, nie losuje.

Ekran **Balans** generuje „Twoją osobistą instrukcję obsługi” z lokalnej historii
(`src/services/insights.ts`) — np. co działało przy niskim starcie, jaka długość aktywacji dawała
najwięcej, o jakiej porze dnia najczęściej sięgasz po karty, ile z zaplanowanych kart faktycznie
wykonujesz. Przy zbyt małej liczbie danych mówi wprost, że wzorca jeszcze nie widać.

## Ograniczenia medyczne

Aplikacja wspiera codzienne nawyki związane z wellbeingiem i zdrowiem mózgu. **Nie diagnozuje**
zaburzeń psychicznych, łagodnych zaburzeń poznawczych ani demencji. Nie obiecuje zapobiegania
demencji. Mapa Balansu jest narzędziem do autorefleksji, a nie testem medycznym.

W razie postępujących problemów z pamięcią lub codziennym funkcjonowaniem — kontakt z lekarzem.
W sytuacji bezpośredniego zagrożenia — numer **112**. Pełna informacja jest w aplikacji, w sekcji
„O metodzie”, razem ze źródłami (The Lancet Commission / UCL, US POINTER / JAMA, Brain Care Score).

Talia nie zawiera ćwiczeń z długim wstrzymywaniem oddechu ani ekspozycji na zimno. Karty, które
tego wymagają, mają widoczne zastrzeżenie bezpieczeństwa.

## Poza zakresem tego MVP

Brak logowania, backendu, płatności, czatu AI, społeczności, powiadomień push, integracji ze
zdrowiem systemowym, panelu administracyjnego. Nie ma też przycisków sugerujących te funkcje.
Miejsce na prowadzenie Anny jest przygotowane jako komponent `AnnaGuide` z monogramem — wystarczy
podmienić zawartość na odtwarzacz audio lub wideo.

## Proponowane następne kroki

1. Nagrania Anny w `AnnaGuide` (audio 30–60 s na kartę).
2. Eksport Mapy Balansu jako obrazka do udostępnienia.
3. Więcej kart i wariantów czasowych tej samej praktyki.
4. Delikatne przypomnienia (najpierw jako lokalne, w aplikacji — nie push).
5. Synchronizacja między urządzeniami — dopiero razem z kontem i świadomą zgodą.
