// src/components/BottomNav.tsx
import { Icon } from './Icon'

export type TabId = 'dzisiaj' | 'talia' | 'kalendarz' | 'balans'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dzisiaj', label: 'Dzisiaj', icon: 'Home' },
  { id: 'talia', label: 'Talia', icon: 'Layers' },
  { id: 'kalendarz', label: 'Kalendarz', icon: 'CalendarDays' },
  { id: 'balans', label: 'Balans', icon: 'Compass' },
]

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
}

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
