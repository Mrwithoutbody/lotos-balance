// src/services/decks.ts
// Odczyt programu z publicznego bucketa R2 (konto dadmor, jurysdykcja EU).
// Zapis pójdzie później przez Pages Function + S3 API.
import { useQuery } from '@tanstack/react-query'
import type { DeckManifest } from '../types/deck'

/** Programy idą przez własną funkcję (functions/api/deck) — same-origin, bez CORS. */
const DECKS_URL = '/api/deck'

export function deckAssetUrl(creatorSlug: string, ...path: string[]): string {
  return [DECKS_URL, creatorSlug, ...path].join('/')
}

async function fetchDeck(creatorSlug: string): Promise<DeckManifest> {
  const res = await fetch(deckAssetUrl(creatorSlug, 'deck.json'))
  if (!res.ok) {
    throw Object.assign(new Error(`Program ${creatorSlug}: HTTP ${res.status}`), {
      status: res.status,
    })
  }
  return res.json()
}

export function useDeck(creatorSlug: string) {
  return useQuery({
    queryKey: ['deck', creatorSlug],
    queryFn: () => fetchDeck(creatorSlug),
    staleTime: 5 * 60 * 1000,
    // 404 = program nie istnieje; ponawianie nic nie zmieni. Retry tylko na sieć.
    retry: (failureCount, error) =>
      (error as { status?: number }).status !== 404 && failureCount < 2,
  })
}
