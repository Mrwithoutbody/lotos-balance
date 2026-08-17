// src/hooks/useAppState.tsx
// Stan aplikacji to dziś jedna rzecz: historia ukończonych ćwiczeń.
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ActivationSession, AppState, AreaId, Scale5, SwipeDirection } from '../types'
import { clearState, defaultState, loadState, saveState } from '../services/storage'
import { levelsFromAnswers } from '../utils/balance'
import { makeId } from '../utils/id'
import { dateKey } from '../utils/date'

interface AppStateContextValue {
  state: AppState
  /** Zapis do localStorage padł — dane znikną po zamknięciu karty. */
  saveFailed: boolean
  saveSession: (session: Omit<ActivationSession, 'id'>) => ActivationSession
  recordSwipe: (cardId: string, direction: SwipeDirection) => void
  /** Zapisuje dzień startu talii — tylko raz, potem rozkład jest już ustalony. */
  markDeckStart: (date: string) => void
  /** Nowy wynik Mapy Balansu — wyłącznie z odpowiedzi na pytania. */
  addSnapshot: (answers: Partial<Record<AreaId, Scale5>>) => void
  planCard: (date: string, cardId: string) => void
  removeEntry: (entryId: string) => void
  setEntryDone: (entryId: string, done: boolean) => void
  resetAll: () => void
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    setSaveFailed(!saveState(state))
  }, [state])

  const value: AppStateContextValue = {
    state,
    saveFailed,

    saveSession(session) {
      const full: ActivationSession = { ...session, id: makeId('session') }
      setState((prev) => ({ ...prev, sessions: [...prev.sessions, full] }))
      return full
    },

    addSnapshot(answers) {
      setState((prev) => ({
        ...prev,
        snapshots: [
          ...prev.snapshots,
          {
            id: makeId('snap'),
            date: dateKey(),
            createdAt: new Date().toISOString(),
            answers,
            levels: levelsFromAnswers(answers),
          },
        ],
      }))
    },

    markDeckStart(date) {
      setState((prev) => (prev.deckStart ? prev : { ...prev, deckStart: date }))
    },

    recordSwipe(cardId, direction) {
      setState((prev) => ({
        ...prev,
        swipes: [...prev.swipes, { id: makeId('swipe'), cardId, direction, date: dateKey() }],
      }))
    },

    planCard(date, cardId) {
      setState((prev) => ({
        ...prev,
        calendar: [
          ...prev.calendar,
          {
            id: makeId('cal'),
            date,
            cardId,
            done: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }))
    },

    removeEntry(entryId) {
      setState((prev) => ({ ...prev, calendar: prev.calendar.filter((e) => e.id !== entryId) }))
    },

    setEntryDone(entryId, done) {
      setState((prev) => ({
        ...prev,
        calendar: prev.calendar.map((e) => (e.id === entryId ? { ...e, done } : e)),
      }))
    },

    resetAll() {
      clearState()
      setState(defaultState())
    },
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState musi być użyte wewnątrz AppStateProvider')
  return ctx
}
