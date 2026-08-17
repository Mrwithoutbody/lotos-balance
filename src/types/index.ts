// src/types/index.ts

/** Siedem obszarów prostego modelu człowieka — dziś tylko kolor i ikona ćwiczenia. */
export type AreaId =
  | 'emocje'
  | 'regeneracja'
  | 'umysl'
  | 'dzialanie'
  | 'cialo'
  | 'relacje'
  | 'sens'

/** Potrzeba, do której twórczyni przypisuje ćwiczenie w programie. */
export type NeedId =
  | 'uspokojenie'
  | 'energia'
  | 'skupienie'
  | 'odwaga'
  | 'ulga'
  | 'kontakt-z-cialem'
  | 'kontakt-z-czlowiekiem'
  | 'kierunek'

/**
 * Kierunek gestu na karcie dnia.
 * „w-lewo” = nie czuję się z tym dobrze (temat schodzi z drogi na dwa tygodnie),
 * „w-prawo” = fajne, ale nie teraz (karta wraca kolejnego dnia).
 */
export type SwipeDirection = 'w-lewo' | 'w-prawo'

/** Reakcja na kartę dnia. Nic nie ocenia użytkowniczki — steruje kolejką. */
export interface Swipe {
  id: string
  cardId: string
  direction: SwipeDirection
  date: string
}

/** Skala samooceny 1–5 w pytaniach Mapy Balansu. */
export type Scale5 = 1 | 2 | 3 | 4 | 5

/** Status obszaru wyliczany z poziomu 0–100. */
export type AreaStatus = 'potrzebuje wsparcia' | 'stabilny' | 'mocna strona'

/**
 * Zapis Mapy Balansu. Buduje się z odpowiedzi użytkowniczki — nigdy z kliknięć
 * ani z tego, co wykonała. Obszar bez odpowiedzi pozostaje nieznany.
 */
export interface BalanceSnapshot {
  id: string
  /** Data w formacie YYYY-MM-DD. */
  date: string
  createdAt: string
  /** Surowe odpowiedzi 1–5, tylko dla poznanych obszarów. */
  answers: Partial<Record<AreaId, Scale5>>
  /** Odpowiedzi przeliczone liniowo na 0–100. */
  levels: Partial<Record<AreaId, number>>
}

/** Czas trwania ćwiczenia w minutach. */
export type Minutes = 3 | 7 | 15

/** Poziom energii potrzebny, aby wykonać ćwiczenie. */
export type EnergyLevel = 'niska' | 'srednia' | 'wysoka'

/** Statyczna definicja obszaru. */
export interface BalanceArea {
  id: AreaId
  name: string
  icon: string
  color: string
  /** Delikatniejszy odcień używany jako tło. */
  softColor: string
  /** Pytanie opisujące obszar — dziś nieużywane w UI, zostaje przy danych. */
  question: string
}

/**
 * Ćwiczenie z programu. Bez własnego koloru — barwa idzie z obszaru
 * (AREA_BY_ID[area].color).
 */
export interface ActivationCard {
  id: string
  title: string
  area: AreaId
  secondaryArea?: AreaId
  icon: string
  minutes: Minutes
  energy: EnergyLevel
  needs: NeedId[]
  description: string
  steps: string[]
  why: string
  /** Bezpieczne zastrzeżenie pokazywane przy ćwiczeniu. */
  caution?: string
}

/** Ukończone ćwiczenie. Bez ocen samopoczucia — aplikacja o nie nie pyta. */
export interface ActivationSession {
  id: string
  cardId: string
  /** Program, z którego pochodzi ćwiczenie. Brak = wpis z czasów jednego programu. */
  creatorSlug?: string
  date: string
  startedAt: string
  completed: boolean
}

/** Ćwiczenie zaplanowane na konkretny dzień. */
export interface CalendarEntry {
  id: string
  /** Data w formacie YYYY-MM-DD. */
  date: string
  cardId: string
  done: boolean
  createdAt: string
}

/** Cały stan aplikacji zapisywany w localStorage. */
export interface AppState {
  /** Dzień pierwszego wejścia do talii — od niego liczy się rozkład kart w czasie. */
  deckStart?: string
  snapshots: BalanceSnapshot[]
  sessions: ActivationSession[]
  calendar: CalendarEntry[]
  swipes: Swipe[]
}
