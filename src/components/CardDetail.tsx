// src/components/CardDetail.tsx
import { AREA_BY_ID } from '../data/areas'
import { NEED_BY_ID } from '../data/goals'
import type { ActivationCard } from '../types'
import { Icon } from './Icon'
import { Modal } from './Modal'

interface Props {
  card: ActivationCard
  isFavorite: boolean
  onToggleFavorite: () => void
  onStart: () => void
  onPlan: () => void
  onClose: () => void
}

export function CardDetail({
  card,
  isFavorite,
  onToggleFavorite,
  onStart,
  onPlan,
  onClose,
}: Props) {
  const area = AREA_BY_ID[card.area]

  return (
    <Modal
      title={card.title}
      onClose={onClose}
      footer={
        <div className="stack-sm">
          <button type="button" className="btn btn-primary btn-block" onClick={onStart}>
            <Icon name="Play" size={18} />
            Zaczynam
          </button>
          <div className="row">
            <button type="button" className="btn btn-secondary grow" onClick={onPlan}>
              <Icon name="CalendarDays" size={16} />
              Zaplanuj
            </button>
            <button type="button" className="btn btn-secondary grow" onClick={onToggleFavorite}>
              <Icon name="Star" size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'W ulubionych' : 'Do ulubionych'}
            </button>
          </div>
        </div>
      }
    >
      <div className="stack">
        <div className="row wrap">
          <span className="pill" style={{ background: area.softColor, color: area.color }}>
            <Icon name={area.icon} size={13} />
            {area.name}
          </span>
          <span className="pill">
            <Icon name="Clock" size={13} />
            {card.minutes} min
          </span>
          <span className="pill">energia: {card.energy}</span>
        </div>

        <p className="muted">{card.description}</p>

        <div className="stack-sm">
          <p className="eyebrow">Jak to zrobić</p>
          <ol className="steps">
            {card.steps.map((step, i) => (
              <li key={step}>
                <span className="step-index" style={{ background: area.softColor, color: area.color }}>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-quiet stack-sm">
          <p className="eyebrow">Dlaczego to może pomóc?</p>
          <p className="muted">{card.why}</p>
        </div>

        <div className="row wrap">
          {card.needs.map((need) => (
            <span key={need} className="pill">
              {NEED_BY_ID[need].label}
            </span>
          ))}
        </div>

        {card.caution && (
          <p className="caution">
            <Icon name="Info" size={15} />
            {card.caution}
          </p>
        )}
      </div>
    </Modal>
  )
}
