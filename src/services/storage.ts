// src/services/storage.ts
import type { ActivationSession, AppState } from '../types'

export const STORAGE_KEY = 'lotos-balance:v1'

/** Poprzednia nazwa aplikacji — odczyt awaryjny, żeby nie zgubić danych testerek. */
const LEGACY_KEY = 'mental-balance:v1'

export function defaultState(): AppState {
  return {
    profile: null,
    snapshots: [],
    checkIns: [],
    sessions: [],
    calendar: [],
    favorites: [],
    swipes: [],
    brainSteps: [],
  }
}

/** Sesje sprzed zmiany nazwy ekranu mają source 'talia' — czytamy je jako 'program'. */
const renameSource = (s: ActivationSession): ActivationSession =>
  (s?.source as string) === 'talia' ? { ...s, source: 'program' } : s

/** Uzupełnia braki i odrzuca pola o złych typach — zamiast wywalać całą aplikację. */
// ponytail: sprawdzamy tylko typ pola, nie kształt elementów w tablicach — uszkodzony
// wpis w snapshots/sessions przechodzi do komponentów; walidacja schematem gdy dane
// zaczną przychodzić z serwera zamiast wyłącznie z localStorage tej przeglądarki.
function migrate(raw: unknown): AppState {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const data = raw as Partial<AppState>
  return {
    profile: data.profile && typeof data.profile === 'object' ? data.profile : base.profile,
    snapshots: Array.isArray(data.snapshots) ? data.snapshots : base.snapshots,
    checkIns: Array.isArray(data.checkIns) ? data.checkIns : base.checkIns,
    sessions: Array.isArray(data.sessions) ? data.sessions.map(renameSource) : base.sessions,
    calendar: Array.isArray(data.calendar) ? data.calendar : base.calendar,
    favorites: Array.isArray(data.favorites) ? data.favorites : base.favorites,
    swipes: Array.isArray(data.swipes) ? data.swipes : base.swipes,
    brainSteps: Array.isArray(data.brainSteps) ? data.brainSteps : base.brainSteps,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return defaultState()
    return migrate(JSON.parse(raw))
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Brak miejsca lub tryb prywatny — aplikacja działa dalej na stanie w pamięci.
    // ponytail: cisza — użytkowniczka traci dane po zamknięciu karty i nie wie o tym;
    // komunikat w UI gdy pojawią się dłuższe sesje albo dane warte odzyskania.
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
