// src/components/ProfileSwitch.tsx
// Przełącznik widoku dla kont z rolą. Zwykła użytkowniczka go nie widzi,
// bo nie ma czego przełączać — a przełączenie i tak niczego nie odblokowuje,
// dostęp daje wyłącznie rola sprawdzana na serwerze.
import { setViewMode, useViewMode } from '../services/viewer'
import type { Role } from '../services/viewer'
import { Icon } from './Icon'

const LABEL: Record<Exclude<Role, 'user'>, string> = {
  creator: 'Twórczyni',
  specialist: 'Specjalistka',
}

export function ProfileSwitch({ role }: { role: Role }) {
  const view = useViewMode()
  if (role === 'user') return null

  return (
    <div className="profile-switch" role="group" aria-label="Widok profilu">
      <button
        type="button"
        className={`profile-switch-btn${view === 'uzytkowniczka' ? ' is-active' : ''}`}
        aria-pressed={view === 'uzytkowniczka'}
        onClick={() => setViewMode('uzytkowniczka')}
      >
        <Icon name="Home" size={14} />
        Moja praktyka
      </button>
      <button
        type="button"
        className={`profile-switch-btn${view === 'tworczyni' ? ' is-active' : ''}`}
        aria-pressed={view === 'tworczyni'}
        onClick={() => setViewMode('tworczyni')}
      >
        <Icon name="Layers" size={14} />
        {LABEL[role]}
      </button>
    </div>
  )
}
