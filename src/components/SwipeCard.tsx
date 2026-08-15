// src/components/SwipeCard.tsx
import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { SwipeDirection } from '../types'

interface Props {
  children: ReactNode
  onSwipe: (direction: SwipeDirection) => void
  /** Opis dla czytników ekranu — gest ma też odpowiedniki na przyciskach. */
  label: string
}

const THRESHOLD = 88

/**
 * Karta reagująca na przeciągnięcie palcem lub myszą.
 * W prawo znaczy „to o mnie”, w lewo „nie teraz” — oba zdejmują kartę ze stosu.
 */
export function SwipeCard({ children, onSwipe, label }: Props) {
  const [dx, setDx] = useState(0)
  const [flying, setFlying] = useState<SwipeDirection | null>(null)
  const startX = useRef(0)
  const dragging = useRef(false)

  function commit(direction: SwipeDirection) {
    if (flying) return
    setFlying(direction)
    window.setTimeout(() => {
      setFlying(null)
      setDx(0)
      onSwipe(direction)
    }, 220)
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (flying) return
    // Nie przechwytujemy gestu rozpoczętego na przycisku wewnątrz karty.
    if ((e.target as HTMLElement).closest('button')) return
    dragging.current = true
    startX.current = e.clientX
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Niektóre urządzenia nie pozwalają przechwycić wskaźnika — gest działa dalej.
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    setDx(e.clientX - startX.current)
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    if (dx > THRESHOLD) commit('w-prawo')
    else if (dx < -THRESHOLD) commit('w-lewo')
    else setDx(0)
  }

  const offset = flying ? (flying === 'w-prawo' ? 520 : -520) : dx
  const rotation = offset / 22
  const intent = Math.min(1, Math.abs(dx) / THRESHOLD)

  return (
    <div
      className={`swipe-card${flying ? ' is-flying' : ''}${dragging.current ? ' is-dragging' : ''}`}
      style={{
        transform: `translateX(${offset}px) rotate(${rotation}deg)`,
        transition: flying || dx === 0 ? 'transform 0.22s ease, opacity 0.22s ease' : 'none',
        opacity: flying ? 0 : 1,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="group"
      aria-label={label}
    >
      <span
        className="swipe-stamp swipe-stamp-yes"
        style={{ opacity: dx > 12 ? intent : 0 }}
        aria-hidden="true"
      >
        To o mnie
      </span>
      <span
        className="swipe-stamp swipe-stamp-no"
        style={{ opacity: dx < -12 ? intent : 0 }}
        aria-hidden="true"
      >
        Nie teraz
      </span>
      {children}
    </div>
  )
}
