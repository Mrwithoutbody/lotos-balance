// src/services/decks.ts
// Odczyt talii z publicznego bucketa R2 (konto dadmor, jurysdykcja EU).
// Zapis pójdzie później przez Pages Function + S3 API.
import { useQuery } from '@tanstack/react-query'
import type { DeckManifest } from '../types/deck'

/** Publiczny URL bucketa lotos-balance. Do produkcji: własna domena zamiast r2.dev. */
export const DECKS_URL = 'https://pub-b800680ed48f426cab8c4693966aa056.r2.dev'

export function deckAssetUrl(creatorSlug: string, ...path: string[]): string {
  return [DECKS_URL, creatorSlug, ...path].join('/')
}

export async function fetchDeck(creatorSlug: string): Promise<DeckManifest> {
  const res = await fetch(deckAssetUrl(creatorSlug, 'deck.json'))
  if (!res.ok) throw new Error(`Talia ${creatorSlug}: HTTP ${res.status}`)
  return res.json()
}

export function useDeck(creatorSlug: string) {
  return useQuery({
    queryKey: ['deck', creatorSlug],
    queryFn: () => fetchDeck(creatorSlug),
    staleTime: 5 * 60 * 1000,
  })
}
