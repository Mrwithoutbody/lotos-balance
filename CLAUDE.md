# CLAUDE.md — LOTOS BALANCE by Anna

Vite + React + TS, zwykły CSS, Cloudflare Pages Functions + D1 + R2. Reszta w kodzie i README.

## Git

- **Pracujemy tylko na `main`.** Zero gałęzi roboczych, commit prosto na `main`.
- Deploy z innej gałęzi ląduje na preview (`<branch>.lotos-balance.pages.dev`), a produkcja zostaje na starym buildzie.

## Deploy

- `npm run build && CLOUDFLARE_ACCOUNT_ID=5ac2ce215d670d3c2f2cd33317caaaba npx wrangler pages deploy dist --project-name lotos-balance`
- Tylko z tym ACCOUNT_ID — token nie sięga innych kont CF usera.
- Produkcja https://lotos-balance.pages.dev, repo **publiczne**.
- Sekrety Pages działają od następnego deploymentu.
- Deployować po każdej zaakceptowanej zmianie, bez pytania.
- **Service worker wyłączony na czas prac** (od 17.08.2026, `src/main.tsx`): każde wejście wyrejestrowuje workera i kasuje cache, więc deploy widać od razu. Koszt: brak trybu offline i brak promptu instalacji na Androidzie. Powrót = przywrócić `register('/sw.js')` i podbić nazwę cache w `public/sw.js`.

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
- Treść programu w R2 jest bez ścieżki zapisu — skrypty publikowania usunięte 2026-08-17. Ćwiczenia: `git show 63ce87c^:scripts/export-deck.ts`.
- `deck.json` w buckecie ma `format: 1` i `kind: "tekst"` na każdej karcie — nie generuje ich ani nie czyta żaden kod, pochodzenie nieznane. **Nie nadpisywać bucketa bez decyzji Maćka.**
