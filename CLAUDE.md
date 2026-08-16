# CLAUDE.md — LOTOS BALANCE by Anna

Wellbeingowa aplikacja mobilna-web. Vite + React + TS, zwykły CSS, lucide-react.
Stan trzymany w localStorage, backend na Cloudflare (Pages Functions + D1 + R2).
Dokumentacja produktu i algorytmu: README.md.

## Komendy

- `npm run dev` / `npm run build` (tsc --noEmit + vite) / `npm run typecheck`
- Deploy: `npm run build && CLOUDFLARE_ACCOUNT_ID=5ac2ce215d670d3c2f2cd33317caaaba npx wrangler pages deploy dist --project-name lotos-balance`

## Deploy

- Produkcja: https://lotos-balance.pages.dev (Cloudflare Pages).
- Repo: https://github.com/Mrwithoutbody/lotos-balance — **publiczne**.
- Deployować TYLKO z powyższym ACCOUNT_ID. Token wranglera ma dostęp wyłącznie do tego
  konta; user ma inne konta CF (m.in. maciek.tryba), do których token nie sięga.
- Sekrety Pages obowiązują dopiero od następnego deploymentu.
- Deploy po każdej zaakceptowanej zmianie, bez dopytywania. Diff pokazać, ale nie czekać.

## Tryb pracy

- Zgłoszenie „coś źle wygląda" → **najpierw pytanie o element** (selektor z devtools / zrzut),
  potem edycja. „Karta" znaczy tu kilka różnych rzeczy — zgadywanie kosztuje całą sesję.
- Diagnoza z pomiaru w przeglądarce (`getComputedStyle`, `getBoundingClientRect`), nie z oka.
  Pustka wewnątrz komponentu wygląda jak „odstęp", a nie jest `gap`-em.

## Trasy i backend

- `/` — krąg (katalog twórczyń), `/<slug>` — apka twórczyni, `/logowanie` — magic link + Google.
- Magic link wychodzi z sandboxa Resend (`MAIL_FROM` na `resend.dev`), więc dociera wyłącznie
  na dadmor@gmail.com. Google OAuth działa tylko dla test users z konsoli.
- Program ładowany z R2: `pub-b800680ed48f426cab8c4693966aa056.r2.dev`, bucket `lotos-balance`
  (konto dadmor, EU). Seed i upload: `scripts/export-deck.ts` + `scripts/upload-deck.sh`
  (klucze `R2_*` w `.dev.vars`).
- D1 `lotos-db` (konto Anny, WEUR): tabele auth + `creators` / `follows` / `progress`.
- `/api/progress` zapisuje oceny samopoczucia przed i po — dane RODO art. 9. Baza w UE,
  `AboutModal` mówi użytkowniczce wprost, co wychodzi z urządzenia.

## Decyzje produktowe

- **Bez onboardingu** — start w Programie; Mapa Balansu buduje się z kart-sond
  (1 pytanie / 3 karty, `ProbeCard`). Obszary bez odpowiedzi = „jeszcze nie wiemy”.
- **Swipe asymetryczny**: prawo = „to o mnie” (zapis + boost obszaru), lewo = „nie teraz”
  (kara w rankingu do −3). Wykonanie tylko przyciskiem. `SwipeCard` = Pointer Events + strzałki.
- **Rekomendacje deterministyczne** (punktowe, bez AI/losowania) — `services/recommend.ts`,
  tabela wag w README.
- Wyniki obszarów zmieniają tylko odpowiedzi użytkowniczki — nigdy kliknięcia ani wykonania.
- **Słownik UI**: „ćwiczenie” i „program”. Słowa „talia”, „aktywacja”, „karta” nie pojawiają się
  w tekstach widocznych dla użytkowniczki. `kind: 'karta'` w `DeckScreen` to identyfikator.
- Design: greige/taupe + terracotta, Newsreader Variable + Inter Variable (self-host fontsource),
  hero ze zdjęciami, ciemna karta „Mózg na lata”. Wzorzec: moshealth.com.
- **Odstępy tylko z tokenów** `--sp-1..5` (4/8/12/16/24) + `--card-pad`. Zero gołych px
  w layoucie (mikro-gapy 3–7px w chipach i nawigacji to odstęp ikona↔tekst, nie layout).
- localStorage: `lotos-balance:v1` (stary `mental-balance:v1` czytany awaryjnie).
  `services/storage.ts` to jedyne miejsce dotykające localStorage, `hooks/useAppState.tsx`
  — jedyne miejsce z mutacjami stanu.
- Stos programu wypełnia viewport flexem, bez stałych dvh; treść karty kotwiczy przy dole.

## Ograniczenia

- Zdjęcia w `src/assets/anna/` pochodzą z publicznego IG @annarysnik i annarysnik.pl.
  Brak pisemnej zgody Anny, a repo jest publiczne.
