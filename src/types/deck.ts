// src/types/deck.ts
// Format programu w R2. Źródłem prawdy jest folder karty (card.json + media obok),
// deck.json to zbudowany z nich manifest — front czyta program jednym fetchem.
//
//   <bucket>/<creatorSlug>/deck.json
//   <bucket>/<creatorSlug>/karty/<cardSlug>/card.json
//   <bucket>/<creatorSlug>/karty/<cardSlug>/audio.mp3 | video.mp4  (opcjonalnie)
import type { ActivationCard, AreaId } from './index'

/** Rodzaj karty — dyskryminator dla treści w buckecie. */
export type CardKind = 'tekst' | 'audio' | 'wideo'

/** Zawartość card.json. Pola ćwiczenia jak w ActivationCard, plus media obok pliku. */
export type DeckCard = ActivationCard & {
  kind: CardKind
  /** Nazwy plików w folderze karty, np. "audio.mp3" — URL składa front. */
  media?: {
    audio?: string
    video?: string
  }
}

/** deck.json — manifest programu jednego twórcy. */
export interface DeckManifest {
  /** Wersja formatu, na wypadek migracji. */
  format: 1
  creator: {
    slug: string
    name: string
    /** Nazwa pliku okładki w folderze programu, np. "okladka.webp". */
    cover?: string
    /** Kilka zdań od twórcy — nagłówek programu. */
    bio?: string
  }
  title: string
  /** Grafiki tła kart per obszar — nazwy plików w folderze art/ programu. */
  art?: Partial<Record<AreaId, string>>
  /** Pełne karty w kolejności ustalonej przez twórcę. */
  cards: DeckCard[]
}
