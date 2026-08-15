// scripts/export-deck.ts
// Buduje pliki talii Anny z data/cards.ts do seed/ — w formacie bucketa R2.
// Uruchomienie: npx tsx scripts/export-deck.ts
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { CARDS } from '../src/data/cards'
import type { DeckCard, DeckManifest } from '../src/types/deck'

const OUT = join(import.meta.dirname, '..', 'seed', 'anna-rysnik')

const cards: DeckCard[] = CARDS.map((card) => ({ ...card, kind: 'tekst' }))

const manifest: DeckManifest = {
  format: 1,
  creator: {
    slug: 'anna-rysnik',
    name: 'Anna Ryśnik',
    cover: 'okladka.webp',
    bio: 'Krótkie ćwiczenia na balans — 3, 7 albo 15 minut. Bez teorii, bez oceniania.',
  },
  title: 'Lotos Balance',
  cards,
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'deck.json'), JSON.stringify(manifest, null, 2))
copyFileSync(
  join(import.meta.dirname, '..', 'src', 'assets', 'anna', 'hero-balans.webp'),
  join(OUT, 'okladka.webp'),
)

// Źródło prawdy per karta — z tych plików panel twórcy przebuduje manifest.
for (const card of cards) {
  const dir = join(OUT, 'karty', card.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'card.json'), JSON.stringify(card, null, 2))
}

console.log(`seed/anna-rysnik: deck.json + ${cards.length} kart`)
