// src/components/BrainCard.tsx
import { brainStepForDate } from '../data/brain'
import { useAppState } from '../hooks/useAppState'
import { todayKey } from '../utils/date'
import { Icon } from './Icon'

interface Props {
  onAbout: () => void
}

/** „Mózg na lata” — dokładnie jeden prosty krok dziennie. */
export function BrainCard({ onAbout }: Props) {
  const { state, markBrainStep } = useAppState()
  const today = todayKey()
  const step = brainStepForDate(today)
  const done = state.brainSteps.includes(today)

  return (
    <section className="surface brain-card">
      <div className="row-between">
        <span className="pill" style={{ background: `${step.color}1f`, color: step.color }}>
          <Icon name={step.icon} size={13} />
          Mózg na lata · {step.pillarLabel}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onAbout}>
          <Icon name="Info" size={15} />
          O metodzie
        </button>
      </div>
      <h3 className="h2">{step.text}</h3>
      <p className="muted">{step.hint}</p>
      <button
        type="button"
        className={`btn btn-sm ${done ? 'btn-ghost' : 'btn-secondary'}`}
        onClick={() => !done && markBrainStep(today)}
        disabled={done}
      >
        <Icon name={done ? 'CheckCircle2' : 'Check'} size={16} />
        {done ? 'Zrobione dzisiaj' : 'Zrobione'}
      </button>
    </section>
  )
}
