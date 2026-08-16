// src/lib/router.ts
// Trasy w tej aplikacji są płaskie, więc zamiast biblioteki: pathname + pushState
// + popstate, plus dopasowanie wzorca z parametrami (`/:slug`).
import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname)
}

/**
 * Dopasowuje ścieżkę do wzorca z parametrami: match('/:slug', '/anna-rysnik')
 * daje { slug: 'anna-rysnik' }. Zwraca null, gdy liczba segmentów się nie zgadza.
 */
export function match(pattern: string, path: string): Record<string, string> | null {
  const parts = pattern.split('/').filter(Boolean)
  const segments = path.split('/').filter(Boolean)
  if (parts.length !== segments.length) return null
  const params: Record<string, string> = {}
  for (const [i, part] of parts.entries()) {
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(segments[i])
    else if (part !== segments[i]) return null
  }
  return params
}

export function navigate(path: string): void {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
