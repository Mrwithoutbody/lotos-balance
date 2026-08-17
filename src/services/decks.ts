// src/services/decks.ts
// Odczyt programu z publicznego bucketa R2 (konto dadmor, jurysdykcja EU).
// Zapis pójdzie później przez Pages Function + S3 API.
import { useQuery } from '@tanstack/react-query'
import { parseManifest } from './manifest.ts'

/** Twórczyni z listy talii — tyle, ile rysuje ekran startowy. */
export interface Creator {
  slug: string
  name: string
}

/** Programy idą przez własną funkcję (functions/api/deck) — same-origin, bez CORS. */
const DECKS_URL = '/api/deck'

export function deckAssetUrl(creatorSlug: string, ...path: string[]): string {
  return [DECKS_URL, creatorSlug, ...path].join('/')
}

/** Pobranie JSON-a z zachowanym statusem — po nim decyduje polityka ponawiania. */
async function json<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw Object.assign(new Error(`${url}: HTTP ${res.status}`), { status: res.status })
  return res.json() as Promise<T>
}

export function useDeck(creatorSlug: string) {
  return useQuery({
    queryKey: ['deck', creatorSlug],
    queryFn: async () =>
      parseManifest(await json<unknown>(deckAssetUrl(creatorSlug, 'deck.json')), creatorSlug),
    staleTime: 5 * 60 * 1000,
    // 404 = program nie istnieje; ponawianie nic nie zmieni. Retry tylko na sieć.
    retry: (failureCount, error) =>
      (error as { status?: number }).status !== 404 && failureCount < 2,
  })
}

/** Lista talii z D1. Ten sam kształt co trasa /api/circle. */
export function useCreators() {
  return useQuery<Creator[]>({
    queryKey: ['creators'],
    staleTime: 60 * 1000,
    queryFn: () => json<Creator[]>('/api/creators'),
  })
}

/**
 * Zgłoszenie ukończonego ćwiczenia. Bez sesji serwer odpowiada 401 i to jest
 * w porządku — localStorage pozostaje źródłem prawdy dla widoku.
 */
export function reportProgress(body: { creatorSlug: string; cardId: string; date: string }): void {
  void fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}
