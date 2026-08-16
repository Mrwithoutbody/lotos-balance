# TASKS — Lotos Balance (satelita) + agregator

Układ: `transformness.space` = agregator wellness (katalog specjalistów), `/anna-rysnik` = apka
satelitarna Anny. Jedna baza kodu, jeden deploy — `/` to agregator, `/<slug>` to satelita.

Agregator = osobne repo `../transformness-space` (decyzja 2026-08-16); sekcje C–E do
przeniesienia tam, gdy ruszy. Założenie robocze: pieniądze na razie NIE przechodzą przez
platformę (specjaliści linkują do własnych rezerwacji).

Kolejność = priorytet. Źródło: audyt UX 3 agentów (2026-08-16) + wiadomości Anny z 15.08.

## A. Satelita Anny — może wkleić link (jedna sesja)

Zrobione 2026-08-16, commit `48a3ed1` (1–2, 4–9; wdrożone na produkcję).
Otwarte zostaje tylko zadanie 3 — wiadomość do Anny, nie kod.

1. ✅ **Domyślny tab „Programy"**
   - Zrobione: `useState('programy')`; tab „Aktywność" (segmented) renderowany
     tylko gdy feed ma wpisy — pusty krąg nie pokazuje tabów wcale.

2. ✅ **Copy bez żargonu**
   - Zrobione: „ćwiczenie/ćwiczenia/ćwiczeń" (helper `plural()`), „program",
     „Aktywność", „Twoje postępy, {imię}" w `CircleScreen.tsx`; „aktywacje"→
     „ćwiczenia" w `AboutModal.tsx`. Dogrywka `7c8133d`: ten sam żargon
     wymieciony z całej apki satelity (Dzisiaj/Program/Kalendarz/Balans,
     odtwarzacz, arkusze, insighty) — tylko stringi UI, identyfikatory
     (`'talia'` w TabId/source) zostały, żeby nie psuć zapisanych sesji.
   - Druga dogrywka: `7c8133d` minęło trzecie słowo — „karta". Kalendarz mówił
     „Dodaj kartę" tuż nad „Brak zaplanowanych ćwiczeń", ten sam byt pod dwiema
     nazwami. Domknięte: „karta"→„ćwiczenie" w Kalendarzu, `CardPicker`,
     `PlanSheet`, `CardPlayer`, `DeckScreen`; `plural()` wyjęty do
     `utils/plural.ts` (był lokalny w `CircleScreen`, `DeckScreen` miał własny
     błędny wariant „2 kart"). Przy okazji odmiana: „na niedziela, 16 sierpnia"
     → myślnik, bo `longDate` daje mianownik. `kind: 'karta'` w kolejce talii
     zostaje — identyfikator.

3. **Link w bio Anny na `/anna-rysnik`**
   - Problem: `/` to agregator dla całej branży, a fan Anny przychodzi po nią, nie po katalog.
   - Zrobić: przekazać Annie adres `transformness.space/anna-rysnik` jako jedyny link do promocji (auto-follow już tam działa).
   - Rozwiązuje: rozjazd między wejściem platformowym a satelitarnym.

4. ✅ **Schować „Zaloguj się" na `/`**
   - Zrobione: przycisk w app-barze kręgu usunięty (komentarz odsyła do zad. 17);
     zniknął też dopisek „Zaloguj się, aby dołączyć…" pod kartą twórczyni.
     `/logowanie` nadal działa po wpisaniu adresu ręcznie.

5. ✅ **Jeden primary CTA na karcie twórczyni**
   - Zrobione: jeden przycisk „Zacznij pierwsze ćwiczenie (3 min)" → talia;
     „Dołącz do kręgu" + cała mutacja follow usunięte z `CreatorCard`
     (follow automatyczny przy wejściu na talię, z commita `9f844e9`).

6. ✅ **Statystyki użytkowniczki pod taby**
   - Zrobione: sekcja `done`/`streak` przeniesiona pod treść tabów; renderuje
     się tylko przy `done > 0` (wcześniej też dla zalogowanych z zerem).

7. ✅ **Licznik osób w kręgu od ≥10**
   - Zrobione: `followers >= 10` + poprawna odmiana przez `plural()`.

8. ✅ **Akcja w pustym feedzie**
   - Zrobione inaczej niż w opisie: pusty/błędny feed w ogóle się nie renderuje
     (zad. 1) — user ląduje w „Programach" z CTA „Zacznij pierwsze ćwiczenie",
     więc osobny przycisk i gałąź `feed.isError` stały się zbędne.

9. ✅ **Feed bez rodzaju męskiego**
   - Zrobione: „Ukończone: «{tytuł}»" (bez „przed chwilą" — pod spodem i tak
     stoi data, dublowałaby się).

## B. Wartość satelity — jest po co wracać

10. **Medytacje Anny w R2**
    - Problem: follow i krąg nie dają dziś nic, czego nie ma za darmo na IG.
    - Zrobić: wgrać nagrania Anny jako karty `kind: 'audio'` przez `scripts/export-deck.ts` + `upload-deck.sh`.
    - Rozwiązuje: brak treści, dla której warto zostać w apce (i późniejszy przedmiot subskrypcji).

