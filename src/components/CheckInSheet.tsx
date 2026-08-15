// src/components/CheckInSheet.tsx
import { useState } from 'react'
import { NEEDS, TIME_OPTIONS } from '../data/goals'
import type { Minutes, NeedId, Scale5 } from '../types'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { ScaleInput } from './ScaleInput'

interface Props {
  initialNeed?: NeedId
  initialMinutes?: Minutes
  onClose: () => void
  onSubmit: (need: NeedId, minutes: Minutes, state?: Scale5) => void
}

export function CheckInSheet({ initialNeed, initialMinutes, onClose, onSubmit }: Props) {
  const [need, setNeed] = useState<NeedId | undefined>(initialNeed)
  const [minutes, setMinutes] = useState<Minutes | undefined>(initialMinutes)
  const [state, setState] = useState<Scale5 | undefined>()

  const canSubmit = need !== undefined && minutes !== undefined

  return (
    <Modal
      title="Krótki check-in"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!canSubmit}
          onClick={() => canSubmit && onSubmit(need, minutes, state)}
        >
          Dobierz aktywację
          <Icon name="ChevronRight" size={18} />
        </button>
      }
    >
      <div className="stack-lg">
        <section className="stack-sm">
          <h3 className="h3">Czego najbardziej potrzebujesz teraz?</h3>
          <div className="row wrap">
            {NEEDS.map((n) => (
              <button
                key={n.id}
                type="button"
                className="chip"
                aria-pressed={need === n.id}
                onClick={() => setNeed(n.id)}
              >
                <Icon name={n.icon} size={15} />
                {n.label}
              </button>
            ))}
          </div>
        </section>

        <section className="stack-sm">
          <h3 className="h3">Ile masz czasu?</h3>
          <div className="row wrap">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                className="chip"
                aria-pressed={minutes === t.value}
                onClick={() => setMinutes(t.value)}
              >
                <Icon name="Clock" size={15} />
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="stack-sm">
          <ScaleInput
            legend="Jak się teraz masz? (opcjonalnie)"
            value={state}
            onChange={setState}
            lowLabel="ciężko"
            highLabel="dobrze"
          />
        </section>
      </div>
    </Modal>
  )
}
