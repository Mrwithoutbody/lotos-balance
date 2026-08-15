# CLAUDE.md

## Deploy

- Produkcja: https://lotos-balance.pages.dev (Cloudflare Pages).
- Deployować ZAWSZE z `CLOUDFLARE_ACCOUNT_ID=5ac2ce215d670d3c2f2cd33317caaaba` — token wranglera
  ma dostęp tylko do tego konta; user ma kilka innych kont Cloudflare (m.in. maciek.tryba — brak
  dostępu tokena).
- Komenda: `npm run build && CLOUDFLARE_ACCOUNT_ID=... npx wrangler pages deploy dist --project-name lotos-balance`
- Nie przenosić projektu między kontami bez wyraźnej prośby (decyzja z 2026-08-15).

## Wideo (nagrania Anny)

Decyzja odłożona. Opcje: Stream na osobnym płatnym koncie usera (cross-account embed, Allowed
Origins) albo R2 free tier. Krótkie klipy 30–60 s → R2 wystarczy za darmo. Placeholder w
`src/components/AnnaGuide.tsx`.

## Repo

https://github.com/Mrwithoutbody/lotos-balance (public — zawiera zdjęcia Anny z jej publicznego IG;
przed szerszą publikacją potrzebna jej zgoda).
