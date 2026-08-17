// src/App.tsx
import { useEffect, useState } from 'react'
import { AboutModal } from './components/AboutModal'
import { BottomNav } from './components/BottomNav'
import type { TabId } from './components/BottomNav'
import { CardPlayer } from './components/CardPlayer'
import { Icon } from './components/Icon'
import { useAppState } from './hooks/useAppState'
import { ProgramProvider } from './hooks/useProgram'
import { navigate } from './lib/router'
import { useDeck } from './services/decks'
import { CardsScreen } from './screens/CardsScreen'
import { DeckHomeScreen } from './screens/DeckHomeScreen'
import { MapScreen } from './screens/MapScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { TreeScreen } from './screens/TreeScreen'
import type { ActivationCard } from './types'
import { dateKey } from './utils/date'

interface Props {
  /** Slug twórczyni z trasy /<slug> — folder talii w R2. */
  creatorSlug: string
}

export default function App({ creatorSlug }: Props) {
  const { saveFailed, markDeckStart } = useAppState()
  // Talia z R2 to jedyne źródło ćwiczeń.
  const deck = useDeck(creatorSlug)
  const [tab, setTab] = useState<TabId>('talia')
  const [player, setPlayer] = useState<{ card: ActivationCard; entryId?: string } | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)

  // Rozkład talii liczy się od pierwszego wejścia — dzień 1 to pierwsze trzy karty Anny.
  useEffect(() => {
    if (deck.data) markDeckStart(dateKey())
  }, [deck.data, markDeckStart])

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <a
            className="brand-row"
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
            aria-label="Wróć do listy talii"
          >
            <span className="brand-mark">LOTOS BALANCE</span>
            {deck.data && <span className="brand-sub">{deck.data.creator.name}</span>}
          </a>
          <div className="row">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setAboutOpen(true)}
              aria-label="O metodzie"
            >
              <Icon name="Info" size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => navigate('/profil')}
              aria-label="Profil"
            >
              <Icon name="UserRound" size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {saveFailed && (
          <p className="caution" role="status">
            <Icon name="Shield" size={16} />
            Przeglądarka nie pozwala nic zapisać (brak miejsca albo tryb prywatny). Historia i plany
            znikną po zamknięciu karty.
          </p>
        )}
        {deck.isPending && (
          <p className="muted center" style={{ padding: 'var(--sp-5)' }}>
            Chwila — talia się otwiera…
          </p>
        )}
        {deck.isError && (
          <section className="surface stack-sm">
            <h2 className="h1">Nie ma takiej talii.</h2>
            <p className="muted">Sprawdź adres.</p>
            <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/')}>
              Wróć do listy talii
            </button>
          </section>
        )}
        {deck.data && (
          <ProgramProvider slug={creatorSlug} deck={deck.data}>
            {tab === 'talia' && (
              <DeckHomeScreen onNavigate={setTab} />
            )}
            {tab === 'karty' && (
              <CardsScreen onPlay={(card, entryId) => setPlayer({ card, entryId })} />
            )}
            {tab === 'drzewo' && <TreeScreen />}
            {tab === 'mapa' && <MapScreen />}
            {tab === 'postepy' && <ProgressScreen onAbout={() => setAboutOpen(true)} />}

            {player && (
              <CardPlayer
                card={player.card}
                calendarEntryId={player.entryId}
                onClose={() => setPlayer(null)}
              />
            )}
          </ProgramProvider>
        )}
      </main>

      {deck.data && <BottomNav active={tab} onChange={setTab} />}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
