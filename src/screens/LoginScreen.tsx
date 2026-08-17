// src/screens/LoginScreen.tsx
// Trasa /logowanie — pełny ekran dla wejść z zewnątrz (stary link, zakładka).
// W aplikacji logowanie otwiera się modalem z profilu.
import { AppBar } from '../components/AppBar'
import { LoginForm } from '../components/LoginForm'

export function LoginScreen() {
  return (
    <div className="app">
      <AppBar />

      <main className="app-main">
        <section className="surface stack">
          <h1 className="h1">Zaloguj się</h1>
          <LoginForm callbackURL="/profil" />
        </section>
      </main>
    </div>
  )
}
