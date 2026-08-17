// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppStateProvider } from './hooks/useAppState'
import { match, usePath } from './lib/router'
import { LoginScreen } from './screens/LoginScreen'
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

// SW tylko na produkcji — w dev cache powłoki tylko myli.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

/** "/" → wejście, "/logowanie" → logowanie, "/<slug>" → program twórczyni. */
function Root() {
  const path = usePath()
  if (match('/', path)) return <StartScreen />
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
