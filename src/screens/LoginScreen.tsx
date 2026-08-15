// src/screens/LoginScreen.tsx
// Logowanie bez hasła: e-mail → link w skrzynce. Konto powstaje przy pierwszym
// wejściu w link — osobna rejestracja nie istnieje. Google dojdzie po kluczach OAuth.
import { useState } from 'react'
import { Icon } from '../components/Icon'
import { signIn } from '../lib/auth-client'
import { navigate } from '../lib/router'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await signIn.magicLink({ email: email.trim(), callbackURL: '/' })
    setBusy(false)
    if (res.error) setError('Nie udało się wysłać linku. Spróbuj za chwilę.')
    else setSent(true)
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
          >
            <span className="brand-mark">LOTOS BALANCE</span>
            <span className="brand-sub">krąg</span>
          </a>
        </div>
      </header>

      <main className="app-main">
        <div className="stack-lg">
          {sent ? (
            <section className="surface stack-sm center">
              <h1 className="h1">Sprawdź skrzynkę.</h1>
              <p className="muted">
                Wysłałyśmy link do logowania na {email.trim()}. Kliknij go — i już.
              </p>
            </section>
          ) : (
            <section className="surface stack">
              <h1 className="h1">Zaloguj się</h1>
              <p className="muted">
                Bez hasła: dostaniesz link na e-mail. Pierwsze logowanie zakłada konto.
              </p>
              <form className="stack-sm" onSubmit={submit}>
                <input
                  type="email"
                  className="input"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  aria-label="Adres e-mail"
                />
                <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                  <Icon name="Sparkles" size={16} />
                  {busy ? 'Wysyłanie…' : 'Wyślij link do logowania'}
                </button>
              </form>
              {error && <p className="caution">{error}</p>}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
