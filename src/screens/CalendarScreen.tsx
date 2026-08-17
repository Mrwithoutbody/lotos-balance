// src/screens/CalendarScreen.tsx
import { useMemo, useState } from 'react'
import { CardPicker } from '../components/CardPicker'
import { ForeignEntry } from '../components/ForeignEntry'
import { Icon } from '../components/Icon'
import { PlanSheet } from '../components/PlanSheet'
import { AREA_BY_ID } from '../data/areas'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import type { ActivationCard, CalendarEntry } from '../types'
import {
  WEEKDAYS_SHORT,
  addDays,
  dateKey,
  longDate,
  monthGrid,
  monthLabel,
  parseKey,
  shortDate,
  weekdayShort,
} from '../utils/date'

interface Props {
  onPlay: (card: ActivationCard, entryId?: string) => void
}

export function CalendarScreen({ onPlay }: Props) {
  const { state, planCard, removeEntry, rescheduleEntry, setEntryDone } = useAppState()
  const program = useProgram()
  const today = dateKey()
  const [cursor, setCursor] = useState(() => {
    const d = parseKey(today)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selected, setSelected] = useState(today)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [moving, setMoving] = useState<CalendarEntry | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    for (const entry of state.calendar) {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    }
    return map
  }, [state.calendar])

  const cells = monthGrid(cursor.year, cursor.month)
  const selectedEntries = byDate.get(selected) ?? []
  const upcoming = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="stack-lg">
      <section className="surface stack">
        <div className="row-between">
          <button
            type="button"
            className="icon-btn"
            onClick={() => shiftMonth(-1)}
            aria-label="Poprzedni miesiąc"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>
          <h2 className="h2 cal-month">{monthLabel(cursor.year, cursor.month)}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => shiftMonth(1)}
            aria-label="Następny miesiąc"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>

        <div className="cal-weekdays" aria-hidden="true">
          {WEEKDAYS_SHORT.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((key, i) => {
            if (!key) return <span key={`empty-${i}`} className="cal-cell is-empty" />
            const entries = byDate.get(key) ?? []
            const planned = entries.some((e) => !e.done)
            const done = entries.some((e) => e.done)
            const classes = [
              'cal-cell',
              key === today ? 'is-today' : '',
              key === selected ? 'is-selected' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={key}
                type="button"
                className={classes}
                onClick={() => setSelected(key)}
                aria-label={`${longDate(key)}${entries.length ? `, zaplanowane: ${entries.length}` : ''}`}
                aria-pressed={key === selected}
              >
                <span>{Number(key.slice(-2))}</span>
                <span className="cal-dots">
                  {planned && <span className="cal-dot cal-dot-planned" />}
                  {done && <span className="cal-dot cal-dot-done" />}
                </span>
              </button>
            )
          })}
        </div>

        <div className="row wrap tiny">
          <span className="row">
            <span className="cal-dot cal-dot-planned" /> zaplanowane
          </span>
          <span className="row">
            <span className="cal-dot cal-dot-done" /> ukończone
          </span>
        </div>
      </section>

      <section className="surface stack">
        <div className="row-between">
          <div>
            <p className="eyebrow">Plan dnia</p>
            <h2 className="h2">{longDate(selected)}</h2>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPickerOpen(true)}>
            <Icon name="Layers" size={16} />
            Dodaj ćwiczenie
          </button>
        </div>

        {selectedEntries.length === 0 ? (
          <p className="muted">Brak zaplanowanych ćwiczeń na ten dzień.</p>
        ) : (
          <ul className="entry-list">
            {selectedEntries.map((entry) => {
              const card = program.byId[entry.cardId]
              if (!card) {
                return (
                  <ForeignEntry key={entry.id} entry={entry} onRemove={() => removeEntry(entry.id)} />
                )
              }
              const area = AREA_BY_ID[card.area]
              return (
                <li key={entry.id} className="entry-row entry-row-block">
                  <div className="row grow">
                    <span
                      className="balance-icon"
                      style={{ background: area.softColor, color: area.color }}
                    >
                      <Icon name={card.icon} size={15} />
                    </span>
                    <span className="grow">
                      <span className="entry-title">{card.title}</span>
                      <span className="tiny">
                        {area.name} · {card.minutes} min
                      </span>
                    </span>
                    {entry.done && (
                      <span className="pill pill-done">
                        <Icon name="Check" size={12} />
                        zrobione
                      </span>
                    )}
                  </div>
                  <div className="row wrap entry-actions">
                    {!entry.done && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onPlay(card, entry.id)}
                      >
                        <Icon name="Play" size={15} />
                        Zacznij
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEntryDone(entry.id, !entry.done)}
                    >
                      <Icon name={entry.done ? 'RefreshCcw' : 'Check'} size={15} />
                      {entry.done ? 'Cofnij' : 'Oznacz wykonane'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setMoving(entry)}
                    >
                      <Icon name="CalendarDays" size={15} />
                      Przełóż
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeEntry(entry.id)}
                      aria-label={`Usuń „${card.title}” (${longDate(entry.date)})`}
                    >
                      <Icon name="Trash2" size={15} />
                      Usuń
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="surface stack-sm">
        <p className="eyebrow">Najbliższe siedem dni</p>
        <ul className="week-list">
          {upcoming.map((key) => {
            const entries = byDate.get(key) ?? []
            return (
              <li key={key}>
                <button
                  type="button"
                  className={`week-row${key === selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    setSelected(key)
                    const d = parseKey(key)
                    setCursor({ year: d.getFullYear(), month: d.getMonth() })
                  }}
                >
                  <span className="week-day">
                    <strong>{weekdayShort(key)}</strong>
                    <span className="tiny">{shortDate(key)}</span>
                  </span>
                  <span className="grow tiny">
                    {entries.length === 0
                      ? 'wolne'
                      : entries
                          .map((e) => program.byId[e.cardId]?.title ?? 'inny program')
                          .join(', ')}
                  </span>
                  {entries.some((e) => e.done) && <Icon name="CheckCircle2" size={16} />}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {pickerOpen && (
        <CardPicker
          // Myślnik zamiast „na …” — longDate daje mianownik („niedziela”), a „na” chce biernika.
          title={`Dodaj ćwiczenie — ${longDate(selected)}`}
          onClose={() => setPickerOpen(false)}
          onPick={(cardId) => {
            planCard(selected, cardId, program.slug)
            setPickerOpen(false)
          }}
        />
      )}

      {moving && program.byId[moving.cardId] && (
        <PlanSheet
          card={program.byId[moving.cardId]}
          mode="przenies"
          initialDate={moving.date}
          onClose={() => setMoving(null)}
          onPlan={(date) => {
            rescheduleEntry(moving.id, date)
            setSelected(date)
            setMoving(null)
          }}
        />
      )}
    </div>
  )
}
