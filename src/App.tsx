// src/App.tsx
import { useEffect, useState } from 'react'
import { AboutModal } from './components/AboutModal'
import { BottomNav } from './components/BottomNav'
import type { TabId } from './components/BottomNav'
import { CardPlayer } from './components/CardPlayer'
import { Icon } from './components/Icon'
import { hydrateCards } from './data/cards'
import { useAppState } from './hooks/useAppState'
import { useSession } from './lib/auth-client'
import { navigate } from './lib/router'
import { deckAssetUrl, useDeck } from './services/decks'
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

interface Props {
  /** Slug twórczyni z trasy /<slug> — folder programu w R2. */
  creatorSlug: string
}

export default function App({ creatorSlug }: Props) {
  const { state, saveFailed } = useAppState()
  // Program z R2 to jedyne źródło kart. Ekrany montują się dopiero po hydracji,
  // więc konsumenci CARDS nigdy nie widzą pustego magazynu.
  const deck = useDeck(creatorSlug)
  if (deck.data) {
    const art = Object.fromEntries(
      Object.entries(deck.data.art ?? {}).map(([area, file]) => [
        area,
        deckAssetUrl(creatorSlug, 'art', file),
      ]),
    )
    hydrateCards(deck.data.cards, art)
  }
  const deckReady = Boolean(deck.data)
  // Bez onboardingu: przy pustym profilu zaczynamy od programu, bo to on buduje mapę.
  const [tab, setTab] = useState<TabId>(() => (state.snapshots.length === 0 ? 'program' : 'dzisiaj'))
  const [player, setPlayer] = useState<PlayerTarget | null>(null)
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

  const openPlayer = (
    card: ActivationCard,
    source: ActivationSession['source'],
    entryId?: string,
  ) => setPlayer({ card, source, entryId })

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
        {deckReady && tab === 'dzisiaj' && (
          <TodayScreen onPlay={openPlayer} onAbout={() => setAboutOpen(true)} onNavigate={setTab} />
        )}
        {deckReady && tab === 'program' && <DeckScreen onPlay={openPlayer} onNavigate={setTab} />}
        {deckReady && tab === 'kalendarz' && <CalendarScreen onPlay={openPlayer} />}
        {deckReady && tab === 'balans' && (
          <BalanceScreen onAbout={() => setAboutOpen(true)} onNavigate={setTab} />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {player && (
        <CardPlayer
          card={player.card}
          source={player.source}
          calendarEntryId={player.entryId}
          creatorSlug={creatorSlug}
          onClose={() => setPlayer(null)}
        />
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
