// src/components/AreaChips.tsx
import { AREAS } from '../data/areas'
import type { AreaId } from '../types'
import { Icon } from './Icon'

interface Props {
  value: AreaId | 'wszystkie'
  onChange: (area: AreaId | 'wszystkie') => void
}

/** Chipy obszarów. Klik w aktywny czyści filtr, więc bez osobnego chipa „wszystkie”. */
export function AreaChips({ value, onChange }: Props) {
  return (
    <div className="row wrap">
      {AREAS.map((a) => (
        <button
          key={a.id}
          type="button"
          className="chip"
          aria-pressed={value === a.id}
          onClick={() => onChange(value === a.id ? 'wszystkie' : a.id)}
        >
          <Icon name={a.icon} size={14} />
          {a.name}
        </button>
      ))}
    </div>
  )
}
