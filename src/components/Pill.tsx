// src/components/Pill.tsx
// Plakietka z ikoną — jedyny sposób podawania metadanych karty (obszar, czas, pora).
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  icon: string
  /** Kolor obszaru; bez niego pigułka jest neutralna. */
  color?: string
  children: ReactNode
}

export function Pill({ icon, color, children }: Props) {
  return (
    <span className="pill" style={color ? { color } : undefined}>
      <Icon name={icon} size={13} />
      {children}
    </span>
  )
}
