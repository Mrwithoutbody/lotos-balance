// src/screens/LoginScreen.tsx
// Logowanie bez hasła: e-mail → link w skrzynce. Konto powstaje przy pierwszym
// wejściu w link — osobna rejestracja nie istnieje. Google dojdzie po kluczach OAuth.
import { useState } from 'react'
import { Icon } from '../components/Icon'
import { signIn } from '../lib/auth-client'
import { navigate } from '../lib/router'

/** Znak G Google — lucide nie ma ikon marek, a wytyczne Google wymagają oryginału. */
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

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
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
              >
                <GoogleMark />
                Zaloguj przez Google
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