11. **Feed jako agregat tygodniowy**
    - Problem: anonimowa telemetria „ktoś ukończył kartę" nie buduje ani więzi, ani FOMO.
    - Zrobić: zamienić listę na jedną linijkę „N ćwiczeń w kręgu w tym tygodniu" na karcie twórczyni.
    - Rozwiązuje: pusty feed jako fałszywą obietnicę społeczności; prawdziwy feed wraca z postami Anny.

12. **Hero twórczyni gdy jest jedna** *(rusztowanie — usunąć, gdy katalog urośnie)*
    - Problem: przy jednej twórczyni `/` wygląda jak pusty marketplace.
    - Zrobić: renderować `CreatorCard` jako hero nad tabami gdy `creators.length === 1`.
    - Rozwiązuje: rozjazd między obietnicą katalogu a stanem faktycznym na starcie.

## C. Agregator — `transformness.space`

13. **Domena na Cloudflare i podpięcie do Pages**
    - Problem: projekt żyje pod `lotos-balance.pages.dev`, czyli pod adresem satelity, nie platformy.
    - Zrobić: dokończyć przepięcie nameserverów `transformness.space` w cyber_Folks, potem dodać custom domain (apex + `www`) do projektu `lotos-balance`.
    - Rozwiązuje: brak własnego adresu platformy, od którego zależy branding i poczta.

14. **Rodzaj wpisu w katalogu**
    - Problem: `creators` zakłada, że każdy wpis ma talię ćwiczeń, a specjalista od hipnozy jej nie ma.
    - Zrobić: kolumna `kind TEXT DEFAULT 'deck'` (`'deck' | 'specialist'`) w `creators` + rozgałęzienie renderu w `CircleScreen`.
    - Rozwiązuje: pomieszczenie dwóch różnych bytów w jednym katalogu bez drugiego repo.

15. **Profil specjalisty bez płatności**
    - Problem: specjaliści Anny chcą być w apce, a wejście w płatności za usługi zdrowotne to miesiące pracy i odpowiedzialność prawna.
    - Zrobić: profil = zdjęcie, opis, specjalizacja, przycisk wychodzący do jego własnego systemu rezerwacji.
    - Rozwiązuje: obecność specjalistów w katalogu przy zerowym ryzyku finansowym platformy.

16. **Regulamin, moderacja i weryfikacja kwalifikacji**
    - Problem: agregat specjalistów od zdrowia (hipnoza, medium) czyni z nas pośrednika, a nie tylko hosting treści.
    - Zrobić: regulamin platformy, procedura weryfikacji wpisu przed publikacją, kontakt do zgłaszania nadużyć.
    - Rozwiązuje: odpowiedzialność prawną platformy — warunek wejścia, nie dodatek na później.

## D. Konta i monetyzacja

17. **Weryfikacja domeny w Resend**
    - Problem: magic link wychodzi wyłącznie na dadmor@gmail.com, więc nikt poza deweloperem nie założy konta.
    - Zrobić: rekordy SPF/DKIM/DMARC dla subdomeny wysyłkowej `transformness.space` i zdjęcie ograniczenia.
    - Rozwiązuje: blokadę rejestracji, bez której zadania 3–5 i cała monetyzacja nie mają sensu.

18. **Proxy talii przez Pages Function**
    - Problem: cała talia i media leżą na publicznym `r2.dev` — każdy z URL-em pobierze wszystko.
    - Zrobić: `functions/api/deck/[slug].ts` czytające z bindingu R2 zamiast publicznego adresu.
    - Rozwiązuje: brak jakiegokolwiek miejsca, w którym można postawić bramkę.

19. **Tier w `follows`**
    - Problem: relacja user↔twórczyni nie wie nic o tym, czy ktoś zapłacił.
    - Zrobić: kolumna `tier TEXT DEFAULT 'free'` w tabeli `follows` + odczyt w proxy z zadania 18.
    - Rozwiązuje: brak modelu danych pod subskrypcję.

20. **Płatności**
    - Problem: Anna chce sprzedawać subskrypcję i kurs, apka nie przyjmuje pieniędzy.
    - Zrobić: Stripe albo Przelewy24 podpięte w jedno miejsce — nadanie `tier` po opłaceniu.
    - Rozwiązuje: monetyzację satelity; wymaga wcześniej 18 i 19 oraz decyzji o fakturach i zwrotach.

## E. Odłożone świadomie

21. **Własna domena satelity (host → slug)**
    - Problem: twórczyni może z czasem chcieć własnego adresu zamiast ścieżki na platformie.
    - Zrobić: nic teraz; docelowo mapowanie hosta na slug w `main.tsx` plus custom domain w Pages.
    - Rozwiązuje: presję na subdomeny i wildcard DNS, zanim ktokolwiek o to poprosi.

22. **Prowizja od specjalistów**
    - Problem: agregator bez modelu przychodu utrzymuje się tylko z subskrypcji satelitów.
    - Zrobić: nic teraz; wymaga najpierw ruchu w katalogu i zadania 20.
    - Rozwiązuje: przedwczesne budowanie rozliczeń dla pustego katalogu.

23. **Zgoda Anny na zdjęcia**
    - Problem: repo jest publiczne, a zdjęcia pochodzą z jej IG i strony.
    - Zrobić: uzyskać wyraźną pisemną zgodę przed produkcyjnym użyciem `src/assets/anna/`.
    - Rozwiązuje: ryzyko prawne i wizerunkowe przy promocji na szerszą skalę.
