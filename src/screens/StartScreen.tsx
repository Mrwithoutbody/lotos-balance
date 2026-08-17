// src/screens/StartScreen.tsx
// Trasa "/": lista talii. Jedna talia = jedna twórczyni = jeden folder w R2.
import { AppBar } from '../components/AppBar'
import { ProfileSwitch } from '../components/ProfileSwitch'
import { Icon } from '../components/Icon'
import { InstallButton } from '../components/InstallButton'
import { navigate } from '../lib/router'
import { deckAssetUrl, useCreators, useDeck } from '../services/decks'
import type { Creator } from '../services/decks'
import { useViewer } from '../services/viewer'
import { exercisesLabel } from '../utils/format'

/** Kafel talii — okładka, opis i liczba ćwiczeń lecą z manifestu w R2. */
function DeckTile({ creator }: { creator: Creator }) {
  const deck = useDeck(creator.slug)
  const cover = deck.data?.creator.cover
    ? deckAssetUrl(creator.slug, deck.data.creator.cover)
    : undefined
  const count = deck.data?.cards.length ?? 0

  return (
    <button
      type="button"
      className="deck-tile"
      style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      onClick={() => navigate(`/${creator.slug}`)}
    >
      <span className="deck-tile-scrim">
        <span className="deck-tile-name">{deck.data?.title ?? 'Talia'}</span>
        <span className="deck-tile-meta">
          {creator.name}
          {count > 0 && ` · ${exercisesLabel(count)}`}
        </span>
        {deck.data?.creator.bio && <span className="deck-tile-bio">{deck.data.creator.bio}</span>}
        <span className="deck-tile-cta">
          <Icon name="ChevronRight" size={16} />
          Otwórz talię
        </span>
      </span>
    </button>
  )
}

export function StartScreen() {
  const creators = useCreators()
  const role = useViewer().data?.role ?? 'user'

  return (
    <div className="app">
      <AppBar>
        <ProfileSwitch role={role} />
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/profil')}
          aria-label="Profil"
        >
          <Icon name="UserRound" size={18} />
        </button>
      </AppBar>

      <main className="app-main">
        <div className="stack-lg">
          <section className="stack-sm">
            <h1 className="display">Talie ćwiczeń</h1>
            <p className="muted">
              Krótkie ćwiczenia na spokój, sen, skupienie i kontakt z ciałem — po 3, 7 albo 15 minut.
            </p>
          </section>

          {creators.isPending && <p className="muted">Chwila — talie się wczytują…</p>}
          {creators.isError && <p className="muted">Nie udało się wczytać talii. Odśwież stronę.</p>}
          {creators.data?.length === 0 && <p className="muted">Nie ma jeszcze żadnej talii.</p>}

          <div className="stack">
            {(creators.data ?? []).map((c) => (
              <DeckTile key={c.slug} creator={c} />
            ))}
          </div>

          <InstallButton />
        </div>
      </main>
    </div>
  )
}
