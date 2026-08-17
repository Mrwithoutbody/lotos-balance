// src/screens/CardsScreen.tsx
// Karty dnia. Pasek dni na górze, pod nim jedna karta: zaczynasz ją albo
// odkładasz gestem. Gdy karty dnia się skończą, dzień jest zamknięty.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivationCardView } from '../components/ActivationCard'
import { CardInfo } from '../components/CardInfo'
import { DayStrip } from '../components/DayStrip'
import { Icon } from '../components/Icon'
import { SwipeCard } from '../components/SwipeCard'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import { CARDS_PER_DAY, dayCards, dayDeal, dayNumber } from '../services/day'
import type { DaySlot } from '../services/day'
import type { ActivationCard, SwipeDirection } from '../types'
import { addDays, dateKey, partOfDay, weekdayShort } from '../utils/date'
import { dayPartLabel } from '../utils/format'

interface Props {
  onPlay: (card: ActivationCard, entryId?: string) => void
}

export function CardsScreen({ onPlay }: Props) {
  const { state, recordSwipe, planCard, removeEntry } = useAppState()
  const program = useProgram()
  const today = dateKey()

  const [selected, setSelected] = useState(today)
  /** Podgląd całej talii — wyjście awaryjne, gdy karty dnia się skończą. */
  const [browseAll, setBrowseAll] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  // Wejście na ekran ustawia kartę na bieżącą porę; dalej decyduje gest.
  const [index, setIndex] = useState(() => startIndex(dayCards(state, program.cards, today)))

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today])

  const dealByDay = useMemo(
    () => Object.fromEntries(days.map((d) => [d, dayDeal(state, program.cards, d)])),
    [days, state, program.cards],
  )
  const doneDays = useMemo(
    () => new Set(state.sessions.filter((s) => s.completed).map((s) => s.date)),
    [state.sessions],
  )

  const queue: DaySlot[] = useMemo(
    () =>
      browseAll
        ? program.cards.map((card) => ({ card }))
        : dayCards(state, program.cards, selected),
    [browseAll, state, program.cards, selected],
  )

  const count = queue.length
  const slot = count > 0 ? queue[((index % count) + count) % count] : undefined
  const current = slot?.card
  const entry = current
    ? state.calendar.find((e) => e.date === selected && e.cardId === current.id && !e.done)
    : undefined

  const move = useCallback(
    (direction: SwipeDirection) => {
      if (!current) return
      // W trybie „cała talia” gest tylko przewija; w kartach dnia odkłada kartę.
      if (browseAll) setIndex((i) => i + (direction === 'w-lewo' ? 1 : -1))
      else recordSwipe(current.id, direction)
    },
    [browseAll, current, recordSwipe],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move('w-lewo')
      if (e.key === 'ArrowRight') move('w-prawo')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  function selectDay(date: string) {
    setSelected(date)
    setBrowseAll(false)
    setIndex(date === today ? startIndex(dayCards(state, program.cards, date)) : 0)
  }

  const dayLabel = selected === today ? 'dziś' : weekdayShort(selected)
  const doneOnDay = state.sessions.filter((s) => s.completed && s.date === selected).length

  return (
    <div className="deck-screen">
      <DayStrip
        days={days}
        selected={selected}
        dealByDay={dealByDay}
        doneDays={doneDays}
        onSelect={selectDay}
      />

      {!current || !slot ? (
        <section className="stack center" style={{ paddingTop: 'var(--sp-5)' }}>
          <div className="player-head">
            <Icon name="Moon" size={28} strokeWidth={1.6} />
          </div>
          <h2 className="h1">{doneOnDay > 0 ? 'Na dziś wystarczy.' : 'Dziś nic nie robimy.'}</h2>
          <p className="muted">
            {doneOnDay > 0
              ? 'Karty na ten dzień się skończyły. Kolejne czekają jutro.'
              : 'Karty na ten dzień odłożone. To też jest decyzja — jutro talia rozłoży kolejne.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => {
              setBrowseAll(true)
              setIndex(0)
            }}
          >
            <Icon name="Layers" size={16} />
            Przejrzyj całą talię
          </button>
        </section>
      ) : (
        <section className="deck-flow">
          <div className="row-between">
            <p className="eyebrow">
              {browseAll
                ? 'Cała talia'
                : entry
                  ? `Zaplanowane na ${dayLabel}`
                  : `Dzień ${dayNumber(state, selected)}${slot.part ? ` · ${dayPartLabel(slot.part)}` : ''}`}
            </p>
            <span className="tiny">
              {browseAll
                ? `${(((index % count) + count) % count) + 1} z ${count}`
                : `zostało ${count} z ${CARDS_PER_DAY}`}
            </span>
          </div>

          <div className="deck-stage">
            <span className="deck-ghost deck-ghost-2" aria-hidden="true" />
            <span className="deck-ghost deck-ghost-1" aria-hidden="true" />
            <div className="deck-live" key={current.id}>
              <SwipeCard
                onSwipe={move}
                label={`${current.title}. Przeciągnij w lewo, jeśli to nie dla Ciebie; w prawo, jeśli chcesz odłożyć na inny dzień.`}
              >
                <ActivationCardView card={current} onInfo={() => setInfoOpen(true)} />
              </SwipeCard>
            </div>
          </div>

          <div className="row deck-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => move('w-lewo')}
              aria-label={browseAll ? 'Następne ćwiczenie' : 'To nie dla mnie'}
              title={browseAll ? 'Następne' : 'Nie dla mnie'}
            >
              <Icon name={browseAll ? 'ChevronLeft' : 'X'} size={18} />
            </button>
            <button
              type="button"
              className="btn btn-primary grow"
              onClick={() => onPlay(current, entry?.id)}
            >
              <Icon name="Play" size={16} />
              Zacznij
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => move('w-prawo')}
              aria-label={browseAll ? 'Poprzednie ćwiczenie' : 'Fajne, ale nie teraz'}
              title={browseAll ? 'Poprzednie' : 'Nie teraz'}
            >
              <Icon name={browseAll ? 'ChevronRight' : 'Clock'} size={18} />
            </button>
          </div>

          {!browseAll && (
            <p className="tiny center">W lewo — to nie dla mnie. W prawo — fajne, ale nie teraz.</p>
          )}

          {entry ? (
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => removeEntry(entry.id)}
            >
              <Icon name="X" size={16} />
              Zdejmij z planu
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => planCard(selected, current.id)}
            >
              <Icon name="CalendarDays" size={16} />
              Zaplanuj na {dayLabel}
            </button>
          )}
        </section>
      )}

      {infoOpen && current && (
        <CardInfo
          card={current}
          onStart={() => {
            setInfoOpen(false)
            onPlay(current, entry?.id)
          }}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </div>
  )
}

/** Pierwsza karta pasująca do bieżącej pory dnia. */
function startIndex(slots: DaySlot[]): number {
  const at = slots.findIndex((s) => s.part === partOfDay())
  return at >= 0 ? at : 0
}
