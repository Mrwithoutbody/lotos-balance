// src/components/ProbeCard.tsx
import type { CSSProperties } from 'react'
import { AREA_BY_ID } from '../data/areas'
import type { AreaId, Scale5 } from '../types'
import { Icon } from './Icon'
import { ScaleInput } from './ScaleInput'

interface Props {
  area: AreaId
  onAnswer: (value: Scale5) => void
  onSkip: () => void
}

/**
 * Karta-sonda: jedno pytanie, które dopisuje obszar do Mapy Balansu.
 * Zamiast osobnego onboardingu profil buduje się w trakcie pracy z talią.
 */
export function ProbeCard({ area, onAnswer, onSkip }: Props) {
  const def = AREA_BY_ID[area]
  return (
    <article
      className="activation-card probe-card area-surface"
      style={{ '--area': def.color, '--area-soft': def.softColor } as CSSProperties}
    >
      <div className="activation-top">
        <span className="pill" style={{ color: def.color }}>
          <Icon name={def.icon} size={13} />
          {def.name}
        </span>
        <span className="pill">
          <Icon name="Compass" size={13} />
          Mapa Balansu
        </span>
      </div>

      <div className="activation-emblem" style={{ background: def.color }}>
        <Icon name="PenLine" size={26} strokeWidth={1.6} color="#fffaf7" />
      </div>

      <h3 className="activation-title">{def.question}</h3>
      <p className="activation-desc">Ostatnie 7 dni. Jedna odpowiedź — jeden obszar na mapie.</p>

      <div className="activation-footer stack-sm">
        <ScaleInput
          legend="Twoja odpowiedź"
          onChange={onAnswer}
          lowLabel="prawie wcale"
          highLabel="prawie zawsze"
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onSkip}>
          Pomiń to pytanie
        </button>
      </div>
    </article>
  )
}
