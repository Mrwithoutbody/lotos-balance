// src/components/AboutModal.tsx
import { BRAIN_STEPS, SOURCES } from '../data/brain'
import { Icon } from './Icon'
import { Modal } from './Modal'

interface Props {
  onClose: () => void
}

export function AboutModal({ onClose }: Props) {
  return (
    <Modal title="O metodzie" onClose={onClose}>
      <div className="stack-lg">
        <section className="stack-sm">
          <p className="eyebrow">Jak to działa</p>
          <p className="muted">
            Najpierw poznajesz swój balans w siedmiu obszarach. Potem aplikacja dobiera krótkie
            ćwiczenia do Twojej aktualnej potrzeby, dostępnego czasu i wcześniejszych reakcji.
            Personalizacja nie oznacza losowych porad — oznacza dobór sprawdzonych ćwiczeń do
            konkretnej osoby.
          </p>
        </section>

        <section className="stack-sm">
          <p className="eyebrow">Mózg na lata</p>
          <p className="muted">Moduł opiera się na czterech filarach codziennych nawyków:</p>
          <ul className="bullets">
            {BRAIN_STEPS.map((s) => (
              <li key={s.pillar}>
                <Icon name={s.icon} size={15} color={s.color} />
                <span>
                  <strong>{s.pillarLabel}</strong> — {s.hint}
                </span>
              </li>
            ))}
          </ul>
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

        <p className="tiny">
          Wszystkie dane zostają na Twoim urządzeniu, w pamięci przeglądarki. Nic nie jest wysyłane
          na zewnętrzne serwery.
        </p>
      </div>
    </Modal>
  )
}
