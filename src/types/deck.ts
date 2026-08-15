// src/types/deck.ts
// Format talii w R2. Źródłem prawdy jest folder karty (card.json + media obok),
// deck.json to zbudowany z nich manifest — front czyta talię jednym fetchem.
//
//   <bucket>/<creatorSlug>/deck.json
//   <bucket>/<creatorSlug>/karty/<cardSlug>/card.json
//   <bucket>/<creatorSlug>/karty/<cardSlug>/audio.mp3 | video.mp4  (opcjonalnie)
import type { ActivationCard } from './index'

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

/** deck.json — manifest talii jednego twórcy. */
export interface DeckManifest {
  /** Wersja formatu, na wypadek migracji. */
  format: 1
  creator: {
    slug: string
    name: string
    /** Nazwa pliku okładki w folderze talii, np. "okladka.webp". */
    cover?: string
    /** Kilka zdań od twórcy — nagłówek talii. */
    bio?: string
  }
  title: string
  /** Pełne karty w kolejności ustalonej przez twórcę. */
  cards: DeckCard[]
}
