# CLAUDE.md — LOTOS BALANCE by Anna

Wellbeingowa aplikacja mobilna-web (MVP). Vite + React + TS, zwykły CSS, lucide-react,
localStorage, bez backendu. Pełna dokumentacja produktu i algorytmu: README.md.

## Komendy

- `npm run dev` / `npm run build` (tsc --noEmit + vite) / `npm run typecheck`
- Deploy: `npm run build && CLOUDFLARE_ACCOUNT_ID=5ac2ce215d670d3c2f2cd33317caaaba npx wrangler pages deploy dist --project-name lotos-balance`

## Deploy — WAŻNE

- Produkcja: https://lotos-balance.pages.dev (Cloudflare Pages).
- Deployować TYLKO z powyższym ACCOUNT_ID — token wranglera ma dostęp wyłącznie do tego konta;
  user ma kilka innych kont CF (m.in. maciek.tryba — token bez dostępu).
- Nie przenosić projektu między kontami bez wyraźnej prośby (decyzja 2026-08-15).
- Repo: https://github.com/Mrwithoutbody/lotos-balance (public).

## Tryb pracy (2026-08-15)

- Zgłoszenie „coś źle wygląda” → **najpierw pytanie o element** (selektor z devtools / zrzut),
  potem edycja. „Karta” znaczy tu 4 różne rzeczy — zgadywanie kosztowało już całą sesję.
- Diagnoza z pomiaru w przeglądarce (`getComputedStyle`, `getBoundingClientRect`), nie z oka.
  Pustka wewnątrz komponentu wygląda jak „odstęp”, a nie jest `gap`-em.
- Deploy tylko na wyraźną prośbę. Jedna zmiana na raz, diff przed wdrożeniem.

## Kluczowe decyzje produktowe

- **Bez onboardingu** — start w Talii; Mapa Balansu buduje się z kart-sond (1 pytanie / 3 karty,
  `ProbeCard`). Obszary bez odpowiedzi = „jeszcze nie wiemy”, nigdy nie zgadujemy.
- **Swipe asymetryczny**: prawo = „to o mnie” (zapis + boost obszaru), lewo = „nie teraz” (kara
  w rankingu do −3). Wykonanie karty tylko przyciskiem. `SwipeCard` = Pointer Events + strzałki.
- **Rekomendacje deterministyczne** (punktowe, bez AI/losowania) — `services/recommend.ts`,
  tabela wag w README.
- Wyniki obszarów zmieniają tylko odpowiedzi użytkowniczki — nigdy kliknięcia/wykonania kart.
- Design: greige/taupe + terracotta, Newsreader Variable + Inter Variable (self-host fontsource),
  hero ze zdjęciami, ciemna karta „Mózg na lata”. Wzorzec: moshealth.com.
- **Odstępy tylko z tokenów** `--sp-1..5` (4/8/12/16/24) + `--card-pad`. Zero gołych px w layoucie
  (mikro-gapy w chipach/nawigacji 3–7px zostają — to odstęp ikona↔tekst, nie layout).
- localStorage: `lotos-balance:v1` (stary `mental-balance:v1` czytany awaryjnie).
- Talia (stos) wypełnia viewport flexem — bez stałych dvh. Karta ma wysokość swojej treści
  i stoi na środku sceny (`align-items:center`). Rozciąganie karty na całą scenę dawało
  300+ px pustego gradientu w środku — cofnięte 2026-08-15.
- Karta wykonana dziś znika ze stosu (`doneToday` w `DeckScreen`).
- Nastrój pytany raz: check-in młodszy niż 30 min zasila `before` w `CardPlayer`.

## Otwarte tematy

- Wideo Anny: odłożone. Opcje: Stream na osobnym płatnym koncie usera (embed cross-account,
  Allowed Origins) albo R2 free (klipy 30–60 s → R2 wystarczy). Placeholder `AnnaGuide.tsx`
  usunięty w audycie — wraca razem z nagraniem (`anna-avatar.webp` czeka w assetach).
- Zdjęcia w `src/assets/anna/`: oryginały HQ z publicznego IG @annarysnik (curl z CDN, 3072px)
  i z annarysnik.pl. Hero to dedykowane poziome kadry (`hero-dzisiaj`, `hero-balans`) — Anna
  zawsze w prawej tercji, lewa strona pod tekst. Do produkcji nadal potrzebna wyraźna zgoda Anny
  (repo jest publiczne!). Motyw lotosu: na IG to wideo — czekamy na prawdziwy kadr od Anny.
- Przyszłość: backend + społeczność „Lotos Balance” (Workers/D1/R2 albo Supabase). Szew do
  migracji: `services/storage.ts` (jedyne miejsce z localStorage) + `hooks/useAppState.tsx`
  (wszystkie mutacje). Dane o samopoczuciu = RODO art. 9 — region UE, zgody, moderacja od dnia 1.
