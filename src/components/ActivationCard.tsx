// src/components/ActivationCard.tsx
import type { ReactNode } from 'react'
import { AREA_BY_ID } from '../data/areas'
import { CARD_ART } from '../data/cards'
import type { ActivationCard as Card } from '../types'
import { Icon } from './Icon'

interface Props {
  card: Card
  /** Krótkie uzasadnienia z algorytmu rekomendacji. */
  reasons?: string[]
  isFavorite?: boolean
  onToggleFavorite?: () => void
  footer?: ReactNode
}

export function ActivationCardView({ card, reasons, isFavorite, onToggleFavorite, footer }: Props) {
  const area = AREA_BY_ID[card.area]
  const secondary = card.secondaryArea ? AREA_BY_ID[card.secondaryArea] : null
  const art = CARD_ART[card.area]

  return (
    <article
      className="activation-card"
      style={{
        background: `linear-gradient(158deg, ${area.softColor} 0%, #ffffff 62%)`,
        borderColor: `${area.color}33`,
      }}
    >
      {art && (
        <span
          className="activation-art"
          style={{ backgroundImage: `url(${art})` }}
          aria-hidden="true"
        />
      )}
      <div className="activation-top">
        <span className="pill" style={{ background: '#ffffffcc', color: area.color }}>
          <Icon name={area.icon} size={13} />
          {area.name}
        </span>
        <span className="pill" style={{ background: '#ffffffcc' }}>
          <Icon name="Clock" size={13} />
          {card.minutes} min
        </span>
        {onToggleFavorite && (
          <button
            type="button"
            className={`fav-btn${isFavorite ? ' is-on' : ''}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            <Icon name="Star" size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="activation-emblem" style={{ background: area.color }}>
        <Icon name={card.icon} size={26} strokeWidth={1.6} color="#fffaf7" />
      </div>

      <h3 className="activation-title">{card.title}</h3>
      <p className="activation-desc">{card.description}</p>

      <div className="row wrap activation-meta">
        <span
          className="meta-badge"
          role="img"
          aria-label={`Energia: ${card.energy}`}
          title={`Energia: ${card.energy}`}
        >
          <Icon name="Zap" size={13} />
          <span className="energy-dots">
            {[1, 2, 3].map((n) => (
              <i
                key={n}
                className={
                  n <= (card.energy === 'niska' ? 1 : card.energy === 'srednia' ? 2 : 3)
                    ? 'is-on'
                    : undefined
                }
              />
            ))}
          </span>
        </span>
        <span className="meta-badge" role="img" aria-label={`${card.steps.length} kroki`}>
          <Icon name="CheckCircle2" size={13} />
          {card.steps.length}
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
