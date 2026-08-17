// src/services/recommend.ts
import type { ActivationCard, AppState, AreaId, Minutes, NeedId, Scale5 } from '../types'
import { latestSnapshot, weakestAreas } from '../utils/balance'
import { dateKey, diffDays } from '../utils/date'

interface RecommendationInput {
  need: NeedId
  minutes: Minutes
  state?: Scale5
}

interface ScoredCard {
  card: ActivationCard
  score: number
  reasons: string[]
}

/** Średnia zmiana (po − przed) dla danej karty w historii użytkowniczki. */
function averageDelta(state: AppState, cardId: string): number | null {
  const deltas = state.sessions
    .filter((s) => s.cardId === cardId && s.completed && typeof s.after === 'number')
    .map((s) => (s.after as number) - s.before)
  if (deltas.length === 0) return null
  return deltas.reduce((a, b) => a + b, 0) / deltas.length
}

function daysSinceLastUse(state: AppState, cardId: string): number | null {
  const dates = state.sessions.filter((s) => s.cardId === cardId).map((s) => s.date)
  if (dates.length === 0) return null
  const last = dates.reduce((a, b) => (a >= b ? a : b))
  return diffDays(dateKey(), last)
}

/**
 * Deterministyczny algorytm punktowy. Bez losowania — kolejność zależy wyłącznie
 * od potrzeby, Mapy Balansu, celów, czasu i wcześniejszych reakcji.
 */
/** Obszary, które użytkowniczka sama wskazała kartami zatrzymanymi w prawo („to o mnie”). */
function preferredAreas(state: AppState): Set<AreaId> {
  const areas = new Set<AreaId>()
  const counts = new Map<AreaId, number>()
  for (const swipe of state.swipes) {
    const delta = swipe.direction === 'w-prawo' ? 1 : -1
    counts.set(swipe.area, (counts.get(swipe.area) ?? 0) + delta)
  }
  const positive = [...counts.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  for (const [area] of positive) areas.add(area)
  return areas
}

export function scoreCards(
  state: AppState,
  input: RecommendationInput,
  cards: ActivationCard[],
): ScoredCard[] {
  const snapshot = latestSnapshot(state.snapshots)
  const weak: AreaId[] = snapshot ? weakestAreas(snapshot.levels, 2) : []
  const goalAreas = preferredAreas(state)

  const scored = cards.map((card, index) => {
    let score = 0
    const reasons: string[] = []

    if (card.needs.includes(input.need)) {
      score += 4
      reasons.push('Pasuje do tego, czego teraz potrzebujesz')
    }

    const areas: AreaId[] = card.secondaryArea ? [card.area, card.secondaryArea] : [card.area]
    if (areas.some((a) => weak.includes(a))) {
      score += 3
      reasons.push('Wspiera obszar, który teraz najbardziej tego potrzebuje')
    }

    if (areas.some((a) => goalAreas.has(a))) {
      score += 2
      reasons.push('Podobne karty zatrzymywałaś w programie')
    }

    // Karty odrzucone w lewo schodzą niżej — bez blokowania ich na stałe.
    const rejected = state.swipes.filter(
      (s) => s.cardId === card.id && s.direction === 'w-lewo',
    ).length
    if (rejected > 0) score -= Math.min(3, rejected)

    if (card.minutes <= input.minutes) {
      score += 2
      reasons.push(`Mieści się w ${input.minutes} min`)
    } else {
      score -= 4
    }

    const since = daysSinceLastUse(state, card.id)
    if (since === null || since >= 3) {
      score += 2
      if (since !== null) reasons.push('Dawno jej nie było')
    }

    const delta = averageDelta(state, card.id)
    if (delta !== null) {
      if (delta >= 2) {
        score += 3
        reasons.push('Wcześniej dawała Ci wyraźną poprawę')
      } else if (delta >= 1) {
        score += 2
        reasons.push('Wcześniej pomagała')
      } else if (delta > 0) {
        score += 1
      } else if (delta < 0) {
        score -= 1
      }
    }

    // Przy niskim stanie nie proponujemy kart wymagających dużo energii.
    if (input.state !== undefined && input.state <= 2 && card.energy === 'wysoka') {
      score -= 2
    }

    // Deterministyczny tie-break, żeby kolejność była stabilna między renderami.
    score += (cards.length - index) * 0.001

    return { card, score, reasons: reasons.slice(0, 3) }
  })

  return scored.sort((a, b) => b.score - a.score)
}
