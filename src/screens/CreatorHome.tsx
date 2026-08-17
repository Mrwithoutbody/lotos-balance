// src/screens/CreatorHome.tsx
// Trasa "/": to samo wejście dla wszystkich, ale konto z rolą może przełączyć
// się na swój widok. Rola przychodzi z serwera; przełącznik tylko wybiera ekran.
import { CreatorScreen } from './CreatorScreen'
import { StartScreen } from './StartScreen'
import { ProfileSwitch } from '../components/ProfileSwitch'
import { InstallButton } from '../components/InstallButton'
import { useViewMode, useViewer } from '../services/viewer'

export function CreatorHome() {
  const viewer = useViewer()
  const view = useViewMode()
  const role = viewer.data?.role ?? 'user'

  // Bez roli albo w widoku praktyki wchodzi zwykła lista talii.
  if (role === 'user' || view === 'uzytkowniczka') {
    return <StartScreen switcher={role === 'user' ? null : <ProfileSwitch role={role} />} />
  }

  return (
    <div className="app">
      <header className="app-bar">
        <div className="app-bar-inner">
          <span className="brand-mark">LOTOS BALANCE</span>
          <ProfileSwitch role={role} />
        </div>
      </header>
      <main className="app-main">
        <div className="stack-lg">
          <CreatorScreen />
          <InstallButton />
        </div>
      </main>
    </div>
  )
}
