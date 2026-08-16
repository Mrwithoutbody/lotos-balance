// src/hooks/useAppState.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  ActivationSession,
  AppState,
  AreaId,
  DailyCheckIn,
  Scale5,
  SwipeDirection,
} from '../types'
import { clearState, defaultState, loadState, saveState } from '../services/storage'
import { latestSnapshot, levelsFromAnswers } from '../utils/balance'
import { makeId } from '../utils/id'
import { todayKey } from '../utils/date'

interface AppStateContextValue {
  state: AppState
  /** Zapis do localStorage padł — dane znikną po zamknięciu karty. */
  saveFailed: boolean
  /** Odpowiedź na jedno pytanie Mapy Balansu — dopisywana do dzisiejszego wyniku. */
  setAreaAnswer: (area: AreaId, answer: Scale5) => void
  recordSwipe: (cardId: string, area: AreaId, direction: SwipeDirection) => void
  addSnapshot: (answers: Partial<Record<AreaId, Scale5>>) => void
  addCheckIn: (input: Omit<DailyCheckIn, 'id' | 'date' | 'createdAt'>) => DailyCheckIn
  saveSession: (session: Omit<ActivationSession, 'id'>) => ActivationSession
  toggleFavorite: (cardId: string) => void
  planCard: (date: string, cardId: string) => void
  removeEntry: (entryId: string) => void
  rescheduleEntry: (entryId: string, date: string) => void
  setEntryDone: (entryId: string, done: boolean, sessionId?: string) => void
  markBrainStep: (date: string) => void
  resetAll: () => void
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    setSaveFailed(!saveState(state))
  }, [state])

  // Profil powstaje sam przy pierwszym uruchomieniu — bez ekranu rejestracji.
  useEffect(() => {
    setState((prev) =>
      prev.profile ? prev : { ...prev, profile: { createdAt: new Date().toISOString() } },
    )
  }, [])

  const value = useMemo<AppStateContextValue>(() => {
    const makeSnapshot = (answers: Partial<Record<AreaId, Scale5>>) => ({
      id: makeId('snap'),
      date: todayKey(),
      createdAt: new Date().toISOString(),
      answers,
      levels: levelsFromAnswers(answers),
    })

    return {
      state,
      saveFailed,

      setAreaAnswer(area, answer) {
        setState((prev) => {
          const today = todayKey()
          const existing = prev.snapshots.find((s) => s.date === today)
          const base = existing ?? latestSnapshot(prev.snapshots)
          const answers = { ...(base?.answers ?? {}), [area]: answer }
          const updated = {
            id: existing?.id ?? makeId('snap'),
            date: today,
            createdAt: new Date().toISOString(),
            answers,
            levels: levelsFromAnswers(answers),
          }
          return {
            ...prev,
            snapshots: existing
              ? prev.snapshots.map((s) => (s.id === existing.id ? updated : s))
              : [...prev.snapshots, updated],
          }
        })
      },

      recordSwipe(cardId, area, direction) {
        setState((prev) => ({
          ...prev,
          swipes: [
            ...prev.swipes,
            {
              id: makeId('swipe'),
              cardId,
              area,
              direction,
              date: todayKey(),
              createdAt: new Date().toISOString(),
            },
          ],
          favorites:
            direction === 'w-prawo' && !prev.favorites.includes(cardId)
              ? [...prev.favorites, cardId]
              : prev.favorites,
        }))
      },

      addSnapshot(answers) {
        setState((prev) => ({ ...prev, snapshots: [...prev.snapshots, makeSnapshot(answers)] }))
      },

      addCheckIn(input) {
        const checkIn: DailyCheckIn = {
          ...input,
          id: makeId('checkin'),
          date: todayKey(),
          createdAt: new Date().toISOString(),
        }
        setState((prev) => ({ ...prev, checkIns: [...prev.checkIns, checkIn] }))
        return checkIn
      },

      saveSession(session) {
        const full: ActivationSession = { ...session, id: makeId('session') }
        setState((prev) => ({ ...prev, sessions: [...prev.sessions, full] }))
        return full
      },

      toggleFavorite(cardId) {
        setState((prev) => ({
          ...prev,
          favorites: prev.favorites.includes(cardId)
            ? prev.favorites.filter((id) => id !== cardId)
            : [...prev.favorites, cardId],
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

      rescheduleEntry(entryId, date) {
        setState((prev) => ({
          ...prev,
          calendar: prev.calendar.map((e) => (e.id === entryId ? { ...e, date } : e)),
        }))
      },

      setEntryDone(entryId, done, sessionId) {
        setState((prev) => ({
          ...prev,
          calendar: prev.calendar.map((e) =>
            e.id === entryId ? { ...e, done, sessionId: sessionId ?? e.sessionId } : e,
          ),
        }))
      },

      markBrainStep(date) {
        setState((prev) =>
          prev.brainSteps.includes(date)
            ? prev
            : { ...prev, brainSteps: [...prev.brainSteps, date] },
        )
      },

      resetAll() {
        clearState()
        setState(defaultState())
      },
    }
  }, [state, saveFailed])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState musi być użyte wewnątrz AppStateProvider')
  return ctx
}
