// src/screens/TodayScreen.tsx
import { useMemo, useState } from 'react'
import { ActivationCardView } from '../components/ActivationCard'
import { BalanceMap } from '../components/BalanceMap'
import { BrainCard } from '../components/BrainCard'
import { CheckInSheet } from '../components/CheckInSheet'
import { Icon } from '../components/Icon'
import { PlanSheet } from '../components/PlanSheet'
import { AREA_BY_ID } from '../data/areas'
import { CARD_BY_ID } from '../data/cards'
import { NEED_BY_ID } from '../data/goals'
import { useAppState } from '../hooks/useAppState'
import { streak } from '../services/insights'
import { recommend } from '../services/recommend'
import type { ActivationCard, Minutes, NeedId, Scale5 } from '../types'
import { latestSnapshot, weakestAreas } from '../utils/balance'
import { greeting, longDate, todayKey } from '../utils/date'
import type { TabId } from '../components/BottomNav'
import heroImg from '../assets/anna/hero-dzisiaj.webp'

interface Props {
  onPlay: (card: ActivationCard, source: 'dzisiaj' | 'talia' | 'kalendarz', entryId?: string) => void
  onAbout: () => void
  onNavigate: (tab: TabId) => void
}

export function TodayScreen({ onPlay, onAbout, onNavigate }: Props) {
  const { state, addCheckIn, planCard } = useAppState()
  const today = todayKey()
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [planCardTarget, setPlanCardTarget] = useState<ActivationCard | null>(null)
  const [offset, setOffset] = useState(0)

  const todayCheckIn = useMemo(() => {
    const list = state.checkIns.filter((c) => c.date === today)
    return list.length > 0 ? list[list.length - 1] : null
  }, [state.checkIns, today])

  const ranked = useMemo(() => {
    if (!todayCheckIn) return []
    return recommend(state, {
      need: todayCheckIn.need,
      minutes: todayCheckIn.minutes,
      state: todayCheckIn.state,
    })
  }, [state, todayCheckIn])

  const suggestion = ranked.length > 0 ? ranked[offset % ranked.length] : null
  const snapshot = latestSnapshot(state.snapshots)
  const weak = snapshot ? weakestAreas(snapshot.levels, 2) : []
  const days = streak(state)
  const todayEntries = state.calendar.filter((e) => e.date === today)
  const doneToday = state.sessions.filter((s) => s.date === today && s.completed).length

  function submitCheckIn(need: NeedId, minutes: Minutes, value?: Scale5) {
    addCheckIn({ need, minutes, state: value })
    setOffset(0)
    setCheckInOpen(false)
  }

  return (
    <div className="stack-lg">
      <header className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-overlay">
          <p className="hero-eyebrow">{longDate(today)}</p>
          <h1 className="display hero-title">
            {greeting()}
            <em>.</em>
          </h1>
          <div className="row wrap">
            <span className="pill pill-glass">
              <Icon name="Flame" size={13} />
              {days > 0 ? `${days} ${days === 1 ? 'dzień' : 'dni'} z rzędu` : 'Zacznij dziś'}
            </span>
            <span className="pill pill-glass">
              <Icon name="Check" size={13} />
              {doneToday} {doneToday === 1 ? 'aktywacja dziś' : 'aktywacji dziś'}
            </span>
          </div>
        </div>
      </header>

      {!todayCheckIn ? (
        <section className="surface stack">
          <h2 className="h1">Czego najbardziej potrzebujesz teraz?</h2>
          <p className="muted">Kilkanaście sekund — jedna aktywacja na teraz.</p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => setCheckInOpen(true)}
          >
            <Icon name="Sparkles" size={18} />
            Zrób check-in
          </button>
        </section>
      ) : (
        <section className="stack">
          <div className="row-between">
            <div>
              <p className="eyebrow">Twoja aktywacja na teraz</p>
              <p className="tiny">
                {NEED_BY_ID[todayCheckIn.need].label.toLowerCase()} · {todayCheckIn.minutes} min
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCheckInOpen(true)}>
              <Icon name="RefreshCw" size={15} />
              Zmień
            </button>
          </div>

          {suggestion && (
            <ActivationCardView
              card={suggestion.card}
              reasons={suggestion.reasons}
              footer={
                <div className="stack-sm">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => onPlay(suggestion.card, 'dzisiaj')}
                  >
                    <Icon name="Play" size={18} />
                    Zaczynam
                  </button>
                  <div className="row">
                    <button
                      type="button"
                      className="btn btn-secondary grow"
                      onClick={() => setOffset((o) => o + 1)}
                    >
                      <Icon name="SkipForward" size={16} />
                      Pokaż inną
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary grow"
                      onClick={() => setPlanCardTarget(suggestion.card)}
                    >
                      <Icon name="CalendarDays" size={16} />
                      Zaplanuj
                    </button>
                  </div>
                </div>
              }
            />
          )}
        </section>
      )}

      <section className="surface stack-sm">
        <div className="row-between">
          <p className="eyebrow">Dzisiaj w kalendarzu</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('kalendarz')}>
            Kalendarz
            <Icon name="ChevronRight" size={15} />
          </button>
        </div>
        {todayEntries.length === 0 ? (
          <p className="muted">Nic nie zaplanowano na dziś. To też jest w porządku.</p>
        ) : (
          <ul className="entry-list">
            {todayEntries.map((entry) => {
              const card = CARD_BY_ID[entry.cardId]
              if (!card) return null
              const area = AREA_BY_ID[card.area]
              return (
                <li key={entry.id} className="entry-row">
                  <span
                    className="balance-icon"
                    style={{ background: area.softColor, color: area.color }}
                  >
                    <Icon name={card.icon} size={15} />
                  </span>
                  <span className="grow">
                    <span className="entry-title">{card.title}</span>
                    <span className="tiny">
                      {area.name} · {card.minutes} min
                    </span>
                  </span>
                  {entry.done ? (
                    <span className="pill pill-done">
                      <Icon name="Check" size={12} />
                      zrobione
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onPlay(card, 'kalendarz', entry.id)}
                    >
                      Zacznij
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {snapshot ? (
        <section className="surface stack-sm">
          <div className="row-between">
            <p className="eyebrow">Twój balans</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('balans')}>
              Szczegóły
              <Icon name="ChevronRight" size={15} />
            </button>
          </div>
          <BalanceMap levels={snapshot.levels} compact highlight={weak} />
        </section>
      ) : (
        <section className="surface stack-sm">
          <p className="eyebrow">Twój balans</p>
          <p className="muted">Mapa buduje się w talii — bez testu na wejściu.</p>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => onNavigate('talia')}
          >
            <Icon name="Layers" size={16} />
            Przejrzyj talię
          </button>
        </section>
      )}

      <BrainCard onAbout={onAbout} />

      {checkInOpen && (
        <CheckInSheet
          initialNeed={todayCheckIn?.need}
          initialMinutes={todayCheckIn?.minutes}
          onClose={() => setCheckInOpen(false)}
          onSubmit={submitCheckIn}
        />
      )}

      {planCardTarget && (
        <PlanSheet
          card={planCardTarget}
          onClose={() => setPlanCardTarget(null)}
          onPlan={(date) => {
            planCard(date, planCardTarget.id)
            setPlanCardTarget(null)
            onNavigate('kalendarz')
          }}
        />
      )}
    </div>
  )
}
