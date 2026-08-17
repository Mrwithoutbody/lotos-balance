// src/components/CardInfo.tsx
// Pełny opis ćwiczenia przed startem — ta sama treść, którą pokazuje odtwarzacz.
import { AREA_BY_ID } from '../data/areas'
import type { ActivationCard } from '../types'
import { minutesLabel, stepsLabel } from '../utils/format'
import { CardSteps } from './CardSteps'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { Pill } from './Pill'

interface Props {
  card: ActivationCard
  onStart: () => void
  onClose: () => void
}

export function CardInfo({ card, onStart, onClose }: Props) {
  const area = AREA_BY_ID[card.area]

  return (
    <Modal
      title={card.title}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={onStart}>
          <Icon name="Play" size={18} />
          Zacznij
        </button>
      }
    >
      <div className="stack">
        <div className="row wrap">
          <Pill icon={area.icon} color={area.color}>
            {area.name}
          </Pill>
          <Pill icon="Clock">{minutesLabel(card.minutes)}</Pill>
          <Pill icon="CheckCircle2">{stepsLabel(card.steps.length)}</Pill>
        </div>

        <p className="muted">{card.description}</p>

        <CardSteps card={card} />
      </div>
    </Modal>
  )
}
