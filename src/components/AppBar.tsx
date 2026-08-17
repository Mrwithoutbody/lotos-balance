// src/components/AppBar.tsx
// Górny pasek: marka wraca do listy talii, po prawej akcje ekranu.
// Jeden komponent, bo wcześniej ten sam nagłówek stał w pięciu plikach.
import type { ReactNode } from 'react'
import { navigate } from '../lib/router'

interface Props {
  /** Druga linia marki — np. nazwa twórczyni otwartej talii. */
  sub?: string
  /** Akcje po prawej stronie paska. */
  children?: ReactNode
}

export function AppBar({ sub, children }: Props) {
  return (
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
          {sub && <span className="brand-sub">{sub}</span>}
        </a>
        {children && <div className="row">{children}</div>}
      </div>
    </header>
  )
}
