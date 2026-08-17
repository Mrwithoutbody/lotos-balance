// src/services/insights.ts
// Liczby na stronę postępów. Wyłącznie z lokalnej historii, bez AI i bez zgadywania.
import type { AppState } from '../types'
import { addDays, dateKey } from '../utils/date'

/** Liczba dni z rzędu (licząc od dziś lub wczoraj) z ukończonym ćwiczeniem. */
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

/** Aktywność z ostatnich siedmiu dni: liczba ukończonych ćwiczeń dziennie. */
export function weekActivity(state: AppState): { date: string; count: number }[] {
  const today = dateKey()
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6)
    const count = state.sessions.filter((s) => s.completed && s.date === date).length
    return { date, count }
  })
}
