// src/screens/CircleScreen.tsx
// Krąg na "/": feed wspólnej pracy + programy twórczyń, w tabach.
// Bez atrap — liczby przychodzą z D1, a sekcje bez danych po prostu się nie renderują.
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import { useAppState } from '../hooks/useAppState'
import { signOut, useSession } from '../lib/auth-client'
import { navigate } from '../lib/router'
import { streak } from '../services/insights'
import { deckAssetUrl, useDeck } from '../services/decks'
import { shortDate } from '../utils/date'

interface CreatorRow {
  slug: string
  name: string
  followers?: number
}

interface Me {
  user: { name: string; email: string }
  follows: string[]
}

interface FeedRow {
  creatorSlug: string
  creatorName: string
  cardId: string
  date: string
}

/** Dev (vite) nie ma Pages Functions, a krąg musi żyć — stąd fallback. */
const KNOWN_CREATORS: CreatorRow[] = [{ slug: 'anna-rysnik', name: 'Anna Ryśnik' }]

/** Polska liczba mnoga: plural(3, 'osoba', 'osoby', 'osób'). */
const plural = (n: number, one: string, few: string, many: string) =>
  n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many

function useCreators() {
  return useQuery<CreatorRow[]>({
    queryKey: ['creators'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/creators')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const rows: CreatorRow[] = await res.json()
        return rows.length > 0 ? rows : KNOWN_CREATORS
      } catch {
        return KNOWN_CREATORS
      }
    },
    staleTime: 60 * 1000,
  })
}

function useFeed() {
  return useQuery<FeedRow[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/feed')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    staleTime: 60 * 1000,
  })
}

/** Wiersz feedu — tytuł karty dociągamy z manifestu talii (react-query deduplikuje). */
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

function useMe(loggedIn: boolean) {
  return useQuery<Me | null>({
    queryKey: ['me'],
    enabled: loggedIn,
    queryFn: async () => {
      const res = await fetch('/api/me')
      if (!res.ok) return null
      return res.json()
    },
  })
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
  const creators = useCreators()
  const me = useMe(loggedIn)
  const feed = useFeed()
  const { state } = useAppState()
  const done = state.sessions.filter((s) => s.completed).length
  const days = streak(state)
  const [tab, setTab] = useState<'feed' | 'programy'>('programy')
  // Pusty feed nie dostaje własnego tabu — nowa osoba nie może wylądować w martwej apce.
  const hasFeed = (feed.data?.length ?? 0) > 0

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <span className="brand-row">
            <span className="brand-mark">LOTOS BALANCE</span>
            <span className="brand-sub">krąg</span>
          </span>
          {/* Logowanie schowane do weryfikacji domeny w Resend — realna osoba dostałaby błąd. */}
          {loggedIn && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => signOut()}>
              Wyloguj
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="stack-lg">
          <section className="stack-sm">
            <p className="muted">
              Twórczynie i ich programy. Wybierz jeden i pracuj na nim.
            </p>
          </section>

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
              {feed.data!.map((row, i) => (
                <FeedEntry key={`${row.creatorSlug}-${row.cardId}-${row.date}-${i}`} row={row} />
              ))}
            </ul>
          )}

          {(tab === 'programy' || !hasFeed) &&
            (creators.data ?? KNOWN_CREATORS).map((c) => <CreatorCard key={c.slug} creator={c} />)}

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
                    {days} {days === 1 ? 'dzień' : 'dni'} z rzędu
                  </span>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
