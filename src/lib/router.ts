// src/lib/router.ts
// Dwie trasy nie zasługują na bibliotekę: pathname + pushState + popstate.
// ponytail: brak parametrów w ścieżce, zagnieżdżeń i strażników trasy — dopasowanie
// idzie na surowym pathname; prawdziwy router gdy dojdą trasy z parametrem
// albo ekran wymagający przekierowania przy braku sesji.
import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname)
}

export function navigate(path: string): void {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
