// src/utils/search.ts
// Jedno filtrowanie ćwiczeń dla biblioteki w programie i dla wyboru do kalendarza.
import type { ActivationCard, AreaId, Minutes } from '../types'

/** Bez ogonków — „cwiczenie” ma znajdować „ćwiczenie”. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
}

export interface CardFilter {
  query?: string
  /** Obszar główny albo poboczny karty. */
  area?: AreaId | 'wszystkie'
  minutes?: Minutes | 'dowolny'
  /** Podana lista id-ków = pokazujemy tylko ulubione. */
  favorites?: string[]
}

export function filterCards(cards: ActivationCard[], f: CardFilter): ActivationCard[] {
  const q = normalize(f.query?.trim() ?? '')
  return cards.filter((card) => {
    if (f.area && f.area !== 'wszystkie' && card.area !== f.area && card.secondaryArea !== f.area) {
      return false
    }
    if (f.minutes && f.minutes !== 'dowolny' && card.minutes !== f.minutes) return false
    if (f.favorites && !f.favorites.includes(card.id)) return false
    return !q || normalize(card.title).includes(q) || normalize(card.description).includes(q)
  })
}
