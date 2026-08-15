// src/App.tsx
import { useState } from 'react'
import { AboutModal } from './components/AboutModal'
import { BottomNav } from './components/BottomNav'
import type { TabId } from './components/BottomNav'
import { CardPlayer } from './components/CardPlayer'
import { Icon } from './components/Icon'
import { useAppState } from './hooks/useAppState'
import { BalanceScreen } from './screens/BalanceScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { DeckScreen } from './screens/DeckScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { ActivationCard, ActivationSession } from './types'

interface PlayerTarget {
  card: ActivationCard
  source: ActivationSession['source']
  entryId?: string
}

export default function App() {
  const { state } = useAppState()
  // Bez onboardingu: przy pustym profilu zaczynamy od talii, bo to ona buduje mapę.
  const [tab, setTab] = useState<TabId>(() => (state.snapshots.length === 0 ? 'talia' : 'dzisiaj'))
  const [player, setPlayer] = useState<PlayerTarget | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)

  const openPlayer = (
    card: ActivationCard,
    source: ActivationSession['source'],
    entryId?: string,
  ) => setPlayer({ card, source, entryId })

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <span className="brand-row">
            <span className="brand-mark">MENTAL BALANCE</span>
            <span className="brand-sub">by Anna</span>
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setAboutOpen(true)}
            aria-label="O metodzie"
          >
            <Icon name="Info" size={18} />
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'dzisiaj' && (
          <TodayScreen onPlay={openPlayer} onAbout={() => setAboutOpen(true)} onNavigate={setTab} />
        )}
        {tab === 'talia' && <DeckScreen onPlay={openPlayer} onNavigate={setTab} />}
        {tab === 'kalendarz' && <CalendarScreen onPlay={openPlayer} />}
        {tab === 'balans' && (
          <BalanceScreen onAbout={() => setAboutOpen(true)} onNavigate={setTab} />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {player && (
        <CardPlayer
          card={player.card}
          source={player.source}
          calendarEntryId={player.entryId}
          onClose={() => setPlayer(null)}
        />
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
