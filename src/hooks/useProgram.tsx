// src/hooks/useProgram.tsx
// Program z R2 podany ekranom przez kontekst. Wcześniej te same dane leżały
// w mutowalnych globalach (data/cards.ts), przepisywanych w ciele rendera App —
// przy wielu programach zostawało to niewidzialne wejście każdej funkcji.
import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { deckAssetUrl } from '../services/decks'
import type { ActivationCard, AreaId } from '../types'
import type { DeckManifest } from '../types/deck'

interface Program {
  /** Slug twórczyni — folder w R2 i trasa /<slug>. */
  slug: string
  name: string
  cards: ActivationCard[]
  /** Indeks id → ćwiczenie; kalendarz i statystyki szukają po id. */
  byId: Record<string, ActivationCard>
  /** Pełne URL-e grafik tła per obszar — manifest trzyma same nazwy plików. */
  art: Partial<Record<AreaId, string>>
}

const ProgramContext = createContext<Program | null>(null)

interface Props {
  slug: string
  deck: DeckManifest
  children: ReactNode
}

export function ProgramProvider({ slug, deck, children }: Props) {
  const value = useMemo<Program>(
    () => ({
      slug,
      name: deck.creator.name,
      cards: deck.cards,
      byId: Object.fromEntries(deck.cards.map((card) => [card.id, card])),
      art: Object.fromEntries(
        Object.entries(deck.art ?? {}).map(([area, file]) => [
          area,
          deckAssetUrl(slug, 'art', file),
        ]),
      ),
    }),
    [slug, deck],
  )

  return <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>
}

export function useProgram(): Program {
  const ctx = useContext(ProgramContext)
  if (!ctx) throw new Error('useProgram musi być użyte wewnątrz ProgramProvider')
  return ctx
}
