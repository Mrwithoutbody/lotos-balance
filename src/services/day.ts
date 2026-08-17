// src/services/day.ts
// Rozkład talii w czasie. Manifest z R2 nie ma harmonogramu, więc rozkładem jest
// kolejność ustalona przez twórczynię: dzień pierwszy dostaje trzy pierwsze karty,
// dzień drugi kolejne trzy i tak dalej. Wszystko liczone z daty i historii.
import type { ActivationCard, AppState, AreaId } from '../types/index.ts'
import { diffDays } from '../utils/date.ts'

/** Pory dnia zamiast godzin — okno, nie termin. */
export type DayPart = 'rano' | 'popołudnie' | 'wieczór'

export interface DaySlot {
  card: ActivationCard
  /** Pora dnia; brak = karta oglądana poza rozkładem. */
  part?: DayPart
}

/** Ile kart talia rozkłada na jeden dzień — po jednej na porę. */
export const CARDS_PER_DAY = 3

const PARTS: DayPart[] = ['rano', 'popołudnie', 'wieczór']

/** Obszary, które budzą, i ten, który zamyka dzień. Reszta pasuje w środek. */
const EARLY: AreaId[] = ['cialo', 'dzialanie']
const LATE: AreaId = 'regeneracja'
const affinity = (area: AreaId) => (EARLY.includes(area) ? 0 : area === LATE ? 2 : 1)

/** „Nie czuję się z tym dobrze” zdejmuje temat na dwa tygodnie. */
const AVOID_DAYS = 14

/** Który to dzień pracy z talią (1 = dzień pierwszego wejścia). */
export function dayNumber(state: AppState, date: string): number {
  if (!state.deckStart) return 1
  return Math.max(0, diffDays(date, state.deckStart)) + 1
}

/**
 * Karty rozłożone na dany dzień, z porami. Kolejna trójka z listy twórczyni,
 * licząc od dnia startu; karty odrzucone „w lewo” w ostatnich dwóch tygodniach
 * do rozdania nie wchodzą. Dzisiejszy gest rozdania nie przebudowuje.
 */
export function dayDeal(state: AppState, cards: ActivationCard[], date: string): DaySlot[] {
  if (cards.length === 0) return []

  const avoided = new Set(
    state.swipes
      .filter((s) => {
        const ago = diffDays(date, s.date)
        return s.direction === 'w-lewo' && ago > 0 && ago < AVOID_DAYS
      })
      .map((s) => s.cardId),
  )

  const start = (dayNumber(state, date) - 1) * CARDS_PER_DAY
  const dealt: ActivationCard[] = []

  for (let step = 0; step < cards.length && dealt.length < CARDS_PER_DAY; step += 1) {
    const card = cards[(start + step) % cards.length]
    if (!avoided.has(card.id)) dealt.push(card)
  }

  return dealt
    .sort((a, b) => affinity(a.area) - affinity(b.area))
    .map((card, i) => ({ card, part: PARTS[i] ?? 'popołudnie' }))
}

/**
 * Co z rozdania zostało na dany dzień: bez kart odłożonych gestem i bez tych
 * wykonanych. Nic nie dochodzi w zamian — pusto znaczy, że dzień zamknięty.
 */
export function dayCards(state: AppState, cards: ActivationCard[], date: string): DaySlot[] {
  const done = new Set(
    state.sessions.filter((s) => s.completed && s.date === date).map((s) => s.cardId),
  )
  const swiped = new Set(state.swipes.filter((s) => s.date === date).map((s) => s.cardId))

  return dayDeal(state, cards, date).filter(
    ({ card }) => !done.has(card.id) && !swiped.has(card.id),
  )
}
