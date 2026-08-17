// src/screens/DeckScreen.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivationCardView } from '../components/ActivationCard'
import { AreaChips } from '../components/AreaChips'
import { CardDetail } from '../components/CardDetail'
import { CardTile } from '../components/CardTile'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { PlanSheet } from '../components/PlanSheet'
import { ProbeCard } from '../components/ProbeCard'
import { SwipeCard } from '../components/SwipeCard'
import { AREAS, AREA_IDS } from '../data/areas'
import { TIME_OPTIONS } from '../data/goals'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import type { ActivationCard, AreaId, Minutes, Scale5, SwipeDirection } from '../types'
import { knownAreas, latestSnapshot, unknownAreas } from '../utils/balance'
import { plural } from '../utils/plural'
import { filterCards } from '../utils/search'
import type { TabId } from '../components/BottomNav'

interface Props {
  onPlay: (card: ActivationCard, entryId?: string) => void
  onNavigate: (tab: TabId) => void
}

type Mode = 'stos' | 'biblioteka'
type QueueItem = { kind: 'karta'; card: ActivationCard } | { kind: 'sonda'; area: AreaId }

/** Karty poprzeplatane obszarami, żeby stos nie zaczynał się od czterech kart z rzędu. */
function interleaveByArea(cards: ActivationCard[]): ActivationCard[] {
  const buckets = AREA_IDS.map((id) => cards.filter((c) => c.area === id))
  const result: ActivationCard[] = []
  let round = 0
  while (result.length < cards.length) {
    for (const bucket of buckets) {
      const card = bucket[round]
      if (card) result.push(card)
    }
    round += 1
  }
  return result
}

