// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppStateProvider } from './hooks/useAppState'
import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/inter'
import './styles/global.css'
import './styles/components.css'
import './styles/screens.css'

const container = document.getElementById('root')
if (!container) throw new Error('Nie znaleziono elementu #root')

createRoot(container).render(
  <StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </StrictMode>,
)
