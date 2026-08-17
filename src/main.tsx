// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppStateProvider } from './hooks/useAppState'
import { match, usePath } from './lib/router'
import { LoginScreen } from './screens/LoginScreen'
import { CreatorHome } from './screens/CreatorHome'
import { StartScreen } from './screens/StartScreen'
import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/inter'
import './styles/global.css'
import './styles/components.css'
import './styles/screens.css'

const container = document.getElementById('root')
if (!container) throw new Error('Nie znaleziono elementu #root')

const queryClient = new QueryClient()

/**
 * SERVICE WORKER WYŁĄCZONY NA CZAS PRAC (17.08.2026).
 * Cache powłoki powodował, że po deployu widać było stary build do czasu ręcznego
 * wyrejestrowania. Zamiast rejestrować, sprzątamy po sobie: każde wejście zdejmuje
 * starego workera i kasuje jego cache, więc osoby z zainstalowaną apką dostają nowy
 * kod bez grzebania w przeglądarce.
 *
 * Powrót po pracach: przywróć rejestrację (`navigator.serviceWorker.register('/sw.js')`)
 * i podbij nazwę cache w public/sw.js. Do tego czasu apka nie działa offline,
 * a Android nie pokaże własnego promptu instalacji (wymaga aktywnego SW).
 */
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then(async (regs) => {
    if (regs.length === 0) return
    await Promise.all(regs.map((r) => r.unregister()))
    await Promise.all((await caches.keys()).map((k) => caches.delete(k)))
    console.info('[LOTOS] Service worker wyłączony na czas prac — cache powłoki wyczyszczony.')
  })
}

/** "/" → wejście, "/logowanie" → logowanie, "/<slug>" → program twórczyni. */
function Root() {
  const path = usePath()
  if (match('/', path)) return <CreatorHome />
  if (match('/logowanie', path)) return <LoginScreen />
  const program = match('/:slug', path)
  if (program) return <App creatorSlug={program.slug} />
  return <StartScreen />
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <Root />
      </AppStateProvider>
    </QueryClientProvider>
  </StrictMode>,
)
