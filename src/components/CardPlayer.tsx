// src/components/CardPlayer.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { AREA_BY_ID } from '../data/areas'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import { reportProgress } from '../services/decks'
import type { ActivationCard } from '../types'
import { dateKey } from '../utils/date'
import { CardSteps } from './CardSteps'
import { Icon } from './Icon'
import { Modal } from './Modal'

type Phase = 'run' | 'summary'

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

export function CardPlayer({ card, calendarEntryId, onClose }: Props) {
  const { saveSession, setEntryDone } = useAppState()
  const { slug: creatorSlug } = useProgram()
  // Ćwiczenie startuje od razu i kończy się jednym przyciskiem — bez ankiet.
  const [phase, setPhase] = useState<Phase>('run')
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

  function finish() {
    const session = saveSession({
      cardId: card.id,
      creatorSlug,
      date: dateKey(),
      startedAt: startedAt.current,
      completed: true,
    })
    if (calendarEntryId) setEntryDone(calendarEntryId, true)
    reportProgress({ creatorSlug, cardId: card.id, date: session.date })
    setPhase('summary')
  }

  return (
    <Modal title={card.title} onClose={onClose} fullscreen>
      {phase === 'run' && (
        <div className="stack-lg animate-in">
          <div className="stack-sm center">
            <p className="muted">{card.description}</p>
          </div>

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

          <CardSteps card={card} />

          <button type="button" className="btn btn-primary btn-block" onClick={finish}>
            <Icon name="Check" size={18} />
            Gotowe
          </button>
        </div>
      )}

      {phase === 'summary' && (
        <div className="stack-lg animate-in center">
          <div className="player-head" style={{ background: area.softColor, color: area.color }}>
            <Icon name="Check" size={30} />
          </div>
          <div className="stack-sm">
            <h3 className="h1">Zrobione.</h3>
            <p className="muted">Do zobaczenia jutro.</p>
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            Wróć
          </button>
        </div>
      )}
    </Modal>
  )
}
