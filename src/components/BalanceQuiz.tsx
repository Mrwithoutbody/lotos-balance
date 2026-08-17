// src/components/BalanceQuiz.tsx
import { useState } from 'react'
import { AREAS } from '../data/areas'
import type { AreaId, Scale5 } from '../types'
import { Icon } from './Icon'
import { ScaleInput } from './ScaleInput'

interface Props {
  onSubmit: (answers: Partial<Record<AreaId, Scale5>>) => void
  initialAnswers?: Partial<Record<AreaId, Scale5>>
}

/** Pytania Mapy Balansu — po jednym na obszar, odniesione do ostatnich 7 dni. */
export function BalanceQuiz({
  onSubmit,
  initialAnswers = {},
}: Props) {
  const list = AREAS
  const [answers, setAnswers] = useState<Partial<Record<AreaId, Scale5>>>(initialAnswers)
  const answered = list.filter((a) => answers[a.id] !== undefined).length
  const complete = answered === list.length

  return (
    <div className="stack-lg">
      <div className="quiz-progress" aria-hidden="true">
        <span style={{ width: `${(answered / list.length) * 100}%` }} />
      </div>
      <p className="tiny">
        Odpowiedz, myśląc o ostatnich siedmiu dniach. {answered} z {list.length} pytań.
      </p>

      {list.map((area) => (
        <div key={area.id} className="quiz-item">
          <div className="row">
            <span className="balance-icon" style={{ background: area.softColor, color: area.color }}>
              <Icon name={area.icon} size={16} />
            </span>
            <span className="eyebrow">{area.name}</span>
          </div>
          <ScaleInput
            legend={area.question}
            value={answers[area.id]}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [area.id]: value }))}
            lowLabel="prawie wcale"
            highLabel="prawie zawsze"
          />
        </div>
      ))}

      <p className="tiny">Mapa Balansu jest narzędziem do autorefleksji, a nie testem medycznym.</p>

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!complete}
        onClick={() => complete && onSubmit(answers)}
      >
        Zapisz wynik
      </button>
    </div>
  )
}
