// src/components/ScaleInput.tsx
import type { Scale5 } from '../types'

const VALUES: Scale5[] = [1, 2, 3, 4, 5]

interface Props {
  value?: Scale5
  onChange: (value: Scale5) => void
  legend: string
  lowLabel?: string
  highLabel?: string
}

export function ScaleInput({ value, onChange, legend, lowLabel = 'wcale', highLabel = 'bardzo' }: Props) {
  return (
    <fieldset className="scale">
      <legend className="scale-legend">{legend}</legend>
      <div className="scale-row" role="radiogroup" aria-label={legend}>
        {VALUES.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            className={`scale-dot${value === v ? ' is-selected' : ''}`}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="scale-labels">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </fieldset>
  )
}
