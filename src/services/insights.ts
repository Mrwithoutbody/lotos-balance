// src/services/insights.ts
import { AREA_BY_ID } from '../data/areas'
import { CARD_BY_ID } from '../data/cards'
import type { ActivationSession, AppState, AreaId } from '../types'
import { addDays, dateKey, partOfDay } from '../utils/date'

interface CardEffect {
  cardId: string
  title: string
  area: AreaId
  count: number
  avgDelta: number
}

function completedWithRating(state: AppState): ActivationSession[] {
  return state.sessions.filter((s) => s.completed && typeof s.after === 'number')
}

/** Karty pogrupowane po średniej zmianie (po − przed). */
function cardEffects(state: AppState): CardEffect[] {
  const map = new Map<string, { sum: number; count: number }>()
  for (const s of completedWithRating(state)) {
    const entry = map.get(s.cardId) ?? { sum: 0, count: 0 }
    entry.sum += (s.after as number) - s.before
    entry.count += 1
    map.set(s.cardId, entry)
  }
  const result: CardEffect[] = []
  for (const [cardId, { sum, count }] of map) {
    const card = CARD_BY_ID[cardId]
    if (!card) continue
    result.push({ cardId, title: card.title, area: card.area, count, avgDelta: sum / count })
  }
  return result.sort((a, b) => b.avgDelta - a.avgDelta || b.count - a.count)
}

export function helpfulCards(state: AppState, limit = 3): CardEffect[] {
  return cardEffects(state)
    .filter((c) => c.avgDelta > 0)
    .slice(0, limit)
}

export function neutralCards(state: AppState, limit = 3): CardEffect[] {
  return cardEffects(state)
    .filter((c) => c.avgDelta <= 0)
    .reverse()
    .slice(0, limit)
}

/** Liczba dni z rzędu (licząc od dziś lub wczoraj) z ukończoną aktywacją. */
export function streak(state: AppState): number {
  const days = new Set(state.sessions.filter((s) => s.completed).map((s) => s.date))
  const today = dateKey()
  let cursor = days.has(today) ? today : addDays(today, -1)
  if (!days.has(cursor)) return 0
  let count = 0
  while (days.has(cursor)) {
    count += 1
    cursor = addDays(cursor, -1)
  }
  return count
}

/** Aktywność z ostatnich siedmiu dni: liczba ukończonych aktywacji dziennie. */
export function weekActivity(state: AppState): { date: string; count: number }[] {
  const today = dateKey()
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6)
    const count = state.sessions.filter((s) => s.completed && s.date === date).length
    return { date, count }
  })
}

/** Średnia zmiana samopoczucia w ostatnich siedmiu dniach. */
export function weekAverageDelta(state: AppState): number | null {
  const from = addDays(dateKey(), -6)
  const deltas = completedWithRating(state)
    .filter((s) => s.date >= from)
    .map((s) => (s.after as number) - s.before)
  if (deltas.length === 0) return null
  return deltas.reduce((a, b) => a + b, 0) / deltas.length
}

/**
 * „Twoja osobista instrukcja obsługi” — proste, deterministyczne reguły
 * liczone wyłącznie z lokalnej historii. Bez AI, bez zgadywania.
 */
export function personalManual(state: AppState): string[] {
  const rules: string[] = []
  const rated = completedWithRating(state)

  if (rated.length < 3) {
    rules.push('Potrzebujemy więcej danych, aby zobaczyć wzorzec. Wykonaj kilka ćwiczeń i oceń je przed i po.')
    return rules
  }

  // 1. Co działa przy niskim stanie startowym.
  const lowStart = rated.filter((s) => s.before <= 2)
  if (lowStart.length >= 2) {
    const byArea = new Map<AreaId, { sum: number; count: number }>()
    for (const s of lowStart) {
      const card = CARD_BY_ID[s.cardId]
      if (!card) continue
      const entry = byArea.get(card.area) ?? { sum: 0, count: 0 }
      entry.sum += (s.after as number) - s.before
      entry.count += 1
      byArea.set(card.area, entry)
    }
    let best: { area: AreaId; avg: number } | null = null
    for (const [area, { sum, count }] of byArea) {
      const avg = sum / count
      if (!best || avg > best.avg) best = { area, avg }
    }
    if (best && best.avg > 0) {
      rules.push(
        `Gdy startujesz z niskiego poziomu, najlepiej działały karty z obszaru „${AREA_BY_ID[best.area].name}”.`,
      )
    }
  }

  // 2. Ulubiona długość aktywacji.
  const byMinutes = new Map<number, { sum: number; count: number }>()
  for (const s of rated) {
    const card = CARD_BY_ID[s.cardId]
    if (!card) continue
    const entry = byMinutes.get(card.minutes) ?? { sum: 0, count: 0 }
    entry.sum += (s.after as number) - s.before
    entry.count += 1
    byMinutes.set(card.minutes, entry)
  }
  let bestMinutes: { minutes: number; avg: number } | null = null
  for (const [minutes, { sum, count }] of byMinutes) {
    if (count < 2) continue
    const avg = sum / count
    if (!bestMinutes || avg > bestMinutes.avg) bestMinutes = { minutes, avg }
  }
  if (bestMinutes && bestMinutes.avg > 0) {
    rules.push(`Najwięcej dawały Ci ćwiczenia ${bestMinutes.minutes}-minutowe.`)
  }

  // 3. Pora dnia.
  const byPart = new Map<string, number>()
  for (const s of state.sessions.filter((x) => x.completed)) {
    const part = partOfDay(new Date(s.startedAt))
    byPart.set(part, (byPart.get(part) ?? 0) + 1)
  }
  let topPart: { part: string; count: number } | null = null
  for (const [part, count] of byPart) {
    if (!topPart || count > topPart.count) topPart = { part, count }
  }
  if (topPart && topPart.count >= 3) {
    const label = topPart.part === 'rano' ? 'Rano' : topPart.part === 'popołudnie' ? 'Po południu' : 'Wieczorem'
    rules.push(`${label} najczęściej sięgałaś po ćwiczenia — to Twoja naturalna pora.`)
  }

  // 4. Plan kontra wykonanie.
  const past = state.calendar.filter((e) => e.date < dateKey())
  if (past.length >= 3) {
    const doneRatio = past.filter((e) => e.done).length / past.length
    if (doneRatio < 0.5) {
      rules.push('Planujesz więcej, niż udaje się wykonać. Spróbuj planować jedną kartę dziennie.')
    } else {
      rules.push('Zaplanowane karty wykonujesz w większości — planowanie Ci służy.')
    }
  }

  // 5. Obszar wykonywany rzadziej niż planowany.
  const plannedByArea = new Map<AreaId, { planned: number; done: number }>()
  for (const e of past) {
    const card = CARD_BY_ID[e.cardId]
    if (!card) continue
    const entry = plannedByArea.get(card.area) ?? { planned: 0, done: 0 }
    entry.planned += 1
    if (e.done) entry.done += 1
    plannedByArea.set(card.area, entry)
  }
  for (const [area, { planned, done }] of plannedByArea) {
    if (planned >= 2 && done / planned < 0.5) {
      rules.push(`Karty z obszaru „${AREA_BY_ID[area].name}” wykonywałaś rzadziej, niż planowałaś.`)
      break
    }
  }

  if (rules.length === 0) {
    rules.push('Twoje wyniki są na razie równe. Kolejne ćwiczenia pokażą wyraźniejszy wzorzec.')
  }
  return rules.slice(0, 4)
}
