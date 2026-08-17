// src/components/AboutModal.tsx
// Jedyne miejsce z zastrzeżeniami, źródłami i prawami do danych (eksport, usunięcie).
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState'
import { exportState } from '../services/storage'
import { Icon } from './Icon'
import { Modal } from './Modal'

interface Props {
  onClose: () => void
}

const SOURCES = [
  {
    label: 'The Lancet Commission / UCL — 14 modyfikowalnych czynników ryzyka',
    url: 'https://www.ucl.ac.uk/news/2024/jul/nearly-half-dementia-cases-could-be-prevented-or-delayed-tackling-14-risk-factors',
  },
  {
    label: 'US POINTER / JAMA — badanie nad stylem życia a funkcjami poznawczymi',
    url: 'https://jamanetwork.com/journals/jama/fullarticle/2837046',
  },
  {
    label: 'Brain Care Score / Mass General Brigham — jak dbać o zdrowie mózgu',
    url: 'https://www.massgeneralbrigham.org/en/about/newsroom/articles/improve-your-brain-health',
  },
]

export function AboutModal({ onClose }: Props) {
  const { state, resetAll } = useAppState()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Modal title="O metodzie" onClose={onClose}>
      <div className="stack-lg">
        <section className="stack-sm">
          <p className="eyebrow">Jak to działa</p>
          <p className="muted">
            Codziennie jedno krótkie ćwiczenie z programu twórczyni. Aplikacja podaje najkrótsze
            ćwiczenia i pomija te, które zrobiłaś dziś. Bez AI, bez losowania.
          </p>
        </section>

        <section className="stack-sm notice">
          <p className="h3">Ważne ograniczenia</p>
          <p className="muted">
            Aplikacja wspiera codzienne nawyki związane z wellbeingiem i zdrowiem mózgu. Nie
            diagnozuje zaburzeń psychicznych, łagodnych zaburzeń poznawczych ani demencji. Jeśli
            zauważasz postępujące problemy z pamięcią lub codziennym funkcjonowaniem, skontaktuj się
            z lekarzem.
          </p>
        </section>

        <section className="stack-sm notice notice-urgent">
          <p className="h3">Gdy potrzebujesz pilnej pomocy</p>
          <p className="muted">
            Jeśli znajdujesz się w bezpośrednim zagrożeniu, skontaktuj się z numerem 112. Aplikacja
            nie zastępuje lekarza, psychologa ani pomocy kryzysowej.
          </p>
        </section>

        <section className="stack-sm">
          <p className="eyebrow">Źródła</p>
          <ul className="bullets">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <Icon name="BookOpen" size={15} />
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="stack-sm">
          <p className="eyebrow">Twoje dane</p>
          <p className="muted">
            <Icon name="Shield" size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            Historia ukończonych ćwiczeń zostaje w pamięci przeglądarki na tym urządzeniu. Jeśli się
            zalogujesz, tytuł ćwiczenia i data trafiają dodatkowo do naszej bazy w Unii Europejskiej.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => exportState(state)}
          >
            <Icon name="Download" size={16} />
            Eksportuj moje dane
          </button>
          {confirmDelete ? (
            <div className="stack-sm confirm-box">
              <p className="muted">Na pewno usunąć wszystkie dane? Tej operacji nie da się cofnąć.</p>
              <div className="row">
                <button
                  type="button"
                  className="btn btn-danger grow"
                  onClick={() => {
                    resetAll()
                    setConfirmDelete(false)
                  }}
                >
                  Tak, usuń
                </button>
                <button
                  type="button"
                  className="btn btn-secondary grow"
                  onClick={() => setConfirmDelete(false)}
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => setConfirmDelete(true)}
            >
              <Icon name="Trash2" size={16} />
              Usuń wszystkie dane
            </button>
          )}
        </section>
      </div>
    </Modal>
  )
}
