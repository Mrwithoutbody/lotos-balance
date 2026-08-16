// src/components/BrainCard.tsx
import { brainStepForDate } from '../data/brain'
import { useAppState } from '../hooks/useAppState'
import { todayKey } from '../utils/date'
import { Icon } from './Icon'
import natureImg from '../assets/anna/natura-gniazdo.webp'

interface Props {
  onAbout: () => void
}

/** „Mózg na lata” — dokładnie jeden prosty krok dziennie. Ciemna karta editorial. */
export function BrainCard({ onAbout }: Props) {
  const { state, markBrainStep } = useAppState()
  const today = todayKey()
  const step = brainStepForDate(today)
  const done = state.brainSteps.includes(today)

  return (
    <section className="brain-card-dark" style={{ backgroundImage: `url(${natureImg})` }}>
      <div className="brain-card-scrim">
        <div className="row-between">
          <span className="pill pill-glass">
            <Icon name={step.icon} size={13} />
            Mózg na lata · {step.pillarLabel}
          </span>
          <button
            type="button"
            className="icon-btn icon-btn-glass"
            onClick={onAbout}
            aria-label="O module Mózg na lata"
          >
            <Icon name="Info" size={16} />
          </button>
        </div>
        <h3 className="brain-title">{step.text}</h3>
        <p className="brain-hint">{step.hint}</p>
        <button
          type="button"
          className={`btn btn-sm ${done ? 'btn-glass-done' : 'btn-glass'}`}
          onClick={() => !done && markBrainStep(today)}
          disabled={done}
        >
          <Icon name={done ? 'CheckCircle2' : 'Check'} size={16} />
          {done ? 'Zrobione dzisiaj' : 'Zrobione'}
        </button>
      </div>
    </section>
  )
}
