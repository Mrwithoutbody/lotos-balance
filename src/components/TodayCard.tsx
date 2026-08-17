// src/components/TodayCard.tsx
// Miniatura karty dnia: grafika obszaru po lewej, treść po prawej.
// Koloryzacja grafiki ta sama co na pełnej karcie w talii.
import type { CSSProperties } from 'react'
import { AREA_BY_ID } from '../data/areas'
import { useProgram } from '../hooks/useProgram'
import type { DaySlot } from '../services/day'
import { dayPartLabel, minutesLabel } from '../utils/format'
import { Icon } from './Icon'
import { Pill } from './Pill'

interface Props {
  slot: DaySlot
  /** Przejście do kart talii — ćwiczenie startuje się dopiero tam. */
  onOpen: () => void
}

export function TodayCard({ slot, onOpen }: Props) {
  const { card, part } = slot
  const area = AREA_BY_ID[card.area]
  const art = useProgram().art[card.area]

  return (
    <article
      className="today-card area-surface"
      style={{ '--area': area.color, '--area-soft': area.softColor } as CSSProperties}
    >
      <button
        type="button"
        className="today-card-art"
        onClick={onOpen}
        aria-label={`Zobacz „${card.title}” w kartach`}
      >
        {art && <span className="card-art" style={{ backgroundImage: `url(${art})` }} />}
        <span className="today-card-emblem" style={{ background: area.color }}>
          <Icon name={card.icon} size={22} strokeWidth={1.6} color="var(--paper)" />
        </span>
      </button>

      <div className="today-card-body">
        <button type="button" className="today-card-head" onClick={onOpen}>
          <span className="row wrap">
            <Pill icon={area.icon} color={area.color}>
              {area.name}
            </Pill>
            <Pill icon="Clock">{minutesLabel(card.minutes)}</Pill>
            {part && <Pill icon="Sun">{dayPartLabel(part)}</Pill>}
          </span>
          <span className="today-card-title">{card.title}</span>
          <span className="today-card-desc">{card.description}</span>
        </button>

        {/* Start jest w kartach — tu tylko przejście, żeby nie mieć dwóch „Zacznij”. */}
        <button type="button" className="btn btn-secondary btn-sm today-card-start" onClick={onOpen}>
          Otwórz w kartach
          <Icon name="ChevronRight" size={15} />
        </button>
      </div>
    </article>
  )
}
