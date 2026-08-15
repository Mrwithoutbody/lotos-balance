// src/services/demo.ts
import { CARDS } from '../data/cards'
import type {
  ActivationSession,
  AppState,
  AreaId,
  BalanceSnapshot,
  CalendarEntry,
  DailyCheckIn,
  Minutes,
  NeedId,
  Scale5,
} from '../types'
import { levelsFromAnswers } from '../utils/balance'
import { addDays, todayKey } from '../utils/date'
import { defaultState } from './storage'

/** Deterministyczny generator — te same dane demonstracyjne przy każdym uruchomieniu. */
function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function iso(dayKey: string, hour: number): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  return new Date(y, m - 1, d, hour, 15).toISOString()
}

function snapshot(date: string, answers: Record<AreaId, Scale5>): BalanceSnapshot {
  return {
    id: `demo-snap-${date}`,
    date,
    createdAt: iso(date, 9),
    answers,
    levels: levelsFromAnswers(answers),
  }
}

export function buildDemoState(): AppState {
  const today = todayKey()
  const rand = lcg(20240815)

  const state: AppState = {
    ...defaultState(),
    isDemo: true,
    profile: {
      name: 'Anna',
      goals: ['mniej-stresu', 'wiecej-energii', 'koncentracja'],
      createdAt: iso(addDays(today, -24), 8),
    },
    favorites: ['reg-oddech', 'umy-zrzut', 'cia-spacer'],
    swipes: [
      { id: 'demo-sw-1', cardId: 'reg-oddech', area: 'regeneracja', direction: 'w-prawo', date: addDays(today, -6), createdAt: iso(addDays(today, -6), 9) },
      { id: 'demo-sw-2', cardId: 'umy-zrzut', area: 'umysl', direction: 'w-prawo', date: addDays(today, -5), createdAt: iso(addDays(today, -5), 10) },
      { id: 'demo-sw-3', cardId: 'rel-nie', area: 'relacje', direction: 'w-lewo', date: addDays(today, -5), createdAt: iso(addDays(today, -5), 10) },
      { id: 'demo-sw-4', cardId: 'cia-spacer', area: 'cialo', direction: 'w-prawo', date: addDays(today, -3), createdAt: iso(addDays(today, -3), 17) },
      { id: 'demo-sw-5', cardId: 'sen-przyszla', area: 'sens', direction: 'w-lewo', date: addDays(today, -2), createdAt: iso(addDays(today, -2), 21) },
    ],
    brainSteps: [addDays(today, -1), addDays(today, -3), addDays(today, -4), addDays(today, -8)],
  }

  state.snapshots = [
    snapshot(addDays(today, -24), {
      emocje: 2,
      regeneracja: 2,
      umysl: 2,
      dzialanie: 3,
      cialo: 2,
      relacje: 3,
      sens: 3,
    }),
    snapshot(addDays(today, -12), {
      emocje: 3,
      regeneracja: 2,
      umysl: 3,
      dzialanie: 3,
      cialo: 3,
      relacje: 4,
      sens: 3,
    }),
    snapshot(addDays(today, -2), {
      emocje: 3,
      regeneracja: 3,
      umysl: 3,
      dzialanie: 4,
      cialo: 3,
      relacje: 4,
      sens: 4,
    }),
  ]

  const needs: NeedId[] = ['uspokojenie', 'energia', 'skupienie', 'ulga', 'kontakt-z-cialem', 'kierunek']
  const times: Minutes[] = [3, 7, 15]
  const favouriteCards = [
    'reg-oddech',
    'umy-zrzut',
    'cia-spacer',
    'emo-nazwij',
    'dzi-dwie-minuty',
    'reg-pauza',
    'umy-jedna-rzecz',
    'rel-napisz',
    'sen-co-mialo-znaczenie',
    'cia-swiatlo',
    'umy-sprint',
    'emo-zmysly',
  ]

  const sessions: ActivationSession[] = []
  const checkIns: DailyCheckIn[] = []

  for (let i = 20; i >= 0; i -= 1) {
    const date = addDays(today, -i)
    const roll = rand()
    if (roll < 0.25) continue // dni bez aktywności — realniejszy wykres

    const need = needs[Math.floor(rand() * needs.length)]
    const minutes = times[Math.floor(rand() * times.length)]
    const hour = 8 + Math.floor(rand() * 12)
    const before = (1 + Math.floor(rand() * 3)) as Scale5

    checkIns.push({
      id: `demo-checkin-${date}`,
      date,
      createdAt: iso(date, hour),
      need,
      minutes,
      state: before,
    })

    const cardId = favouriteCards[Math.floor(rand() * favouriteCards.length)]
    const gain = rand() < 0.75 ? 1 + Math.floor(rand() * 2) : 0
    const after = Math.min(5, before + gain) as Scale5

    sessions.push({
      id: `demo-session-${date}-a`,
      cardId,
      date,
      startedAt: iso(date, hour),
      finishedAt: iso(date, hour),
      before,
      after,
      completed: true,
      note: gain >= 2 ? 'Wyraźnie lżej po tej aktywacji.' : undefined,
      source: rand() < 0.5 ? 'dzisiaj' : 'talia',
    })

    if (rand() < 0.3) {
      const secondCard = CARDS[Math.floor(rand() * CARDS.length)].id
      const before2 = (2 + Math.floor(rand() * 3)) as Scale5
      sessions.push({
        id: `demo-session-${date}-b`,
        cardId: secondCard,
        date,
        startedAt: iso(date, Math.min(21, hour + 5)),
        finishedAt: iso(date, Math.min(21, hour + 5)),
        before: before2,
        after: Math.min(5, before2 + (rand() < 0.5 ? 1 : 0)) as Scale5,
        completed: true,
        source: 'kalendarz',
      })
    }
  }

  state.sessions = sessions
  state.checkIns = checkIns

  const calendar: CalendarEntry[] = []
  const plan: { offset: number; cardId: string; done: boolean }[] = [
    { offset: -6, cardId: 'cia-spacer', done: true },
    { offset: -5, cardId: 'rel-granica', done: false },
    { offset: -4, cardId: 'reg-wieczor', done: true },
    { offset: -3, cardId: 'umy-zrzut', done: true },
    { offset: -2, cardId: 'rel-napisz', done: false },
    { offset: -1, cardId: 'reg-oddech', done: true },
    { offset: 0, cardId: 'umy-jedna-rzecz', done: false },
    { offset: 1, cardId: 'cia-spacer', done: false },
    { offset: 2, cardId: 'sen-wartosc', done: false },
    { offset: 4, cardId: 'reg-wieczor', done: false },
    { offset: 6, cardId: 'dzi-odwazny-krok', done: false },
  ]
  for (const item of plan) {
    const date = addDays(today, item.offset)
    calendar.push({
      id: `demo-cal-${date}-${item.cardId}`,
      date,
      cardId: item.cardId,
      done: item.done,
      createdAt: iso(addDays(date, -1), 20),
    })
  }
  state.calendar = calendar

  return state
}
