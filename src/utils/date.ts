// src/utils/date.ts

export const WEEKDAYS_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

/** Klucz dnia YYYY-MM-DD w czasie lokalnym — locale sv-SE ma dokładnie ten format. */
export function dateKey(d: Date = new Date()): string {
  return d.toLocaleDateString('sv-SE')
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + days)
  return dateKey(d)
}

export function diffDays(a: string, b: string): number {
  const ms = parseKey(a).getTime() - parseKey(b).getTime()
  return Math.round(ms / 86400000)
}

/** Pełna, czytelna data po polsku, np. „piątek, 15 sierpnia”. */
export function longDate(key: string): string {
  const d = parseKey(key)
  return d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function shortDate(key: string): string {
  const d = parseKey(key)
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}

export function weekdayShort(key: string): string {
  const d = parseKey(key)
  return WEEKDAYS_SHORT[(d.getDay() + 6) % 7]
}

export function partOfDay(now: Date = new Date()): 'rano' | 'popołudnie' | 'wieczór' {
  const h = now.getHours()
  if (h < 12) return 'rano'
  if (h < 18) return 'popołudnie'
  return 'wieczór'
}
