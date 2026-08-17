// src/screens/DeckHomeScreen.tsx
// Strona startowa talii: okładka twórczyni i karta na dziś. Akcje mieszkają
// w dolnej nawigacji, więc nie powtarzamy ich tutaj.
import { useMemo } from 'react'
import { Icon } from '../components/Icon'
import { TodayCard } from '../components/TodayCard'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import { dayCards } from '../services/day'
import { streak } from '../services/insights'
import { dateKey, partOfDay } from '../utils/date'
import { dayPartLabel, daysLabel, exercisesLabel } from '../utils/format'
import type { TabId } from '../components/BottomNav'

interface Props {
  onNavigate: (tab: TabId) => void
}

export function DeckHomeScreen({ onNavigate }: Props) {
  const { state } = useAppState()
  const program = useProgram()
  const today = dateKey()

  // Karta na teraz: z rozkładu dnia bierzemy tę przypisaną do bieżącej pory,
  // a gdy jej już nie ma — pierwszą, która została.
  const slot = useMemo(() => {
    const left = dayCards(state, program.cards, today)
    return left.find((s) => s.part === partOfDay()) ?? left[0]
  }, [state, program.cards, today])

  const days = streak(state)

  return (
    <div className="stack-lg">
      <header
        className="deck-hero"
        style={program.cover ? { backgroundImage: `url(${program.cover})` } : undefined}
      >
        <div className="deck-hero-scrim">
          <p className="hero-eyebrow">{program.name}</p>
          <h1 className="display hero-title">{program.title}</h1>
          {program.bio && <p className="hero-sub">{program.bio}</p>}
          <div className="row wrap">
            <span className="pill pill-glass">
              <Icon name="Layers" size={13} />
              {exercisesLabel(program.cards.length)}
            </span>
            {days > 0 && (
              <span className="pill pill-glass">
                <Icon name="Flame" size={13} />
                {daysLabel(days)} z rzędu
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="stack-sm">
        <p className="eyebrow">
          Karta na dziś{slot?.part ? ` · ${dayPartLabel(slot.part)}` : ''}
        </p>
        {slot ? (
          <TodayCard slot={slot} onOpen={() => onNavigate('karty')} />
        ) : (
          <>
            <h2 className="h1">Dziś nic nie robimy.</h2>
            <p className="muted">Karty na dziś odłożone. Jutro talia rozłoży kolejne.</p>
          </>
        )}
      </section>
    </div>
  )
}
