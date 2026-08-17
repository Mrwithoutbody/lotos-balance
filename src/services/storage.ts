// src/services/storage.ts
import type { AppState } from '../types'

const STORAGE_KEY = 'lotos-balance:v1'

export function defaultState(): AppState {
  return {
    snapshots: [],
    checkIns: [],
    sessions: [],
    calendar: [],
    favorites: [],
    swipes: [],
    brainSteps: [],
  }
}

/** Zostawia tylko elementy o wymaganych polach — jeden uszkodzony wpis nie kasuje reszty. */
function keep<T>(value: unknown, fields: string[]): T[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is T =>
      Boolean(item) &&
      typeof item === 'object' &&
      fields.every((f) => typeof (item as Record<string, unknown>)[f] === 'string'),
  )
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []

/** Uzupełnia braki i odrzuca uszkodzone wpisy — zamiast wywalać całą aplikację. */
function migrate(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') return defaultState()
  const data = raw as Partial<AppState>
  return {
    snapshots: keep(data.snapshots, ['id', 'date']),
    checkIns: keep(data.checkIns, ['id', 'date', 'need']),
    sessions: keep(data.sessions, ['id', 'date', 'cardId']),
    calendar: keep(data.calendar, ['id', 'date', 'cardId']),
    favorites: strings(data.favorites),
    swipes: keep(data.swipes, ['id', 'cardId', 'area', 'direction']),
    brainSteps: strings(data.brainSteps),
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return migrate(JSON.parse(raw))
  } catch {
    return defaultState()
  }
}

/** Zwraca false, gdy zapis padł — brak miejsca albo tryb prywatny. */
export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    // Aplikacja działa dalej na stanie w pamięci, ale UI musi o tym powiedzieć.
    return false
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignorujemy — nic więcej nie da się tu zrobić
  }
}

/** Eksport danych do pliku JSON pobieranego lokalnie. */
export function exportState(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lotos-balance-dane-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
