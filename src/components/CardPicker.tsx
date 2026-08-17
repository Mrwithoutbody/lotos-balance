// src/components/CardPicker.tsx
// Wybór ćwiczenia na konkretny dzień. Kompaktowe wiersze zamiast kafli — tu
// liczy się szybkie przejrzenie listy, nie oglądanie grafik.
import { useMemo, useState } from 'react'
import { AREA_BY_ID } from '../data/areas'
import { CARDS } from '../data/cards'
import type { AreaId } from '../types'
import { filterCards } from '../utils/search'
import { AreaChips } from './AreaChips'
import { Icon } from './Icon'
import { Modal } from './Modal'

interface Props {
  title: string
  onClose: () => void
  onPick: (cardId: string) => void
}

export function CardPicker({ title, onClose, onPick }: Props) {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState<AreaId | 'wszystkie'>('wszystkie')

  const list = useMemo(() => filterCards(CARDS, { query, area }), [query, area])

  return (
    <Modal title={title} onClose={onClose}>
      <div className="stack">
        <div className="search-wrap">
          <Icon name="Search" size={17} />
          <input
            className="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj ćwiczenia"
            aria-label="Szukaj ćwiczenia"
          />
        </div>
        <AreaChips value={area} onChange={setArea} />
        <ul className="picker-list">
          {list.map((card) => {
            const cardArea = AREA_BY_ID[card.area]
            return (
              <li key={card.id}>
                <button type="button" className="picker-item" onClick={() => onPick(card.id)}>
                  <span
                    className="balance-icon"
                    style={{ background: cardArea.softColor, color: cardArea.color }}
                  >
                    <Icon name={card.icon} size={15} />
                  </span>
                  <span className="grow">
                    <span className="entry-title">{card.title}</span>
                    <span className="tiny">
                      {cardArea.name} · {card.minutes} min
                    </span>
                  </span>
                  <Icon name="ChevronRight" size={16} />
                </button>
              </li>
            )
          })}
          {list.length === 0 && <li className="muted">Brak ćwiczeń dla tego wyszukiwania.</li>}
        </ul>
      </div>
    </Modal>
  )
}
