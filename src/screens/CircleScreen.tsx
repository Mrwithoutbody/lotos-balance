// src/screens/CircleScreen.tsx
// Krąg na "/": feed wspólnej pracy + programy twórczyń, w tabach.
// Bez atrap — liczby przychodzą z D1, a sekcje bez danych po prostu się nie renderują.
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import { InstallButton } from '../components/InstallButton'
import { useAppState } from '../hooks/useAppState'
import { signOut, useSession } from '../lib/auth-client'
import { navigate } from '../lib/router'
import { streak } from '../services/insights'
import { deckAssetUrl, useDeck } from '../services/decks'
import { shortDate } from '../utils/date'
import { plural } from '../utils/plural'

interface CreatorRow {
  slug: string
  name: string
  followers?: number
}

interface Me {
  user: { name: string; email: string }
}

interface FeedRow {
  creatorSlug: string
  creatorName: string
  cardId: string
  date: string
}

/** Jeden fetch-json pod react-query — oba zapytania tego ekranu wyglądają tak samo. */
function useJson<T>(key: string, url: string, enabled = true) {
  return useQuery<T>({
    queryKey: [key],
    enabled,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })
}

/** Wiersz feedu — tytuł karty dociągamy z manifestu programu (react-query deduplikuje). */
function FeedEntry({ row }: { row: FeedRow }) {
  const deck = useDeck(row.creatorSlug)
  const title = deck.data?.cards.find((c) => c.id === row.cardId)?.title ?? 'ćwiczenie'
  return (
    <li className="entry-row">
      <div className="entry-row-block">
        <p className="entry-title">Ukończone: „{title}”</p>
        <p className="tiny">
          {row.creatorName} · {shortDate(row.date)}
        </p>
      </div>
    </li>
  )
}

function CreatorCard({ creator }: { creator: CreatorRow }) {
  const deck = useDeck(creator.slug)
  const cover = deck.data?.creator.cover
    ? deckAssetUrl(creator.slug, deck.data.creator.cover)
    : undefined
  const followers = creator.followers ?? 0

  return (
    <article
      className="brain-card-dark"
      style={cover ? { backgroundImage: `url(${cover})` } : undefined}
    >
      <div className="brain-card-scrim">
        <h2 className="brain-title">{creator.name}</h2>
        {deck.data?.creator.bio && <p className="brain-hint">{deck.data.creator.bio}</p>}
        <p className="brain-hint">
          {deck.data
            ? `${deck.data.cards.length} ${plural(deck.data.cards.length, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}`
            : 'Wczytywanie programu…'}
          {followers >= 10 && ` · ${followers} ${plural(followers, 'osoba', 'osoby', 'osób')} w kręgu`}
        </p>
        <div className="row wrap">
          <button
            type="button"
            className="btn btn-glass"
            onClick={() => navigate(`/${creator.slug}`)}
          >
            <Icon name="Play" size={16} />
            Zacznij pierwsze ćwiczenie (3 min)
          </button>
        </div>
      </div>
    </article>
  )
}

export function CircleScreen() {
  const session = useSession()
  const loggedIn = Boolean(session.data)
  const circle = useJson<{ creators: CreatorRow[]; feed: FeedRow[] }>('circle', '/api/circle')
  // /api/me odpowiada null, gdy sesja padła — stąd null w typie.
  const me = useJson<Me | null>('me', '/api/me', loggedIn)
  const { state } = useAppState()
  const done = state.sessions.filter((s) => s.completed).length
  const days = streak(state)
  const [tab, setTab] = useState<'feed' | 'programy'>('programy')
  // Pusty feed nie dostaje własnego tabu — nowa osoba nie może wylądować w martwej apce.
  const hasFeed = (circle.data?.feed.length ?? 0) > 0

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <span className="brand-mark">LOTOS BALANCE</span>
          {loggedIn ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => signOut()}>
              Wyloguj
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/logowanie')}
            >
              Zaloguj
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="stack-lg">
          {hasFeed && (
            <div className="segmented" role="tablist" aria-label="Widok kręgu">
              {(['programy', 'feed'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={`segmented-btn${tab === t ? ' is-active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  <Icon name={t === 'feed' ? 'Activity' : 'Layers'} size={16} />
                  {t === 'feed' ? 'Aktywność' : 'Programy'}
                </button>
              ))}
            </div>
          )}

          {tab === 'feed' && hasFeed && (
            <ul className="entry-list">
              {circle.data!.feed.map((row, i) => (
                <FeedEntry key={`${row.creatorSlug}-${row.cardId}-${row.date}-${i}`} row={row} />
              ))}
            </ul>
          )}

          {(tab === 'programy' || !hasFeed) &&
            (circle.data?.creators ?? []).map((c) => <CreatorCard key={c.slug} creator={c} />)}

          {done > 0 && (
            <section className="surface stack-sm">
              <p className="eyebrow">
                {me.data?.user.name ? `Twoje postępy, ${me.data.user.name}` : 'Twoje postępy'}
              </p>
              <div className="row wrap">
                <span className="pill">
                  <Icon name="Check" size={13} />
                  {done} {plural(done, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}
                </span>
                {days > 0 && (
                  <span className="pill">
                    <Icon name="Flame" size={13} />
                    {days} {plural(days, 'dzień', 'dni', 'dni')} z rzędu
                  </span>
                )}
              </div>
            </section>
          )}

          <InstallButton />
        </div>
      </main>
    </div>
  )
}
