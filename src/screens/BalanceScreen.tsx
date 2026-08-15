// src/screens/BalanceScreen.tsx
import { useState } from 'react'
import { BalanceMap } from '../components/BalanceMap'
import { BalanceQuiz } from '../components/BalanceQuiz'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { AREA_BY_ID, AREA_IDS } from '../data/areas'
import { NEED_BY_ID } from '../data/goals'
import { useAppState } from '../hooks/useAppState'
import { helpfulCards, neutralCards, personalManual, weekActivity, weekAverageDelta } from '../services/insights'
import {
  averageLevel,
  latestSnapshot,
  previousSnapshot,
  statusOf,
  strongestArea,
  unknownAreas,
  weakestAreas,
} from '../utils/balance'
import { longDate, shortDate, todayKey, weekdayShort } from '../utils/date'
import type { AreaId } from '../types'
import zielenImg from '../assets/anna/anna-zielen.webp'

interface Props {
  onAbout: () => void
  onNavigate: (tab: 'dzisiaj' | 'talia' | 'kalendarz' | 'balans') => void
}

export function BalanceScreen({ onAbout, onNavigate }: Props) {
  const { state, addSnapshot, loadDemo, resetAll, exportData } = useAppState()
  const [quizAreas, setQuizAreas] = useState<AreaId[] | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const snapshot = latestSnapshot(state.snapshots)
  const previous = previousSnapshot(state.snapshots)
  const today = todayKey()
  const updatedToday = snapshot?.date === today
  const missing = unknownAreas(snapshot?.levels ?? {})
  const weak = snapshot ? weakestAreas(snapshot.levels, 2) : []
  const strong = snapshot ? strongestArea(snapshot.levels) : null
  const activity = weekActivity(state)
  const maxActivity = Math.max(1, ...activity.map((a) => a.count))
  const avgDelta = weekAverageDelta(state)
  const helpful = helpfulCards(state)
  const neutral = neutralCards(state)
  const manual = personalManual(state)
  const recentCheckIns = [...state.checkIns].slice(-4).reverse()
  const currentAvg = snapshot ? averageLevel(snapshot.levels) : null
  const previousAvg = previous ? averageLevel(previous.levels) : null
  const trend = currentAvg !== null && previousAvg !== null ? currentAvg - previousAvg : null

  return (
    <div className="stack-lg">
      <header className="hero hero-slim" style={{ backgroundImage: `url(${zielenImg})`, backgroundPosition: 'center 24%' }}>
        <div className="hero-overlay">
          <p className="hero-eyebrow">Mapa Balansu</p>
          <h1 className="display hero-title">
            Twój obecny <em>balans</em>
          </h1>
          {snapshot && <p className="hero-sub">Ostatnie badanie: {longDate(snapshot.date)}</p>}
        </div>
      </header>

      {snapshot ? (
        <>
          <section className="surface stack">
            <BalanceMap levels={snapshot.levels} highlight={weak} />
            {missing.length > 0 && (
              <div className="row wrap">
                <span
                  className="area-dots"
                  role="img"
                  aria-label={`Do uzupełnienia: ${missing.map((id) => AREA_BY_ID[id].name).join(', ')}`}
                >
                  {missing.map((id) => (
                    <span key={id} className="area-dot" title={AREA_BY_ID[id].name}>
                      <Icon name={AREA_BY_ID[id].icon} size={14} />
                    </span>
                  ))}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuizAreas(missing)}
                >
                  <Icon name="PenLine" size={15} />
                  Uzupełnij
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onNavigate('talia')}
                  aria-label="Uzupełnij w talii"
                >
                  <Icon name="Layers" size={15} />
                  W talii
                </button>
              </div>
            )}
            <p className="tiny">Mapa Balansu jest narzędziem do autorefleksji, a nie testem medycznym.</p>
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
              <p className="tiny">Stąd zaczyna się dobór aktywacji.</p>
            </div>
            <div className="surface-quiet stack-sm">
              <p className="eyebrow">Twoja mocna strona</p>
              {strong ? (
                <>
                  <p className="h3" style={{ color: AREA_BY_ID[strong].color }}>
                    {AREA_BY_ID[strong].name}
                  </p>
                  <p className="tiny">
                    {statusOf(snapshot.levels[strong] as number)}. Warto z tego korzystać świadomie.
                  </p>
                </>
              ) : (
                <p className="tiny">Poznamy ją, gdy odpowiesz na kilka pytań w talii.</p>
              )}
            </div>
          </section>

          <section className="surface stack-sm">
            <p className="eyebrow">Ostatnie siedem dni</p>
            <div className="spark" role="img" aria-label="Aktywacje w ostatnich siedmiu dniach">
              {activity.map((day) => (
                <div key={day.date} className="spark-col">
                  <span
                    className="spark-bar"
                    style={{ height: `${Math.max(6, (day.count / maxActivity) * 100)}%` }}
                  />
                  <span className="tiny">{weekdayShort(day.date)}</span>
                </div>
              ))}
            </div>
            <p className="muted">
              {avgDelta === null
                ? 'Brak ocenionych aktywacji w tym tygodniu.'
                : `Średnia zmiana po aktywacji: ${avgDelta > 0 ? '+' : ''}${avgDelta.toFixed(1)} punktu.`}
            </p>
            {trend !== null && (
              <p className="muted">
                Średni poziom Mapy Balansu zmienił się o {trend > 0 ? '+' : ''}
                {trend} punktu od poprzedniego badania.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="surface stack">
          <p className="muted">Mapa powstaje sama, gdy przeglądasz talię.</p>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('talia')}>
            <Icon name="Layers" size={17} />
            Przejrzyj talię
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setQuizAreas(missing)}>
            Wolę odpowiedzieć na wszystkie pytania naraz
          </button>
        </section>
      )}

      <section className="surface stack-sm">
        <p className="eyebrow">Twoja osobista instrukcja obsługi</p>
        <ul className="bullets">
          {manual.map((rule) => (
            <li key={rule}>
              <Icon name="Sparkles" size={15} />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
        <p className="tiny">Z Twojej historii. Bez AI, bez zgadywania.</p>
      </section>

      <section className="grid-2">
        <div className="surface-quiet stack-sm">
          <p className="eyebrow">Pomagały najczęściej</p>
          {helpful.length === 0 ? (
            <p className="tiny">Za mało danych.</p>
          ) : (
            <ul className="mini-list">
              {helpful.map((c) => (
                <li key={c.cardId}>
                  <span className="grow">{c.title}</span>
                  <span className="pill">+{c.avgDelta.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="surface-quiet stack-sm">
          <p className="eyebrow">Bez zauważalnej zmiany</p>
          {neutral.length === 0 ? (
            <p className="tiny">Na razie brak takich kart.</p>
          ) : (
            <ul className="mini-list">
              {neutral.map((c) => (
                <li key={c.cardId}>
                  <span className="grow">{c.title}</span>
                  <span className="pill">{c.avgDelta.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="surface stack-sm">
        <p className="eyebrow">Ostatnie check-iny</p>
        {recentCheckIns.length === 0 ? (
          <p className="muted">Jeszcze nie było check-inu.</p>
        ) : (
          <ul className="mini-list">
            {recentCheckIns.map((c) => (
              <li key={c.id}>
                <span className="grow">{NEED_BY_ID[c.need].label}</span>
                <span className="tiny">
                  {shortDate(c.date)} · {c.minutes} min
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface stack-sm">
        <p className="eyebrow">Badanie</p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => setQuizAreas(AREA_IDS)}
          disabled={updatedToday}
        >
          <Icon name="RefreshCw" size={17} />
          Zaktualizuj Mapę Balansu
        </button>
        {updatedToday && (
          <p className="tiny">
            Mapę aktualizujemy najwyżej raz dziennie. Wróć jutro — zmiany potrzebują czasu.
          </p>
        )}
        <p className="tiny">Historia wyników: {state.snapshots.length}.</p>
      </section>

      <section className="surface stack-sm">
        <p className="eyebrow">Twoje dane</p>
        <p className="muted">
          <Icon name="Shield" size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Wszystko zostaje na tym urządzeniu.
        </p>
        <div className="stack-sm">
          <button type="button" className="btn btn-secondary btn-block" onClick={loadDemo}>
            <Icon name="Sparkles" size={16} />
            Załaduj dane demonstracyjne
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={exportData}>
            <Icon name="Download" size={16} />
            Eksportuj moje dane
          </button>
          {confirmDelete ? (
            <div className="stack-sm confirm-box">
              <p className="muted">Na pewno usunąć wszystkie dane? Tej operacji nie da się cofnąć.</p>
              <div className="row">
                <button
                  type="button"
                  className="btn btn-danger grow"
                  onClick={() => {
                    resetAll()
                    setConfirmDelete(false)
                  }}
                >
                  Tak, usuń
                </button>
                <button
                  type="button"
                  className="btn btn-secondary grow"
                  onClick={() => setConfirmDelete(false)}
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => setConfirmDelete(true)}
            >
              <Icon name="Trash2" size={16} />
              Usuń wszystkie dane
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-block" onClick={onAbout}>
            <Icon name="Info" size={16} />O metodzie i bezpieczeństwie
          </button>
        </div>
      </section>

      {quizAreas && (
        <Modal title="Mapa Balansu" onClose={() => setQuizAreas(null)}>
          <BalanceQuiz
            areas={quizAreas.length > 0 ? quizAreas : AREA_IDS}
            submitLabel="Zapisz wynik"
            onSubmit={(answers) => {
              addSnapshot({ ...(snapshot?.answers ?? {}), ...answers })
              setQuizAreas(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
