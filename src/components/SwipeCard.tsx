// src/components/SwipeCard.tsx
import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { SwipeDirection } from '../types'
import { Icon } from './Icon'

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
  // Pełna czytelność podpowiedzi na długo przed progiem — na mobile stemple
  // widoczne od pierwszych pikseli gestu, nie dopiero przy decyzji.
  const intent = flying ? 1 : Math.min(1, Math.abs(dx) / (THRESHOLD * 0.5))
  const edgeColor = dx > 0 ? '123, 154, 120' : '111, 97, 84'
  // Sztywno przy palcu w trakcie gestu; płynnie razem z kartą przy powrocie i wylocie.
  const stampTransition =
    flying || dx === 0 ? 'transform 0.22s ease, opacity 0.22s ease' : 'none'

  return (
    <div
      className={`swipe-card${flying ? ' is-flying' : ''}${dragging.current ? ' is-dragging' : ''}`}
      style={
        {
          transform: `translateX(${offset}px) rotate(${rotation}deg)`,
          transition: flying || dx === 0 ? 'transform 0.22s ease, opacity 0.22s ease' : 'none',
          opacity: flying ? 0 : 1,
          // Obwódka całej karty w kolorze kierunku — sygnał widoczny niezależnie
          // od tego, gdzie na karcie jest kciuk.
          boxShadow: dx !== 0 ? `0 0 0 3px rgba(${edgeColor}, ${0.25 + 0.65 * intent})` : undefined,
          borderRadius: 'var(--radius-lg)',
        } as CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="group"
      aria-label={label}
    >
      {/* Stemple wychodzą ze środka karty; lekki dryf w tył (25% ruchu)
          daje paralaksę bez uciekania poza kartę. Transition włącza się
          w tych samych momentach co na karcie — jeden ruch, zero skoków. */}
      <span
        className="swipe-stamp swipe-stamp-yes"
        style={{
          opacity: dx > 0 || flying === 'w-prawo' ? intent : 0,
          transform: `translateX(calc(-50% + ${(-offset * 0.25).toFixed(1)}px)) rotate(-6deg) scale(${0.85 + 0.25 * (dx > 0 ? intent : 0)})`,
          transition: stampTransition,
        }}
        aria-hidden="true"
      >
        <Icon name="Star" size={16} fill="currentColor" />
        Do ulubionych
      </span>
      <span
        className="swipe-stamp swipe-stamp-no"
        style={{
          opacity: dx < 0 || flying === 'w-lewo' ? intent : 0,
          transform: `translateX(calc(-50% + ${(-offset * 0.25).toFixed(1)}px)) rotate(6deg) scale(${0.85 + 0.25 * (dx < 0 ? intent : 0)})`,
          transition: stampTransition,
        }}
        aria-hidden="true"
      >
        <Icon name="Moon" size={16} />
        Pomiń
      </span>
      {children}
    </div>
  )
}
