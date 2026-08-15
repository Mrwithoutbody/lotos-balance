// src/screens/CircleScreen.tsx
// Krąg na "/": twórczynie i Twoja praca na ich taliach. Bez atrap — pokazujemy
// tylko to, co naprawdę wiemy (dziś: talie z R2 + Twoje aktywacje z localStorage).
import { useQuery } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import { useAppState } from '../hooks/useAppState'
import { navigate } from '../lib/router'
import { streak } from '../services/insights'
import { deckAssetUrl, useDeck } from '../services/decks'

interface CreatorRow {
  slug: string
  name: string
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
    staleTime: 5 * 60 * 1000,
  })
}

function CreatorCard({ creator }: { creator: CreatorRow }) {
  const deck = useDeck(creator.slug)
  const cover = deck.data?.creator.cover
    ? deckAssetUrl(creator.slug, deck.data.creator.cover)
    : undefined

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
        </p>
        <button type="button" className="btn btn-glass" onClick={() => navigate(`/${creator.slug}`)}>
          <Icon name="Layers" size={16} />
          Wejdź do talii
        </button>
      </div>
    </article>
  )
}

export function CircleScreen() {
  const creators = useCreators()
  const { state } = useAppState()
  const done = state.sessions.filter((s) => s.completed).length
  const days = streak(state)

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <span className="brand-row">
            <span className="brand-mark">LOTOS BALANCE</span>
            <span className="brand-sub">krąg</span>
          </span>
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

          {done > 0 && (
            <section className="surface stack-sm">
              <p className="eyebrow">Twoja praca</p>
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

          {(creators.data ?? KNOWN_CREATORS).map((c) => (
            <CreatorCard key={c.slug} creator={c} />
          ))}

          <p className="tiny center">
            Znajomi i wspólny balans pojawią się tu po zalogowaniu — budujemy to po kolei.
          </p>
        </div>
      </main>
    </div>
  )
}
