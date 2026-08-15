// src/screens/DeckScreen.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivationCardView } from '../components/ActivationCard'
import { CardDetail } from '../components/CardDetail'
import { CardTile } from '../components/CardTile'
import { Icon } from '../components/Icon'
import { PlanSheet } from '../components/PlanSheet'
import { ProbeCard } from '../components/ProbeCard'
import { SwipeCard } from '../components/SwipeCard'
import { AREAS, AREA_IDS } from '../data/areas'
import { CARDS } from '../data/cards'
import { TIME_OPTIONS } from '../data/goals'
import { useAppState } from '../hooks/useAppState'
import type { ActivationCard, AreaId, Minutes, Scale5, SwipeDirection } from '../types'
import { knownAreas, latestSnapshot, unknownAreas } from '../utils/balance'
import type { TabId } from '../components/BottomNav'

interface Props {
  onPlay: (card: ActivationCard, source: 'dzisiaj' | 'talia' | 'kalendarz', entryId?: string) => void
  onNavigate: (tab: TabId) => void
}

type Mode = 'stos' | 'biblioteka'
type QueueItem = { kind: 'karta'; card: ActivationCard } | { kind: 'sonda'; area: AreaId }

/** Prosta normalizacja polskich znaków, żeby wyszukiwanie działało bez ogonków. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
}

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
  const [mode, setMode] = useState<Mode>('stos')
  const [index, setIndex] = useState(0)
  const [area, setArea] = useState<AreaId | 'wszystkie'>('wszystkie')
  const [minutes, setMinutes] = useState<Minutes | 'dowolny'>('dowolny')
  const [query, setQuery] = useState('')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [detail, setDetail] = useState<ActivationCard | null>(null)
  const [planTarget, setPlanTarget] = useState<ActivationCard | null>(null)

  const snapshot = latestSnapshot(state.snapshots)
  const levels = snapshot?.levels ?? {}
  const known = knownAreas(levels).length

  // Plan sond ustalamy raz na wejściu, żeby stos nie przeskakiwał po odpowiedzi.
  const [probePlan] = useState<AreaId[]>(() => unknownAreas(levels))

  const queue = useMemo<QueueItem[]>(() => {
    const ordered = interleaveByArea(CARDS)
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
  }, [probePlan])

  const current = queue[index % queue.length]
  const advance = useCallback(() => setIndex((i) => i + 1), [])

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (current.kind === 'karta') recordSwipe(current.card.id, current.card.area, direction)
      advance()
    },
    [current, recordSwipe, advance],
  )

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return CARDS.filter((card) => {
      if (area !== 'wszystkie' && card.area !== area && card.secondaryArea !== area) return false
      if (minutes !== 'dowolny' && card.minutes !== minutes) return false
      if (onlyFavorites && !state.favorites.includes(card.id)) return false
      if (q && !normalize(card.title).includes(q) && !normalize(card.description).includes(q)) {
        return false
      }
      return true
    })
  }, [area, minutes, query, onlyFavorites, state.favorites])

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
      <h1 className="sr-only">Talia aktywacji</h1>

      <div className="segmented" role="tablist" aria-label="Widok talii">
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
            {m === 'stos' ? 'Stos kart' : 'Biblioteka'}
          </button>
        ))}
      </div>

      {mode === 'stos' && (
        <section className="deck-flow">
          <div
            className="map-progress surface-quiet row-between"
            role="img"
            aria-label={`Mapa Balansu: poznane ${known} z ${AREAS.length} obszarów`}
          >
            <span className="eyebrow">Twoja mapa</span>
            <span className="area-dots">
              {AREAS.map((a) => {
                const isKnown = levels[a.id] !== undefined
                return (
                  <span
                    key={a.id}
                    className={`area-dot${isKnown ? ' is-known' : ''}`}
                    style={isKnown ? { background: a.softColor, color: a.color } : undefined}
                    title={`${a.name}: ${isKnown ? 'poznany' : 'jeszcze nie'}`}
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
                  label={`${current.card.title}. Przeciągnij w prawo, aby zatrzymać, w lewo, aby odłożyć.`}
                >
                  <ActivationCardView
                    card={current.card}
                    isFavorite={state.favorites.includes(current.card.id)}
                    onToggleFavorite={() => toggleFavorite(current.card.id)}
                  />
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
                      advance()
                    }}
                    onSkip={advance}
                  />
                </SwipeCard>
              )}
            </div>
          </div>

          {current.kind === 'karta' ? (
            <>
              <div className="row deck-actions">
                <button
                  type="button"
                  className="btn btn-secondary grow"
                  onClick={() => handleSwipe('w-lewo')}
                >
                  <Icon name="ChevronLeft" size={16} />
                  Nie teraz
                </button>
                <button
                  type="button"
                  className="btn btn-secondary grow"
                  onClick={() => handleSwipe('w-prawo')}
                >
                  <Icon name="Star" size={16} />
                  To o mnie
                </button>
                <button
                  type="button"
                  className="btn btn-primary grow"
                  onClick={() => onPlay(current.card, 'talia')}
                >
                  <Icon name="Play" size={16} />
                  Wykonaj
                </button>
              </div>
            </>
          ) : (
            <p className="tiny center">Przeciągnij w bok, aby pominąć — pytanie wróci.</p>
          )}
        </section>
      )}

      {mode === 'biblioteka' && (
        <section className="stack">
          <div className="search-wrap">
            <Icon name="Search" size={17} />
            <input
              type="search"
              className="input"
              placeholder="Szukaj po tytule"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Szukaj karty po tytule"
            />
          </div>

          <div className="filter-scroll" aria-label="Filtruj po obszarze">
            <button
              type="button"
              className="chip"
              aria-pressed={area === 'wszystkie'}
              onClick={() => setArea('wszystkie')}
            >
              Wszystkie
            </button>
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                className="chip"
                aria-pressed={area === a.id}
                onClick={() => setArea(a.id)}
              >
                <Icon name={a.icon} size={14} />
                {a.name}
              </button>
            ))}
          </div>

          <div className="row wrap">
            <button
              type="button"
              className="chip"
              aria-pressed={minutes === 'dowolny'}
              onClick={() => setMinutes('dowolny')}
            >
              Każdy czas
            </button>
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                className="chip"
                aria-pressed={minutes === t.value}
                onClick={() => setMinutes(t.value)}
              >
                <Icon name="Clock" size={14} />
                {t.value} min
              </button>
            ))}
            <button
              type="button"
              className="chip"
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites((v) => !v)}
            >
              <Icon name="Star" size={14} fill={onlyFavorites ? 'currentColor' : 'none'} />
              Moje
            </button>
          </div>

          <p className="tiny">
            {filtered.length === 0
              ? 'Brak kart dla tych filtrów.'
              : `${filtered.length} ${filtered.length === 1 ? 'karta' : 'kart'} do wyboru.`}
          </p>

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

      {detail && (
        <CardDetail
          card={detail}
          isFavorite={state.favorites.includes(detail.id)}
          onToggleFavorite={() => toggleFavorite(detail.id)}
          onStart={() => {
            const card = detail
            setDetail(null)
            onPlay(card, 'talia')
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
            planCard(date, planTarget.id)
            setPlanTarget(null)
            onNavigate('kalendarz')
          }}
        />
      )}
    </div>
  )
}
