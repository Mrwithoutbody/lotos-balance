// src/App.tsx
import { useEffect, useState } from 'react'
import { AboutModal } from './components/AboutModal'
import { BottomNav } from './components/BottomNav'
import type { TabId } from './components/BottomNav'
import { CardPlayer } from './components/CardPlayer'
import { Icon } from './components/Icon'
import { useAppState } from './hooks/useAppState'
import { ProgramProvider } from './hooks/useProgram'
import { useSession } from './lib/auth-client'
import { navigate } from './lib/router'
import { useDeck } from './services/decks'
import { BalanceScreen } from './screens/BalanceScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { DeckScreen } from './screens/DeckScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { ActivationCard } from './types'

interface Props {
  /** Slug twórczyni z trasy /<slug> — folder programu w R2. */
  creatorSlug: string
}

export default function App({ creatorSlug }: Props) {
  const { state, saveFailed } = useAppState()
  // Program z R2 to jedyne źródło ćwiczeń. Idzie do ekranów przez ProgramProvider,
  // więc nikt nie czyta go z globala i nikt nie widzi pustego programu.
  const deck = useDeck(creatorSlug)
  // Bez onboardingu: bez ani jednego wyniku zaczynamy od programu, bo to on buduje mapę.
  const [tab, setTab] = useState<TabId>(() => (state.snapshots.length === 0 ? 'program' : 'dzisiaj'))
  const [player, setPlayer] = useState<{ card: ActivationCard; entryId?: string } | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)

  // Wejście na stronę twórczyni = dołączenie do jej kręgu (link działa jak
  // zaproszenie). Serwer jest idempotentny (onConflictDoNothing), więc
  // wystarczy strzelić raz po zalogowaniu; błąd sieci nie blokuje programu.
  const loggedIn = Boolean(useSession().data)
  useEffect(() => {
    if (!loggedIn || !deck.data) return
    fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: creatorSlug }),
    }).catch(() => {})
  }, [loggedIn, creatorSlug, deck.data])

  const openPlayer = (card: ActivationCard, entryId?: string) => setPlayer({ card, entryId })

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
            aria-label="Wróć do kręgu"
          >
            <span className="brand-mark">LOTOS BALANCE</span>
            {deck.data && <span className="brand-sub">{deck.data.creator.name}</span>}
          </a>
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
        {saveFailed && (
          <p className="caution" role="status">
            <Icon name="Shield" size={16} />
            Przeglądarka nie pozwala nic zapisać (brak miejsca albo tryb prywatny). Wyniki i plany
            znikną po zamknięciu karty.
          </p>
        )}
        {deck.isPending && (
          <p className="muted center" style={{ padding: 'var(--sp-5)' }}>
            Chwila — program się otwiera…
          </p>
        )}
        {deck.isError && (
          <section className="surface stack-sm">
            <h2 className="h1">Nie ma takiego programu.</h2>
            <p className="muted">Sprawdź adres.</p>
            <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/')}>
              Wróć do kręgu
            </button>
          </section>
        )}
        {deck.data && (
          <ProgramProvider slug={creatorSlug} deck={deck.data}>
            {tab === 'dzisiaj' && (
              <TodayScreen
                onPlay={openPlayer}
                onAbout={() => setAboutOpen(true)}
                onNavigate={setTab}
              />
            )}
            {tab === 'program' && <DeckScreen onPlay={openPlayer} onNavigate={setTab} />}
            {tab === 'kalendarz' && <CalendarScreen onPlay={openPlayer} />}
            {tab === 'balans' && (
              <BalanceScreen onAbout={() => setAboutOpen(true)} onNavigate={setTab} />
            )}

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

      <BottomNav active={tab} onChange={setTab} />

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
