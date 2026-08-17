// src/screens/LoginScreen.tsx
// Trasa /logowanie — pełny ekran dla wejść z zewnątrz (stary link, zakładka).
// W aplikacji logowanie otwiera się modalem z profilu.
import { LoginForm } from '../components/LoginForm'
import { navigate } from '../lib/router'

export function LoginScreen() {
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
          >
            <span className="brand-mark">LOTOS BALANCE</span>
          </a>
        </div>
      </header>

      <main className="app-main">
        <section className="surface stack">
          <h1 className="h1">Zaloguj się</h1>
          <LoginForm callbackURL="/profil" />
        </section>
      </main>
    </div>
  )
}
