// src/components/ActivationCard.tsx
import type { CSSProperties, ReactNode } from 'react'
import { AREA_BY_ID } from '../data/areas'
import { useProgram } from '../hooks/useProgram'
import type { ActivationCard as Card } from '../types'
import { stepsLabel } from '../utils/format'
import { Icon } from './Icon'
import { Pill } from './Pill'

interface Props {
  card: Card
  /** Krótkie uzasadnienia z algorytmu rekomendacji. */
  reasons?: string[]
  /** Otwiera pełny opis ćwiczenia — ikona „i” w rogu karty. */
  onInfo?: () => void
  footer?: ReactNode
}

export function ActivationCardView({ card, reasons, onInfo, footer }: Props) {
  const area = AREA_BY_ID[card.area]
  const secondary = card.secondaryArea ? AREA_BY_ID[card.secondaryArea] : null
  const art = useProgram().art[card.area]

  return (
    <article
      className="activation-card area-surface"
      style={{ '--area': area.color, '--area-soft': area.softColor } as CSSProperties}
    >
      {art && (
        <span
          className="card-art"
          style={{ backgroundImage: `url(${art})` }}
          aria-hidden="true"
        />
      )}
      <div className="activation-top">
        <Pill icon={area.icon} color={area.color}>
          {area.name}
        </Pill>
        <Pill icon="Clock">{card.minutes} min</Pill>
        {onInfo && (
          <button
            type="button"
            className="fav-btn"
            // Karta siedzi w SwipeCard — bez tego pierwszy dotyk startuje przeciąganie.
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onInfo}
            title="Opis ćwiczenia"
          >
            <Icon name="Info" size={18} />
          </button>
        )}
      </div>

      <div className="activation-emblem" style={{ background: area.color }}>
        <Icon name={card.icon} size={26} strokeWidth={1.6} color="var(--paper)" />
      </div>

      <h3 className="activation-title">{card.title}</h3>
      <p className="activation-desc">{card.description}</p>

      <div className="row wrap activation-meta">
        {/* Słowa zamiast kropek i gołej liczby — bez podpisu obie plakietki były szumem. */}
        <span className="meta-badge">
          <Icon name="Zap" size={13} />
          {card.energy === 'srednia' ? 'średnia' : card.energy} energia
        </span>
        <span className="meta-badge">
          <Icon name="CheckCircle2" size={13} />
          {stepsLabel(card.steps.length)}
        </span>
        {secondary && (
          <span
            className="meta-badge"
            style={{ color: secondary.color }}
            role="img"
            aria-label={`Wspiera też: ${secondary.name}`}
            title={`Wspiera też: ${secondary.name}`}
          >
            <Icon name={secondary.icon} size={13} />
          </span>
        )}
      </div>

      {reasons && reasons.length > 0 && (
        <ul className="reasons">
          {reasons.map((reason) => (
            <li key={reason}>
              <Icon name="Check" size={13} />
              {reason}
            </li>
          ))}
        </ul>
      )}

      {footer ? <div className="activation-footer">{footer}</div> : null}
    </article>
  )
}
