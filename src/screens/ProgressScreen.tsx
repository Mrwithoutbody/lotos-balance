// src/screens/ProgressScreen.tsx
// Postępy: seria dni, ostatnie siedem dni i historia. Liczby wyłącznie z tego,
// co użytkowniczka faktycznie wykonała.
import { Icon } from '../components/Icon'
import { AREA_BY_ID } from '../data/areas'
import { useAppState } from '../hooks/useAppState'
import { signOut, useSession } from '../lib/auth-client'
import { navigate } from '../lib/router'
import { useProgram } from '../hooks/useProgram'
import { streak, weekActivity } from '../services/insights'
import { longDate, weekdayShort } from '../utils/date'
import { daysLabel, exercisesLabel } from '../utils/format'

interface Props {
  onAbout: () => void
}

export function ProgressScreen({ onAbout }: Props) {
  const { state } = useAppState()
  const loggedIn = Boolean(useSession().data)
  const program = useProgram()

  const done = state.sessions.filter((s) => s.completed)
  const days = streak(state)
  const activity = weekActivity(state)
  const maxActivity = Math.max(1, ...activity.map((a) => a.count))
  const history = [...done].reverse().slice(0, 10)

  return (
    <div className="stack-lg">
      <section className="stack-sm">
        <p className="eyebrow">Postępy</p>
        <h1 className="display">
          {exercisesLabel(done.length)}
        </h1>
        {days > 0 && (
          <p className="muted">
            <Icon name="Flame" size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {daysLabel(days)} z rzędu
          </p>
        )}
      </section>

      {done.length > 0 && (
        <section className="surface stack-sm">
          <p className="eyebrow">Ostatnie siedem dni</p>
          <div className="spark" role="img" aria-label="Ćwiczenia w ostatnich siedmiu dniach">
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
        </section>
      )}

      {history.length > 0 ? (
        <section className="surface stack-sm">
          <p className="eyebrow">Historia</p>
          <ul className="entry-list">
            {history.map((s) => {
              const card = program.cards.find((c) => c.id === s.cardId)
              const area = card ? AREA_BY_ID[card.area] : undefined
              return (
                <li key={s.id} className="entry-row">
                  {area && (
                    <span
                      className="balance-icon"
                      style={{ background: area.softColor, color: area.color }}
                    >
                      <Icon name={card!.icon} size={15} />
                    </span>
                  )}
                  <span className="grow">
                    <span className="entry-title">{card?.title ?? 'Ćwiczenie z innej talii'}</span>
                    <span className="tiny">{longDate(s.date)}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <p className="muted">Tu pojawi się historia po pierwszym ukończonym ćwiczeniu.</p>
      )}

      <section className="stack-sm">
        <p className="eyebrow">Twoje konto</p>
        <p className="muted">
          {loggedIn
            ? 'Ukończone ćwiczenia zapisują się też w naszej bazie w Unii Europejskiej.'
            : 'Bez logowania historia żyje tylko w tej przeglądarce.'}
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={() => (loggedIn ? signOut() : navigate('/logowanie'))}
        >
          <Icon name={loggedIn ? 'LogOut' : 'LogIn'} size={16} />
          {loggedIn ? 'Wyloguj się' : 'Zaloguj się'}
        </button>
      </section>

      <button type="button" className="btn btn-ghost btn-block" onClick={onAbout}>
        <Icon name="Info" size={16} />O metodzie i Twoich danych
      </button>
    </div>
  )
}
