// src/screens/MapScreen.tsx
// Mapa Balansu: siedem obszarów wypełnianych odpowiedziami użytkowniczki.
// To, co robi w talii, nigdy nie rusza tych poziomów — zmienia je tylko badanie.
import { useState } from 'react'
import { BalanceMap } from '../components/BalanceMap'
import { BalanceQuiz } from '../components/BalanceQuiz'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { AREA_BY_ID } from '../data/areas'
import { useAppState } from '../hooks/useAppState'
import {
  latestSnapshot,
  statusOf,
  strongestArea,
  weakestAreas,
} from '../utils/balance'
import { dateKey, longDate } from '../utils/date'

export function MapScreen() {
  const { state, addSnapshot } = useAppState()
  const [quizOpen, setQuizOpen] = useState(false)

  const snapshot = latestSnapshot(state.snapshots)
  const weak = snapshot ? weakestAreas(snapshot.levels, 2) : []
  const strong = snapshot ? strongestArea(snapshot.levels) : null
  const updatedToday = snapshot?.date === dateKey()

  return (
    <div className="stack-lg">
      <section className="stack-sm">
        <p className="eyebrow">Mapa Balansu</p>
        {snapshot ? (
          <p className="tiny">Ostatnie badanie: {longDate(snapshot.date)}</p>
        ) : (
          <p className="muted">
            Siedem obszarów, siedem pytań o ostatni tydzień. Mapa powstaje z Twoich odpowiedzi.
          </p>
        )}
      </section>

      {snapshot && (
        <>
          <section className="surface stack">
            <BalanceMap levels={snapshot.levels} highlight={weak} />
            <p className="tiny">Mapa jest narzędziem do autorefleksji, a nie testem medycznym.</p>
          </section>

          <section className="grid-2">
            <div className="surface-quiet stack-sm">
              <p className="eyebrow">Najbardziej potrzebuje wsparcia</p>
              {weak.length === 0 ? (
                <p className="tiny">Za mało poznanych obszarów.</p>
              ) : (
                weak.map((id) => (
                  <p key={id} className="h3" style={{ color: AREA_BY_ID[id].color }}>
                    {AREA_BY_ID[id].name}
                  </p>
                ))
              )}
            </div>
            <div className="surface-quiet stack-sm">
              <p className="eyebrow">Twoja mocna strona</p>
              {strong ? (
                <>
                  <p className="h3" style={{ color: AREA_BY_ID[strong].color }}>
                    {AREA_BY_ID[strong].name}
                  </p>
                  <p className="tiny">{statusOf(snapshot.levels[strong] as number)}.</p>
                </>
              ) : (
                <p className="tiny">Poznamy ją po badaniu.</p>
              )}
            </div>
          </section>
        </>
      )}

      <section className="stack-sm">
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => setQuizOpen(true)}
          disabled={updatedToday}
        >
          <Icon name={snapshot ? 'RefreshCw' : 'PenLine'} size={17} />
          {snapshot ? 'Zaktualizuj mapę' : 'Zrób badanie — 7 pytań'}
        </button>
        {updatedToday && (
          <p className="tiny">Mapę aktualizujemy raz dziennie. Wróć jutro.</p>
        )}
      </section>

      {quizOpen && (
        <Modal title="Mapa Balansu" onClose={() => setQuizOpen(false)}>
          <BalanceQuiz
            initialAnswers={snapshot?.answers}
            onSubmit={(answers) => {
              addSnapshot(answers)
              setQuizOpen(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
