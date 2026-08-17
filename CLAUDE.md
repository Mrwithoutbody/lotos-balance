# CLAUDE.md — LOTOS BALANCE by Anna

Vite + React + TS, zwykły CSS, Cloudflare Pages Functions + D1 + R2. Reszta w kodzie i README.

## Deploy

- `npm run build && CLOUDFLARE_ACCOUNT_ID=5ac2ce215d670d3c2f2cd33317caaaba npx wrangler pages deploy dist --project-name lotos-balance`
- Tylko z tym ACCOUNT_ID — token nie sięga innych kont CF usera.
- Produkcja https://lotos-balance.pages.dev, repo **publiczne**.
- Sekrety Pages działają od następnego deploymentu.
- Deployować po każdej zaakceptowanej zmianie, bez pytania.

## Tryb pracy

- „Coś źle wygląda" → najpierw pytanie o element (selektor/zrzut), potem edycja.
- Diagnoza z `getComputedStyle` / `getBoundingClientRect`, nie z oka.

## Zasady, których kod nie wymusza

- Słownik UI: „ćwiczenie", „program". Nigdy „talia", „aktywacja", „karta".
- Odstępy tylko z tokenów `--sp-1..5` + `--card-pad`, zero gołych px w layoucie.
- Wyniki obszarów zmieniają wyłącznie odpowiedzi użytkowniczki, nie kliknięcia.
- Rekomendacje deterministyczne — bez AI i losowania.

## Fakty spoza repo

- Magic link leci przez Brevo (`BREVO_API_KEY`, `MAIL_FROM`); domena musi być uwierzytelniona w Brevo. Google OAuth: test users.
- R2 `lotos-balance` i D1 `lotos-db` — konta i klucze w `.dev.vars`.
- `/api/progress` zbiera oceny samopoczucia = RODO art. 9.
- Zdjęcia w `src/assets/anna/` bez pisemnej zgody Anny, przy publicznym repo.

## Treść programu w R2 — zamrożona

- Skrypty publikowania (`export-deck.ts`, `upload-deck.sh`) usunięte 2026-08-17. Nie ma czym zmienić treści w buckecie. Źródło ćwiczeń: `git show 63ce87c^:scripts/export-deck.ts`.
- `deck.json` w buckecie ma pola, których żaden kod nie generuje ani nie czyta: `format: 1` w manifeście i `kind: "tekst"` na każdej karcie. Pochodzenie nieznane. **Nie nadpisywać bucketa bez decyzji Maćka** — `kind` prawdopodobnie znaczy ćwiczenia nietekstowe pod programy na medytacje i diety.
- Docelowo zapis idzie panelem twórcy, nie skryptem: `POST /api/deck/:slug` sprawdzający `creators.userId === session.user.id` (kolumna czeka w D1, nieużywana) + binding R2. Binding zdjęty z `wrangler.toml`, bo wskazywał na nieistniejący bucket `lotos-programy` — prawdziwy to `lotos-balance`.
