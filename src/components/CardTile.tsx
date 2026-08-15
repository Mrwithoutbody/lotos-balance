// src/components/CardTile.tsx
import { AREA_BY_ID } from '../data/areas'
import type { ActivationCard } from '../types'
import { Icon } from './Icon'

interface Props {
  card: ActivationCard
  isFavorite: boolean
  onToggleFavorite: () => void
  onOpen: () => void
}

export function CardTile({ card, isFavorite, onToggleFavorite, onOpen }: Props) {
  const area = AREA_BY_ID[card.area]
  return (
    <div className="card-tile" style={{ borderColor: `${area.color}2e` }}>
      <button type="button" className="card-tile-main" onClick={onOpen}>
        <span className="card-tile-emblem" style={{ background: area.softColor, color: area.color }}>
          <Icon name={card.icon} size={19} strokeWidth={1.7} />
        </span>
        <span className="card-tile-title">{card.title}</span>
        <span className="card-tile-meta">
          {area.name} · {card.minutes} min
        </span>
      </button>
      <button
        type="button"
        className={`fav-btn card-tile-fav${isFavorite ? ' is-on' : ''}`}
        onClick={onToggleFavorite}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite ? `Usuń „${card.title}” z ulubionych` : `Dodaj „${card.title}” do ulubionych`
        }
      >
        <Icon name="Star" size={16} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
