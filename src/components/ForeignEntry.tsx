// src/components/ForeignEntry.tsx
// Wpis zaplanowany w innym programie. Bez manifestu tego programu nie znamy
// tytułu ćwiczenia — mówimy to wprost, zamiast cicho gubić wiersz. Wcześniej
// takie wpisy wypadały przez `if (!card) return null`.
import { navigate } from '../lib/router'
import type { CalendarEntry } from '../types'
import { Icon } from './Icon'

interface Props {
  entry: CalendarEntry
  onRemove: () => void
}

export function ForeignEntry({ entry, onRemove }: Props) {
  return (
    <li className="entry-row">
      <span className="balance-icon">
        <Icon name="Layers" size={15} />
      </span>
      <span className="grow">
        <span className="entry-title">Ćwiczenie z innego programu</span>
        <span className="tiny">{entry.creatorSlug ?? 'program nieznany'}</span>
      </span>
      {entry.creatorSlug && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(`/${entry.creatorSlug}`)}
        >
          Otwórz
        </button>
      )}
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={onRemove}
        aria-label="Usuń ten wpis"
      >
        <Icon name="Trash2" size={15} />
      </button>
    </li>
  )
}
