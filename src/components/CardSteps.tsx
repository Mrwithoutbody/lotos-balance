// src/components/CardSteps.tsx
// Treść ćwiczenia: kroki, uzasadnienie i zastrzeżenie. Ten sam blok czyta
// podgląd przed startem i odtwarzacz w trakcie — jedno źródło, dwa miejsca.
import { AREA_BY_ID } from '../data/areas'
import type { ActivationCard } from '../types'
import { Icon } from './Icon'

export function CardSteps({ card }: { card: ActivationCard }) {
  const area = AREA_BY_ID[card.area]

  return (
    <>
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

      <div className="surface-quiet stack-sm">
        <p className="eyebrow">Dlaczego to może pomóc?</p>
        <p className="muted">{card.why}</p>
      </div>

      {card.caution && (
        <p className="caution">
          <Icon name="Info" size={15} />
          {card.caution}
        </p>
      )}
    </>
  )
}
