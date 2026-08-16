# TASKS — Lotos Balance (satelita) + agregator

Układ: `transformness.space` = agregator wellness (katalog specjalistów), `/anna-rysnik` = apka
satelitarna Anny. Jedna baza kodu, jeden deploy — `/` to agregator, `/<slug>` to satelita.

Agregator = osobne repo `../transformness-space` (decyzja 2026-08-16); sekcje C–E do
przeniesienia tam, gdy ruszy. Założenie robocze: pieniądze na razie NIE przechodzą przez
platformę (specjaliści linkują do własnych rezerwacji).

Kolejność = priorytet. Źródło: audyt UX 3 agentów (2026-08-16) + wiadomości Anny z 15.08.

## A. Satelita Anny — może wkleić link (jedna sesja)

1. **Domyślny tab „Programy"**
   - Problem: nowa osoba ląduje w pustym feedzie i widzi „Jeszcze cicho".
   - Zrobić: `useState('programy')` w `CircleScreen.tsx:171` + tab Feed renderowany dopiero gdy `feed.data.length > 0`.
   - Rozwiązuje: pierwsze wrażenie „martwa apka".

2. **Copy bez żargonu**
   - Problem: „aktywacja", „talia", „Feed", „Twoja praca" są niezrozumiałe dla odbiorczyń Anny.
   - Zrobić: zamiana na „ćwiczenie", „program", „Aktywność", „Twoje postępy, {imię}" w `CircleScreen.tsx` i `AboutModal.tsx`.
   - Rozwiązuje: znany z testów blocker zrozumiałości.

3. **Link w bio Anny na `/anna-rysnik`**
   - Problem: `/` to agregator dla całej branży, a fan Anny przychodzi po nią, nie po katalog.
   - Zrobić: przekazać Annie adres `transformness.space/anna-rysnik` jako jedyny link do promocji (auto-follow już tam działa).
   - Rozwiązuje: rozjazd między wejściem platformowym a satelitarnym.

4. **Schować „Zaloguj się" na `/`**
   - Problem: magic link działa tylko na dadmor@gmail.com, Google tylko dla test users — realna osoba dostanie błąd.
   - Zrobić: ukryć przycisk logowania do czasu weryfikacji domeny w Resend (zadanie 17).
   - Rozwiązuje: spalone zaufanie przy pierwszym kontakcie.

5. **Jeden primary CTA na karcie twórczyni**
   - Problem: „Wejdź do talii" i „Dołącz do kręgu" mają równą wagę i żaden nie mówi „zacznij".
   - Zrobić: jeden przycisk „Zacznij pierwsze ćwiczenie (3 min)", follow zostaje automatyczny.
   - Rozwiązuje: punkt porzucenia przy wyborze między dwiema niejasnymi akcjami.

6. **Statystyki użytkowniczki pod taby**
   - Problem: „Twoja praca, Grzesiek Durtan" renderuje się nad treścią Anny.
   - Zrobić: przenieść sekcję `done`/`streak` poniżej tabów.
   - Rozwiązuje: odwróconą hierarchię twórczyni → wartość → moje postępy.

7. **Licznik osób w kręgu od ≥10**
   - Problem: „1 osoba w kręgu" pod influencerką z tysiącami followersów to anty-dowód.
   - Zrobić: warunek `followers >= 10` zamiast `> 0` w `CircleScreen.tsx:133`.
   - Rozwiązuje: obniżanie statusu twórczyni małymi liczbami.

8. **Akcja w pustym feedzie**
   - Problem: empty state nie daje żadnego wyjścia i maskuje też błąd API.
   - Zrobić: dodać przycisk „Zrób pierwsze ćwiczenie" + osobną gałąź dla `feed.isError`.
   - Rozwiązuje: ślepy zaułek na najczęstszym pierwszym ekranie.

9. **Feed bez rodzaju męskiego**
   - Problem: „Ktoś ukończył" w aplikacji mówiącej do kobiet w rodzaju żeńskim.
   - Zrobić: zamiana na bezpodmiotowe „Ukończone przed chwilą: «{tytuł}»".
   - Rozwiązuje: niespójność językową marki.

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
