// src/screens/CreatorScreen.tsx
// Widok twórczyni: co się dzieje w jej taliach. Liczby są zagregowane —
// twórczyni widzi swoją talię w działaniu, nigdy pojedynczych osób.
import { useCreatorPanel } from '../services/viewer'
import type { CreatorDeck } from '../services/viewer'
import { useDeck } from '../services/decks'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'

function DeckPanel({ deck }: { deck: CreatorDeck }) {
  // Tytuły ćwiczeń mieszkają w manifeście, statystyki w D1 — łączymy dopiero tutaj.
  const manifest = useDeck(deck.slug)
  const title = (cardId: string) =>
    manifest.data?.cards.find((c) => c.id === cardId)?.title ?? cardId

  return (
    <section className="stack">
      <div className="row-between">
        <div>
          <p className="eyebrow">Talia</p>
          <h2 className="h1">{manifest.data?.title ?? deck.name}</h2>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/${deck.slug}`)}
        >
          Zobacz jak użytkowniczka
          <Icon name="ChevronRight" size={15} />
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-value">{deck.dzis}</span>
          <span className="tiny">ukończeń dziś</span>
        </div>
        <div className="stat">
          <span className="stat-value">{deck.ukonczenia}</span>
          <span className="tiny">ukończeń łącznie</span>
        </div>
        <div className="stat">
          <span className="stat-value">{deck.osoby}</span>
          <span className="tiny">osób w talii</span>
        </div>
        <div className="stat">
          <span className="stat-value">{manifest.data?.cards.length ?? '—'}</span>
          <span className="tiny">kart w talii</span>
        </div>
      </div>

      {deck.top.length > 0 ? (
        <div className="surface stack-sm">
          <p className="eyebrow">Najczęściej wykonywane</p>
          <ul className="mini-list">
            {deck.top.map((row) => (
              <li key={row.cardId}>
                <span className="grow">{title(row.cardId)}</span>
                <span className="pill">{row.ile}×</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">
          Nikt jeszcze nie ukończył ćwiczenia z tej talii — albo nikt nie był zalogowany.
        </p>
      )}
    </section>
  )
}

export function CreatorScreen() {
  const panel = useCreatorPanel()

  return (
    <div className="stack-lg">
      <section className="stack-sm">
        <p className="eyebrow">Widok twórczyni</p>
        <h1 className="display">Twoje talie</h1>
        <p className="muted">
          Liczby są zbiorcze i anonimowe: bez imion, bez ocen samopoczucia, bez pojedynczych osób.
        </p>
      </section>

      {panel.isPending && <p className="muted">Chwila — liczymy…</p>}
      {panel.isError && <p className="muted">Nie udało się wczytać panelu. Odśwież stronę.</p>}
      {panel.data?.decks.length === 0 && (
        <p className="muted">
          Twoje konto nie ma jeszcze przypisanej talii. Napisz do nas, podepniemy ją do profilu.
        </p>
      )}

      {(panel.data?.decks ?? []).map((deck) => (
        <DeckPanel key={deck.slug} deck={deck} />
      ))}

    </div>
  )
}
