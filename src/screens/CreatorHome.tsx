// src/screens/CreatorHome.tsx
// Trasa "/": to samo wejście dla wszystkich, ale konto z rolą może przełączyć
// się na swój widok. Rola przychodzi z serwera; przełącznik tylko wybiera ekran.
import { CreatorScreen } from './CreatorScreen'
import { StartScreen } from './StartScreen'
import { AppBar } from '../components/AppBar'
import { ProfileSwitch } from '../components/ProfileSwitch'
import { Icon } from '../components/Icon'
import { InstallButton } from '../components/InstallButton'
import { navigate } from '../lib/router'
import { useViewMode, useViewer } from '../services/viewer'

export function CreatorHome() {
  const viewer = useViewer()
  const view = useViewMode()
  const role = viewer.data?.role ?? 'user'

  // Bez roli albo w widoku praktyki wchodzi zwykła lista talii.
  if (role === 'user' || view === 'uzytkowniczka') {
    return <StartScreen />
  }

  return (
    <div className="app">
      <AppBar>
        <ProfileSwitch role={role} />
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/profil')}
          aria-label="Profil"
        >
          <Icon name="UserRound" size={18} />
        </button>
      </AppBar>
      <main className="app-main">
        <div className="stack-lg">
          <CreatorScreen />
          <InstallButton />
        </div>
      </main>
    </div>
  )
}
