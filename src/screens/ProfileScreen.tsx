// src/screens/ProfileScreen.tsx
// Profil: kim jesteś, w jakiej roli, na jakim koncie — i jak to zmienić.
// Jedno miejsce na konto i prawa do danych, żeby nie szukać ich po ekranach.
import { useState } from 'react'
import { AboutModal } from '../components/AboutModal'
import { LoginForm } from '../components/LoginForm'
import { Modal } from '../components/Modal'
import { Icon } from '../components/Icon'
import { ProfileSwitch } from '../components/ProfileSwitch'
import { useAppState } from '../hooks/useAppState'
import { signOut, useSession } from '../lib/auth-client'
import { navigate } from '../lib/router'
import { streak } from '../services/insights'
import { useViewer } from '../services/viewer'
import type { Role } from '../services/viewer'
import { daysLabel, exercisesLabel } from '../utils/format'

const ROLE_LABEL: Record<Role, string> = {
  user: 'Konto osobiste',
  creator: 'Twórczyni talii',
  specialist: 'Specjalistka',
}

export function ProfileScreen() {
  const session = useSession()
  const viewer = useViewer()
  const { state } = useAppState()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const loggedIn = Boolean(session.data)
  const email = session.data?.user.email
  const role = viewer.data?.role ?? 'user'
  const name = viewer.data?.name ?? session.data?.user.name
  const done = state.sessions.filter((s) => s.completed).length

  /** Przełączenie konta = wyjście z tego i logowanie innym, bez czyszczenia historii. */
  async function switchAccount() {
    await signOut()
    setLoginOpen(true)
  }

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <a
            className="brand-row"
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
            aria-label="Wróć do listy talii"
          >
            <span className="brand-mark">LOTOS BALANCE</span>
          </a>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/')}
          >
            <Icon name="X" size={16} />
            Zamknij
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="stack-lg">
          <section className="stack-sm">
            <p className="eyebrow">Profil</p>
            <h1 className="display">{name ?? 'Bez konta'}</h1>
            <div className="row wrap">
              <span className="pill">
                <Icon name={role === 'user' ? 'Home' : 'Layers'} size={13} />
                {ROLE_LABEL[role]}
              </span>
              {email && (
                <span className="pill">
                  <Icon name="BookOpen" size={13} />
                  {email}
                </span>
              )}
            </div>
          </section>

          {role !== 'user' && (
            <section className="stack-sm">
              <p className="eyebrow">Widok</p>
              <ProfileSwitch role={role} />
              <p className="tiny">
                Przełącznik zmienia tylko ekran. Uprawnienia wynikają z roli konta i sprawdza je
                serwer.
              </p>
            </section>
          )}

          <section className="stack-sm">
            <p className="eyebrow">Ta przeglądarka</p>
            <p className="muted">
              {done > 0
                ? `${exercisesLabel(done)} w historii${streak(state) > 0 ? `, ${daysLabel(streak(state))} z rzędu` : ''}.`
                : 'Jeszcze bez ukończonych ćwiczeń.'}
            </p>
            <p className="tiny">
              Historia żyje w tej przeglądarce niezależnie od konta — przełączenie konta jej nie
              kasuje ani nie przenosi.
            </p>
          </section>

          <section className="stack-sm">
            <p className="eyebrow">Konto</p>
            {loggedIn ? (
              <>
                <button type="button" className="btn btn-secondary btn-block" onClick={switchAccount}>
                  <Icon name="RefreshCw" size={16} />
                  Przełącz konto
                </button>
                <button type="button" className="btn btn-ghost btn-block" onClick={() => signOut()}>
                  <Icon name="LogOut" size={16} />
                  Wyloguj się
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => setLoginOpen(true)}
                >
                  <Icon name="LogIn" size={16} />
                  Zaloguj się
                </button>
                <p className="tiny">
                  Bez logowania wszystko działa, tylko historia zostaje na tym urządzeniu.
                </p>
              </>
            )}
          </section>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => setAboutOpen(true)}
          >
            <Icon name="Shield" size={16} />O metodzie i Twoich danych
          </button>
        </div>
      </main>

      {loginOpen && (
        <Modal title="Zaloguj się" onClose={() => setLoginOpen(false)}>
          <LoginForm callbackURL="/profil" />
        </Modal>
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
