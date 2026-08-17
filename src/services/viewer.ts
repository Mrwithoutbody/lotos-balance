// src/services/viewer.ts
// Kim jest osoba przy ekranie i w jakim widoku pracuje.
// Rola przychodzi z serwera (D1) i tylko ona daje dostęp; wybór widoku to
// preferencja zapisana lokalnie — przełącznik nigdy nie nadaje uprawnień.
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

export type Role = 'user' | 'creator' | 'specialist'
export type ViewMode = 'uzytkowniczka' | 'tworczyni'

export interface Viewer {
  name: string
  role: Role
  /** Talie, którymi zarządza to konto. */
  decks: { slug: string; name: string }[]
}

const VIEW_KEY = 'lotos-balance:widok'
const listeners = new Set<() => void>()

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
  listeners.forEach((l) => l())
}

/** Wybrany widok. Zmiana odświeża każdy komponent, który go czyta. */
export function useViewMode(): ViewMode {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
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
export function useCreatorPanel(enabled: boolean) {
  return useQuery<{ decks: CreatorDeck[] }>({
    queryKey: ['creator-panel'],
    enabled,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const res = await fetch('/api/creator')
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
