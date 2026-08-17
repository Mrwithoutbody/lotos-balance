// src/components/Modal.tsx
// Natywny <dialog> + showModal(): ::backdrop, Escape, focus trap, przywrócenie
// focusu i bezwładność tła robi przeglądarka. Blokadę scrolla robi CSS
// (body:has(dialog[open])), więc nie zostaje tu żaden ręczny listener.
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  /** Pełny ekran zamiast arkusza od dołu — używane przy wykonywaniu karty. */
  fullscreen?: boolean
  footer?: ReactNode
}

export function Modal({ title, onClose, children, fullscreen, footer }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="modal-backdrop"
      aria-label={title}
      onCancel={onClose}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal${fullscreen ? ' modal-full' : ''}`}>
        <header className="modal-header">
          <h2 className="h2">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zamknij">
            <Icon name="X" size={20} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </div>
    </dialog>
  )
}
