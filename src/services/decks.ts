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

class DeckError extends Error {
  constructor(public status: number, slug: string) {
    super(`Talia ${slug}: HTTP ${status}`)
  }
}

export async function fetchDeck(creatorSlug: string): Promise<DeckManifest> {
  const res = await fetch(deckAssetUrl(creatorSlug, 'deck.json'))
  if (!res.ok) throw new DeckError(res.status, creatorSlug)
  return res.json()
}

export function useDeck(creatorSlug: string) {
  return useQuery({
    queryKey: ['deck', creatorSlug],
    queryFn: () => fetchDeck(creatorSlug),
    staleTime: 5 * 60 * 1000,
    // 404 = talia nie istnieje; ponawianie nic nie zmieni. Retry tylko na sieć.
    retry: (failureCount, error) =>
      !(error instanceof DeckError && error.status === 404) && failureCount < 2,
  })
}
