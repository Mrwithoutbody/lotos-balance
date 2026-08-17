// src/screens/StarMapScreen.tsx
// Mapa: cała talia jako rozgwiazda. Siedem ramion to obszary, węzły to karty
// w kolejności twórczyni — zrobiona karta otwiera następną w swoim obszarze.
// Klik w węzeł pokazuje ćwiczenie, klik w rdzeń otwiera badanie Mapy Balansu.
import { useMemo, useState } from 'react'
import { BalanceQuiz } from '../components/BalanceQuiz'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import { ARM_SHAPE, brakujaceKarty, buildStarMap, starProgress } from '../services/starmap'
import type { StarNode } from '../services/starmap'
import type { ActivationCard } from '../types'
import { latestSnapshot } from '../utils/balance'
import { dateKey, longDate } from '../utils/date'

interface Props {
  onPlay: (card: ActivationCard) => void
}

export function StarMapScreen({ onPlay }: Props) {
  const { state, addSnapshot } = useAppState()
  const program = useProgram()
  const [wybrany, setWybrany] = useState<StarNode | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)

  const snapshot = latestSnapshot(state.snapshots)
  const arms = useMemo(
    () => buildStarMap(state, program.cards, snapshot?.levels ?? {}),
    [state, program.cards, snapshot],
  )
  const { zrobione, wszystkie } = starProgress(arms)
  const brak = brakujaceKarty(arms)
  const zbadane = arms.filter((a) => a.poziom !== undefined).length

  return (
    <div className="stack">
      <div className="row-between">
        <p className="eyebrow">Mapa talii</p>
        <span className="tiny">
          {zrobione} z {wszystkie} kart · {zbadane} z {arms.length} obszarów zbadanych
        </span>
      </div>

      <div className="star-board">
        <svg className="star-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {arms.flatMap((arm) =>
            arm.nodes.map((node) => {
              // Korzeń wychodzi z rdzenia, reszta z własnego rodzica.
              const od = node.rodzic ? arm.nodes.find((n) => n.card.id === node.rodzic) : undefined
              const x1 = od?.x ?? 50
              const y1 = od?.y ?? 50
              return (
                <line
                  key={`l-${node.card.id}`}
                  x1={x1}
                  y1={y1}
                  x2={node.x}
                  y2={node.y}
                  stroke={arm.color}
                  className={node.state === 'zamkniete' ? 'star-line' : 'star-line is-open'}
                />
              )
            }),
          )}
        </svg>

        <button
          type="button"
          className="star-core"
          onClick={() => setQuizOpen(true)}
          aria-label="Mapa Balansu — badanie siedmiu obszarów"
        >
          <span className="star-core-value">
            {zrobione}/{wszystkie}
          </span>
          <span className="star-core-hint">{snapshot ? 'zbadaj ponownie' : 'zbadaj balans'}</span>
        </button>

        {arms.flatMap((arm) =>
          arm.nodes.map((node) => (
            <button
              key={node.card.id}
              type="button"
              className={`star-node is-${node.state}${wybrany?.card.id === node.card.id ? ' is-picked' : ''}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                ...(node.state === 'zrobione' ? { background: arm.color, borderColor: arm.color } : { borderColor: arm.color }),
              }}
              onClick={() => setWybrany(node)}
              aria-label={`${node.card.title}, ${node.state}`}
            >
              <Icon name={node.state === 'zamkniete' ? 'CircleDot' : node.card.icon} size={15} />
              {node.powtorzenia > 1 && <span className="star-badge">{node.powtorzenia}</span>}
            </button>
          )),
        )}
      </div>

      <ul className="star-legend">
        {arms.map((arm) => (
          <li key={arm.area}>
            <span className="star-dot" style={{ background: arm.color }} />
            <span className="grow">{arm.name}</span>
            <span className="tiny">
              {arm.nodes.filter((n) => n.state === 'zrobione').length}/{arm.nodes.length}
              {arm.poziom !== undefined && ` · ${arm.poziom}`}
            </span>
          </li>
        ))}
      </ul>

      <section className="surface stack-sm">
        {wybrany ? (
          <>
            <p className="eyebrow">
              {wybrany.state === 'zrobione'
                ? `Zrobione ${wybrany.powtorzenia}×`
                : wybrany.state === 'otwarte'
                  ? 'Otwarte'
                  : 'Jeszcze zamknięte'}
            </p>
            <h2 className="h2">{wybrany.card.title}</h2>
            <p className="muted">{wybrany.card.description}</p>
            {wybrany.state === 'zamkniete' ? (
              <p className="tiny">Otworzy się, gdy zrobisz kartę, z której wychodzi ta gałąź.</p>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => onPlay(wybrany.card)}
              >
                <Icon name="Play" size={17} />
                Zacznij
              </button>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow">Jak to czytać</p>
            <p className="muted">
              Każde ramię to jeden obszar, a na nim małe drzewo:{' '}
              {ARM_SHAPE.join(' → ')} karty. Zrobiona karta otwiera te, które z niej wychodzą.
              Rdzeń prowadzi do badania — po nim przy obszarach pojawiają się poziomy.
            </p>
            {brak > 0 && (
              <p className="tiny">
                Do pełnych drzew brakuje {brak} kart w talii — dojdą przy kolejnej publikacji.
              </p>
            )}
            {snapshot && <p className="tiny">Ostatnie badanie: {longDate(snapshot.date)}.</p>}
          </>
        )}
      </section>

      {wybrany && wybrany.state !== 'zamkniete' && (
        <button type="button" className="btn btn-ghost btn-block" onClick={() => setWybrany(null)}>
          Zamknij podgląd
        </button>
      )}

      {quizOpen && (
        <Modal title="Mapa Balansu" onClose={() => setQuizOpen(false)}>
          {snapshot?.date === dateKey() ? (
            <p className="muted">Mapę aktualizujemy raz dziennie. Wróć jutro.</p>
          ) : (
            <BalanceQuiz
              initialAnswers={snapshot?.answers}
              onSubmit={(answers) => {
                addSnapshot(answers)
                setQuizOpen(false)
              }}
            />
          )}
        </Modal>
      )}
    </div>
  )
}
