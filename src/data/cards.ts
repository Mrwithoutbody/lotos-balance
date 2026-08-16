// src/data/cards.ts
// Magazyn programu — pusty do czasu hydracji z bucketa R2. Źródłem prawdy dla
// programu Anny jest scripts/export-deck.ts; tutaj nie ma żadnych treści.
import type { ActivationCard } from '../types'

export const CARDS: ActivationCard[] = []

export const CARD_BY_ID: Record<string, ActivationCard> = {}

/** Pełne URL-e grafik tła per obszar — hydrowane z manifestu programu. */
export const CARD_ART: Partial<Record<ActivationCard['area'], string>> = {}

/**
 * Wstawia program z bucketa R2 — mutacja w miejscu, żeby wszystkie moduły
 * trzymające referencję do CARDS/CARD_BY_ID widziały nowe karty.
 * Wołane w App przed renderem ekranów; ekrany montują się dopiero po hydracji,
 * więc konsumenci CARDS nigdy nie widzą pustego magazynu.
 */
export function hydrateCards(
  remote: ActivationCard[],
  art?: Partial<Record<ActivationCard['area'], string>>,
): void {
  CARDS.splice(0, CARDS.length, ...remote)
  for (const key of Object.keys(CARD_BY_ID)) delete CARD_BY_ID[key]
  for (const card of remote) CARD_BY_ID[card.id] = card
  for (const key of Object.keys(CARD_ART)) delete CARD_ART[key as keyof typeof CARD_ART]
  Object.assign(CARD_ART, art)
}
