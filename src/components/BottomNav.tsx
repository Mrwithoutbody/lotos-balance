// src/components/BottomNav.tsx
import { Icon } from './Icon'

export type TabId = 'talia' | 'karty' | 'drzewo' | 'mapa' | 'postepy'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'talia', label: 'Talia', icon: 'Home' },
  { id: 'karty', label: 'Karty', icon: 'Layers' },
  { id: 'drzewo', label: 'Drzewo', icon: 'Milestone' },
  { id: 'mapa', label: 'Mapa', icon: 'Compass' },
  { id: 'postepy', label: 'Postępy', icon: 'Activity' },
]

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
}

/** Cztery strony: talia, karty z kalendarzem, Mapa Balansu, postępy. */
export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Nawigacja główna">
      <ul className="bottom-nav-list">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <li key={tab.id}>
              <button
                type="button"
                className={`nav-btn${isActive ? ' is-active' : ''}`}
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon name={tab.icon} size={21} strokeWidth={isActive ? 2.2 : 1.7} />
                <span>{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