export function DeckScreen({ onPlay, onNavigate }: Props) {
  const { state, toggleFavorite, planCard, recordSwipe, setAreaAnswer } = useAppState()
  const program = useProgram()
  const [mode, setMode] = useState<Mode>('stos')
  const [index, setIndex] = useState(0)
  const [area, setArea] = useState<AreaId | 'wszystkie'>('wszystkie')
  const [minutes, setMinutes] = useState<Minutes | 'dowolny'>('dowolny')
  const [query, setQuery] = useState('')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  /** Obszar zapalony ostatnią odpowiedzią — trzyma animację kropki przez chwilę po swipie. */
  const [justLit, setJustLit] = useState<AreaId | null>(null)
  const [detail, setDetail] = useState<ActivationCard | null>(null)
  const [planTarget, setPlanTarget] = useState<ActivationCard | null>(null)

  const snapshot = latestSnapshot(state.snapshots)
  const levels = snapshot?.levels ?? {}
  const known = knownAreas(levels).length

  // Plan sond ustalamy raz na wejściu, żeby stos nie przeskakiwał po odpowiedzi.
  const [probePlan] = useState<AreaId[]>(() => unknownAreas(levels))

  const queue = useMemo<QueueItem[]>(() => {
    const ordered = interleaveByArea(program.cards)
    const items: QueueItem[] = []
    let probe = 0
    ordered.forEach((card, i) => {
      items.push({ kind: 'karta', card })
      if ((i + 1) % 3 === 0 && probe < probePlan.length) {
        items.push({ kind: 'sonda', area: probePlan[probe] })
        probe += 1
      }
    })
    while (probe < probePlan.length) {
      items.push({ kind: 'sonda', area: probePlan[probe] })
      probe += 1
    }
    return items
  }, [probePlan, program.cards])

  const current = queue[index % queue.length]
  const advance = useCallback(() => setIndex((i) => i + 1), [])

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (current.kind === 'karta') recordSwipe(current.card.id, current.card.area, direction)
      advance()
    },
    [current, recordSwipe, advance],
  )

  const filtered = useMemo(
    () =>
      filterCards(program.cards, {
        query,
        area,
        minutes,
        favorites: onlyFavorites ? state.favorites : undefined,
      }),
    [program.cards, area, minutes, query, onlyFavorites, state.favorites],
  )

  useEffect(() => {
    if (mode !== 'stos' || detail || planTarget) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
      if (e.key === 'ArrowLeft') handleSwipe('w-lewo')
      if (e.key === 'ArrowRight') handleSwipe('w-prawo')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, detail, planTarget, handleSwipe])

  return (
    <div className={mode === 'stos' ? 'deck-screen' : 'stack-lg'}>
      <h1 className="sr-only">Program ćwiczeń</h1>

      <div className="segmented" role="tablist" aria-label="Widok programu">
        {(['stos', 'biblioteka'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`segmented-btn${mode === m ? ' is-active' : ''}`}
            onClick={() => setMode(m)}
          >
            <Icon name={m === 'stos' ? 'Layers' : 'Search'} size={16} />
            {/* Obie zakładki mają ćwiczenia — nazwa musi mówić o sposobie podania. */}
            {m === 'stos' ? 'Po jednym' : 'Wszystkie'}
          </button>
        ))}
      </div>

      {mode === 'stos' && (
        <section className="deck-flow">
          <div
            className="map-progress surface-quiet row-between"
            role="img"
            aria-label={`Mapa Balansu: odkryte ${known} z ${AREAS.length} obszarów`}
          >
            <span className="eyebrow">Odkryte</span>
            <span className="area-dots">
              {AREAS.map((a) => {
                const isKnown = levels[a.id] !== undefined
                return (
                  <span
                    key={a.id}
                    className={`area-dot${isKnown ? ' is-known' : ''}${justLit === a.id ? ' is-lit' : ''}`}
                    onAnimationEnd={() => justLit === a.id && setJustLit(null)}
                    style={isKnown ? { background: a.softColor, color: a.color } : undefined}
                    title={`${a.name}: ${isKnown ? 'odkryty' : 'jeszcze nie'}`}
                  >
                    <Icon name={a.icon} size={14} />
                  </span>
                )
              })}
            </span>
          </div>

          <div className="deck-stage">
            <span className="deck-ghost deck-ghost-2" aria-hidden="true" />
            <span className="deck-ghost deck-ghost-1" aria-hidden="true" />
            <div className="deck-live" key={`${index}-${current.kind}`}>
              {current.kind === 'karta' ? (
                <SwipeCard
                  onSwipe={handleSwipe}
                  label={`${current.card.title}. Przeciągnij w prawo — do ulubionych, w lewo — pomiń.`}
                >
                  {/* Bez gwiazdki na karcie — ulubione robi gest w prawo albo ikona pod kartą. */}
                  <ActivationCardView card={current.card} onInfo={() => setDetail(current.card)} />
                </SwipeCard>
              ) : (
                <SwipeCard
                  onSwipe={() => advance()}
                  label="Pytanie o Twój balans. Przeciągnij w bok, aby pominąć."
                >
                  <ProbeCard
                    area={current.area}
                    onAnswer={(value: Scale5) => {
                      setAreaAnswer(current.area, value)
                      setJustLit(current.area)
                      advance()
                    }}
                    onSkip={advance}
                  />
                </SwipeCard>
              )}
            </div>
          </div>

          {current.kind === 'karta' ? (
            /* Pomiń i ulubione robi gest (oraz strzałki ←/→) — ikony są tylko dla myszy. */
            <div className="row deck-actions">
              <button
                type="button"
                className="icon-btn"
                onClick={() => handleSwipe('w-lewo')}
                aria-label="Pomiń to ćwiczenie"
                title="Pomiń"
              >
                <Icon name="ChevronLeft" size={18} />
              </button>
              <button
                type="button"
                className="btn btn-primary grow"
                onClick={() => onPlay(current.card)}
              >
                <Icon name="Play" size={16} />
                Wykonaj
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => handleSwipe('w-prawo')}
                aria-label="Dodaj do ulubionych"
                title="Do ulubionych"
              >
                <Icon name="Star" size={18} />
              </button>
            </div>
          ) : (
            <p className="tiny center">Przeciągnij w bok, aby pominąć — pytanie wróci.</p>
          )}
        </section>
      )}

      {mode === 'biblioteka' && (
        <section className="stack">
          <div className="row">
            <div className="search-wrap grow">
              <Icon name="Search" size={17} />
              <input
                type="search"
                className="input"
                placeholder={`Szukaj wśród ${program.cards.length} ćwiczeń`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Szukaj ćwiczenia po tytule"
              />
            </div>
            <button
              type="button"
              className="chip chip-icon chip-ghost"
              aria-pressed={onlyFavorites}
              aria-label="Tylko ulubione"
              title="Ulubione"
              onClick={() => setOnlyFavorites((v) => !v)}
            >
              <Icon name="Star" size={17} fill={onlyFavorites ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              className="chip chip-icon chip-ghost"
              aria-pressed={area !== 'wszystkie' || minutes !== 'dowolny'}
              aria-label="Filtry ćwiczeń"
              title="Filtry"
              onClick={() => setFiltersOpen(true)}
            >
              <Icon name="SlidersHorizontal" size={17} />
            </button>
          </div>

          {filtered.length === 0 && <p className="tiny">Brak ćwiczeń dla tych filtrów.</p>}

          <div className="tile-grid">
            {filtered.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                isFavorite={state.favorites.includes(card.id)}
                onToggleFavorite={() => toggleFavorite(card.id)}
                onOpen={() => setDetail(card)}
              />
            ))}
          </div>
        </section>
      )}

      {filtersOpen && (
        <Modal
          title="Filtry"
          onClose={() => setFiltersOpen(false)}
          footer={
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setFiltersOpen(false)}
            >
              Pokaż {filtered.length}{' '}
              {plural(filtered.length, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}
            </button>
          }
        >
          <div className="stack">
            <div className="stack-sm">
              <span className="h3">Obszar</span>
              <AreaChips value={area} onChange={setArea} />
            </div>

            <div className="stack-sm">
              <span className="h3">Czas</span>
              <div className="row wrap">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className="chip"
                    aria-pressed={minutes === t.value}
                    onClick={() => setMinutes((v) => (v === t.value ? 'dowolny' : t.value))}
                  >
                    <Icon name="Clock" size={14} />
                    {t.value} min
                  </button>
                ))}
              </div>
            </div>

            {(area !== 'wszystkie' || minutes !== 'dowolny') && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setArea('wszystkie')
                  setMinutes('dowolny')
                }}
              >
                <Icon name="X" size={16} />
                Wyczyść filtry
              </button>
            )}
          </div>
        </Modal>
      )}

      {detail && (
        <CardDetail
          card={detail}
          isFavorite={state.favorites.includes(detail.id)}
          onToggleFavorite={() => toggleFavorite(detail.id)}
          onStart={() => {
            const card = detail
            setDetail(null)
            onPlay(card)
          }}
          onPlan={() => {
            setPlanTarget(detail)
            setDetail(null)
          }}
          onClose={() => setDetail(null)}
        />
      )}

      {planTarget && (
        <PlanSheet
          card={planTarget}
          onClose={() => setPlanTarget(null)}
          onPlan={(date) => {
            planCard(date, planTarget.id, program.slug)
            setPlanTarget(null)
            onNavigate('kalendarz')
          }}
        />
      )}
    </div>
  )
}
