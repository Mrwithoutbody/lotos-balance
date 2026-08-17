// src/types/deck.ts
// Format programu w R2. Źródłem prawdy jest folder karty (card.json),
// deck.json to zbudowany z nich manifest — front czyta program jednym fetchem.
//
//   <bucket>/<creatorSlug>/deck.json
//   <bucket>/<creatorSlug>/karty/<cardSlug>/card.json
import type { ActivationCard, AreaId } from './index'

/** deck.json — manifest programu jednego twórcy. Card.json to jedna ActivationCard. */
export interface DeckManifest {
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
  cards: ActivationCard[]
}
