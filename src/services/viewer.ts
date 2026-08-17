// src/services/viewer.ts
// Kim jest osoba przy ekranie i w jakim widoku pracuje.
// Rola przychodzi z serwera (D1) i tylko ona daje dostęp; wybór widoku to
// preferencja zapisana lokalnie — przełącznik nigdy nie nadaje uprawnień.
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { dateKey } from '../utils/date'

export type Role = 'user' | 'creator' | 'specialist'
export type ViewMode = 'uzytkowniczka' | 'tworczyni'

export interface Viewer {
  name: string
  role: Role
}

const VIEW_KEY = 'lotos-balance:widok'
/** Zdarzenie okna zamiast własnej listy słuchaczy — subskrypcję robi platforma. */
const VIEW_EVENT = 'lotos:widok'

function readView(): ViewMode {
  try {
    return localStorage.getItem(VIEW_KEY) === 'tworczyni' ? 'tworczyni' : 'uzytkowniczka'
  } catch {
    return 'uzytkowniczka'
  }
}

export function setViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_KEY, mode)
  } catch {
    // tryb prywatny — widok zostaje do końca sesji
  }
  window.dispatchEvent(new Event(VIEW_EVENT))
}

/** Wybrany widok. Zmiana odświeża każdy komponent, który go czyta. */
export function useViewMode(): ViewMode {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(VIEW_EVENT, onChange)
      return () => window.removeEventListener(VIEW_EVENT, onChange)
    },
    readView,
    () => 'uzytkowniczka',
  )
}

/** Konto zalogowanej osoby albo null. Serwer decyduje o roli. */
export function useViewer() {
  return useQuery<Viewer | null>({
    queryKey: ['me'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch('/api/me')
      if (!res.ok) return null
      return res.json()
    },
  })
}

/** Panel twórczyni: talie z licznikami. Serwer sam sprawdza rolę. */
export function useCreatorPanel() {
  return useQuery<{ decks: CreatorDeck[] }>({
    queryKey: ['creator-panel'],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const res = await fetch(`/api/creator?dzien=${dateKey()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })
}

export interface CreatorDeck {
  slug: string
  name: string
  /** Ukończenia łącznie i liczba osób — bez identyfikatorów. */
  ukonczenia: number
  osoby: number
  dzis: number
  top: { cardId: string; ile: number }[]
}
