// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppStateProvider } from './hooks/useAppState'
import { usePath } from './lib/router'
import { CircleScreen } from './screens/CircleScreen'
import { LoginScreen } from './screens/LoginScreen'
import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/inter'
import './styles/global.css'
import './styles/components.css'
import './styles/screens.css'

const container = document.getElementById('root')
if (!container) throw new Error('Nie znaleziono elementu #root')

const queryClient = new QueryClient()

/** "/" → krąg, "/logowanie" → logowanie, "/<slug>" → aplikacja talii twórczyni. */
function Root() {
  const path = usePath()
  if (path === '/') return <CircleScreen />
  if (path === '/logowanie') return <LoginScreen />
  return <App creatorSlug={path.slice(1).split('/')[0]} />
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
