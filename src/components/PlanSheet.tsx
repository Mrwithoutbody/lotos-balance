// src/components/PlanSheet.tsx
import { useState } from 'react'
import type { ActivationCard } from '../types'
import { addDays, longDate, todayKey } from '../utils/date'
import { Icon } from './Icon'
import { Modal } from './Modal'

interface Props {
  card: ActivationCard
  onClose: () => void
  onPlan: (date: string) => void
  /** Tryb przekładania istniejącego wpisu — zmienia tylko etykiety. */
  mode?: 'plan' | 'przenies'
  initialDate?: string
}

export function PlanSheet({ card, onClose, onPlan, mode = 'plan', initialDate }: Props) {
  const today = todayKey()
  const [date, setDate] = useState(initialDate ?? today)

  const quick = [
    { label: 'Dziś', value: today },
    { label: 'Jutro', value: addDays(today, 1) },
    { label: 'Pojutrze', value: addDays(today, 2) },
  ]

  return (
    <Modal
      title={mode === 'plan' ? 'Zaplanuj ćwiczenie' : 'Przełóż ćwiczenie'}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={() => onPlan(date)}>
          <Icon name="CalendarDays" size={18} />
          {mode === 'plan' ? 'Zaplanuj na' : 'Przenieś na'} {longDate(date)}
        </button>
      }
    >
      <div className="stack">
        <p className="muted">
          Karta „{card.title}” ({card.minutes} min){' '}
          {mode === 'plan' ? 'trafi do Twojego kalendarza.' : 'zmieni termin w kalendarzu.'}
        </p>
        <div className="row wrap">
          {quick.map((q) => (
            <button
              key={q.value}
              type="button"
              className="chip"
              aria-pressed={date === q.value}
              onClick={() => setDate(q.value)}
            >
              {q.label}
            </button>
          ))}
        </div>
        <label className="stack-sm">
          <span className="h3">Wybierz dzień</span>
          <input
            type="date"
            className="input"
            value={date}
            min={mode === 'plan' ? today : undefined}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </label>
      </div>
    </Modal>
  )
}
