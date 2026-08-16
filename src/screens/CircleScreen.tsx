// src/screens/CircleScreen.tsx
// Krąg na "/": feed wspólnej pracy + programy twórczyń, w tabach.
// Bez atrap — liczby przychodzą z D1, a sekcje bez danych po prostu się nie renderują.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  const title = deck.data?.cards.find((c) => c.id === row.cardId)?.title ?? 'aktywacja'
  return (
    <li className="entry-row">
      <div className="entry-row-block">
        <p className="entry-title">Ktoś ukończył „{title}”</p>
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

function CreatorCard({
  creator,
  isFollowing,
  loggedIn,
}: {
  creator: CreatorRow
  isFollowing: boolean
  loggedIn: boolean
}) {
  const deck = useDeck(creator.slug)
  const queryClient = useQueryClient()
  const follow = useMutation({
    mutationFn: (join: boolean) =>
      fetch('/api/follow', {
        method: join ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: creator.slug }),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
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
        <p className="eyebrow" style={{ color: 'inherit' }}>
          {creator.name}
        </p>
        <h2 className="brain-title">{deck.data?.title ?? creator.name}</h2>
        {deck.data?.creator.bio && <p className="brain-hint">{deck.data.creator.bio}</p>}
        <p className="brain-hint">
          {deck.data ? `${deck.data.cards.length} kart · 3–15 min` : 'Wczytywanie talii…'}
          {followers > 0 &&
            ` · ${followers} ${followers === 1 ? 'osoba' : followers < 5 ? 'osoby' : 'osób'} w kręgu`}
        </p>
        <div className="row wrap">
          <button
            type="button"
            className="btn btn-glass"
            onClick={() => navigate(`/${creator.slug}`)}
          >
            <Icon name="Layers" size={16} />
            Wejdź do talii
          </button>
          {loggedIn && (
            <button
              type="button"
              className={isFollowing ? 'btn btn-glass-done' : 'btn btn-glass'}
              disabled={follow.isPending}
              onClick={() => follow.mutate(!isFollowing)}
            >
              <Icon name={isFollowing ? 'Check' : 'UserPlus'} size={16} />
              {isFollowing ? 'Jesteś w kręgu' : 'Dołącz do kręgu'}
            </button>
          )}
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
  const [tab, setTab] = useState<'feed' | 'programy'>('feed')

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <span className="brand-row">
            <span className="brand-mark">LOTOS BALANCE</span>
            <span className="brand-sub">krąg</span>
          </span>
          {loggedIn ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => signOut()}>
              Wyloguj
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/logowanie')}
            >
              Zaloguj się
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="stack-lg">
          <section className="stack-sm">
            <h1 className="display">
              Krąg<em>.</em>
            </h1>
            <p className="muted">
              Twórczynie i ich talie krótkich ćwiczeń. Wybierz talię i pracuj na niej — 3, 7 albo
              15 minut dziennie.
            </p>
          </section>

          {(done > 0 || loggedIn) && (
            <section className="surface stack-sm">
              <p className="eyebrow">
                {me.data?.user.name ? `Twoja praca, ${me.data.user.name}` : 'Twoja praca'}
              </p>
              <div className="row wrap">
                <span className="pill">
                  <Icon name="Check" size={13} />
                  {done} {done === 1 ? 'aktywacja' : 'aktywacji'}
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

          <div className="segmented" role="tablist" aria-label="Widok kręgu">
            {(['feed', 'programy'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={`segmented-btn${tab === t ? ' is-active' : ''}`}
                onClick={() => setTab(t)}
              >
                <Icon name={t === 'feed' ? 'Activity' : 'Layers'} size={16} />
                {t === 'feed' ? 'Feed' : 'Programy'}
              </button>
            ))}
          </div>

          {tab === 'feed' &&
            ((feed.data?.length ?? 0) > 0 ? (
              <ul className="entry-list">
                {feed.data!.map((row, i) => (
                  <FeedEntry key={`${row.creatorSlug}-${row.cardId}-${row.date}-${i}`} row={row} />
                ))}
              </ul>
            ) : (
              <p className="muted center">
                {feed.isPending
                  ? 'Wczytywanie…'
                  : 'Jeszcze cicho. Pierwsza ukończona aktywacja pojawi się tutaj.'}
              </p>
            ))}

          {tab === 'programy' && (
            <>
              {(creators.data ?? KNOWN_CREATORS).map((c) => (
                <CreatorCard
                  key={c.slug}
                  creator={c}
                  loggedIn={loggedIn}
                  isFollowing={me.data?.follows.includes(c.slug) ?? false}
                />
              ))}

              {!loggedIn && (
                <p className="tiny center">
                  Zaloguj się, aby dołączyć do kręgu twórczyni — Twoja praca zacznie się liczyć
                  razem z innymi.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
