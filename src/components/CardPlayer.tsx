// src/components/CardPlayer.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { AREA_BY_ID } from '../data/areas'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import type { ActivationCard, Scale5 } from '../types'
import { dateKey } from '../utils/date'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { ScaleInput } from './ScaleInput'

type Phase = 'before' | 'run' | 'after' | 'summary'

interface Props {
  card: ActivationCard
  /** Wpis kalendarza, który zostanie oznaczony jako wykonany. */
  calendarEntryId?: string
  onClose: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function summaryText(before: Scale5, after: Scale5): string {
  const delta = after - before
  if (delta > 0) return `To ćwiczenie dało dziś zmianę +${delta}.`
  if (delta === 0) return 'Nie zauważyłaś zmiany — to też cenna informacja.'
  return 'Dziś to ćwiczenie nie pomogło. Następnym razem spróbujemy innego podejścia.'
}

export function CardPlayer({ card, calendarEntryId, onClose }: Props) {
  const { saveSession, setEntryDone } = useAppState()
  const { slug: creatorSlug } = useProgram()
  const [phase, setPhase] = useState<Phase>('before')
  const [before, setBefore] = useState<Scale5>()
  const [after, setAfter] = useState<Scale5>()
  const [secondsLeft, setSecondsLeft] = useState(card.minutes * 60)
  const [running, setRunning] = useState(true)
  const startedAt = useRef<string>(new Date().toISOString())
  const area = AREA_BY_ID[card.area]

  useEffect(() => {
    if (phase !== 'run' || !running) return
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer)
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase, running])

  const progress = useMemo(
    () => 1 - secondsLeft / (card.minutes * 60),
    [secondsLeft, card.minutes],
  )

  function finishAndSave() {
    if (before === undefined) return
    const session = saveSession({
      cardId: card.id,
      creatorSlug,
      date: dateKey(),
      startedAt: startedAt.current,
      before,
      after,
      completed: true,
    })
    if (calendarEntryId) setEntryDone(calendarEntryId, true)
    // Zalogowana osoba dokłada swoją pracę do kręgu; 401 (brak sesji) po prostu ignorujemy —
    // localStorage wyżej pozostaje źródłem prawdy dla widoku.
    void fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorSlug, cardId: card.id, date: session.date, before, after }),
    }).catch(() => {})
    setPhase('summary')
  }

  return (
    <Modal title={card.title} onClose={onClose} fullscreen>
      {phase === 'before' && (
        <div className="stack-lg animate-in">
          <div className="player-head" style={{ background: area.softColor, color: area.color }}>
            <Icon name={card.icon} size={30} strokeWidth={1.6} />
          </div>
          <div className="stack-sm center">
            <p className="muted">{card.description}</p>
          </div>
          <ScaleInput
            legend="Jak się czujesz przed ćwiczeniem?"
            value={before}
            onChange={setBefore}
            lowLabel="ciężko"
            highLabel="dobrze"
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={before === undefined}
            onClick={() => {
              startedAt.current = new Date().toISOString()
              setPhase('run')
            }}
          >
            <Icon name="Play" size={18} />
            Przejdź do ćwiczenia
          </button>
        </div>
      )}

      {phase === 'run' && (
        <div className="stack-lg animate-in">
          <div className="timer-wrap">
            <div
              className="timer-ring"
              style={{
                background: `conic-gradient(${area.color} ${Math.round(progress * 360)}deg, ${area.softColor} 0deg)`,
              }}
            >
              <div className="timer-inner">
                <span className="timer-value">{formatTime(secondsLeft)}</span>
                <span className="tiny">{running ? 'trwa' : 'pauza'}</span>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRunning((r) => !r)}
                disabled={secondsLeft === 0}
              >
                <Icon name={running ? 'Pause' : 'Play'} size={16} />
                {running ? 'Pauza' : 'Wznów'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSecondsLeft(card.minutes * 60)
                  setRunning(true)
                }}
              >
                <Icon name="RefreshCw" size={16} />
                Od nowa
              </button>
            </div>
          </div>

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

          <button type="button" className="btn btn-primary btn-block" onClick={() => setPhase('after')}>
            <Icon name="Check" size={18} />
            {secondsLeft === 0 ? 'Gotowe' : 'Zakończ wcześniej'}
          </button>
        </div>
      )}

      {phase === 'after' && (
        <div className="stack-lg animate-in">
          <div className="stack-sm center">
            <p className="muted">Każda odpowiedź jest dobra. To informacja, nie ocena.</p>
          </div>
          <ScaleInput
            legend="Jak się czujesz po ćwiczeniu?"
            value={after}
            onChange={setAfter}
            lowLabel="ciężko"
            highLabel="dobrze"
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={after === undefined}
            onClick={finishAndSave}
          >
            Zapisz wynik
          </button>
        </div>
      )}

      {phase === 'summary' && before !== undefined && after !== undefined && (
        <div className="stack-lg animate-in center">
          <div className="player-head" style={{ background: area.softColor, color: area.color }}>
            <Icon name="Check" size={30} />
          </div>
          <div className="stack-sm">
            <h3 className="h1">{summaryText(before, after)}</h3>
            <p className="muted">
              Zapisałyśmy to w Twojej historii. Kolejne wyniki pomogą lepiej dobierać ćwiczenia.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            Wróć
          </button>
        </div>
      )}
    </Modal>
  )
}
