// src/components/DayStrip.tsx
// Kalendarz jako pasek siedmiu dni. Pod każdym dniem kropki w kolorach obszarów —
// to karty, które talia rozłożyła na ten dzień. Widać rozkład, zanim się tam dojdzie.
import { AREA_BY_ID } from '../data/areas'
import type { DaySlot } from '../services/day'
import { shortDate, weekdayShort } from '../utils/date'

interface Props {
  days: string[]
  selected: string
  /** Rozdanie na każdy dzień — klucz to data. */
  dealByDay: Record<string, DaySlot[]>
  /** Dni, w których coś już wykonano. */
  doneDays: Set<string>
  onSelect: (date: string) => void
}

export function DayStrip({ days, selected, dealByDay, doneDays, onSelect }: Props) {
  return (
    <div className="day-strip" role="group" aria-label="Rozkład talii — najbliższe siedem dni">
      {days.map((day) => {
        const deal = dealByDay[day] ?? []
        return (
          <button
            key={day}
            type="button"
            className={`day-chip${day === selected ? ' is-selected' : ''}${doneDays.has(day) ? ' is-done' : ''}`}
            aria-pressed={day === selected}
            aria-label={`${weekdayShort(day)} ${shortDate(day)}, kart na ten dzień: ${deal.length}`}
            onClick={() => onSelect(day)}
          >
            <span className="day-chip-name">{weekdayShort(day)}</span>
            <span className="day-chip-date">{shortDate(day)}</span>
            <span className="day-chip-dots">
              {deal.map(({ card }) => (
                <span
                  key={card.id}
                  className="deal-dot"
                  style={{ background: AREA_BY_ID[card.area].color }}
                />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
