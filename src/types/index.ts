// src/types/index.ts

/** Siedem obszarów prostego modelu człowieka. */
export type AreaId =
  | 'emocje'
  | 'regeneracja'
  | 'umysl'
  | 'dzialanie'
  | 'cialo'
  | 'relacje'
  | 'sens'

/** Potrzeba deklarowana w check-inie („Czego najbardziej potrzebujesz teraz?”). */
export type NeedId =
  | 'uspokojenie'
  | 'energia'
  | 'skupienie'
  | 'odwaga'
  | 'ulga'
  | 'kontakt-z-cialem'
  | 'kontakt-z-czlowiekiem'
  | 'kierunek'

/** Czas trwania aktywacji w minutach. */
export type Minutes = 3 | 7 | 15

/** Poziom energii potrzebny, aby wykonać kartę. */
export type EnergyLevel = 'niska' | 'srednia' | 'wysoka'

/** Skala samooceny 1–5 używana w check-inie i przy aktywacji. */
export type Scale5 = 1 | 2 | 3 | 4 | 5

/** Status obszaru wyliczany z poziomu 0–100. */
export type AreaStatus = 'potrzebuje wsparcia' | 'stabilny' | 'mocna strona'

/** Filary modułu „Mózg na lata”. */
export type BrainPillar = 'ruch' | 'regeneracja' | 'wyzwanie' | 'relacje'

/** Statyczna definicja obszaru balansu. */
export interface BalanceArea {
  id: AreaId
  name: string
  icon: string
  color: string
  /** Delikatniejszy odcień używany jako tło. */
  softColor: string
  /** Pytanie z Mapy Balansu (skala 1–5, ostatnie 7 dni). */
  question: string
}

/**
 * Zapis Mapy Balansu. Buduje się stopniowo — obszar bez odpowiedzi
 * pozostaje nieznany, zamiast być zgadywany.
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

/** Kierunek gestu na stosie kart. */
export type SwipeDirection = 'w-lewo' | 'w-prawo'

/**
 * Reakcja na ćwiczenie w programie. „W prawo” to sygnał, że temat jest na czasie,
 * „w lewo” — że nie teraz. Oba zdejmują kartę, ale znaczą co innego.
 */
export interface Swipe {
  id: string
  cardId: string
  area: AreaId
  direction: SwipeDirection
  date: string
  createdAt: string
}

/**
 * Ćwiczenie z programu. Bez własnego koloru — barwa idzie z obszaru
 * (AREA_BY_ID[area].color), więc nie da się jej rozjechać z mapą balansu.
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
  /** Bezpieczne zastrzeżenie pokazywane w trybie skupienia. */
  caution?: string
}

/** Krótki check-in „czego potrzebuję teraz”. */
export interface DailyCheckIn {
  id: string
  date: string
  createdAt: string
  need: NeedId
  minutes: Minutes
  state?: Scale5
}

/** Wykonanie ćwiczenia wraz z oceną przed i po. */
export interface ActivationSession {
  id: string
  cardId: string
  /** Program, z którego pochodzi ćwiczenie. Brak = wpis z czasów jednego programu. */
  creatorSlug?: string
  date: string
  /** Czytane przez „instrukcję obsługi” — z niego bierze się pora dnia. */
  startedAt: string
  before: Scale5
  after?: Scale5
  completed: boolean
}

/** Ćwiczenie zaplanowane na konkretny dzień. */
export interface CalendarEntry {
  id: string
  /** Data w formacie YYYY-MM-DD. */
  date: string
  cardId: string
  /**
   * Program, w którym zaplanowano ćwiczenie — bez tego wpisu z innego programu
   * nie da się rozpoznać, bo id ćwiczeń są unikalne tylko w obrębie programu.
   * Brak = wpis sprzed wielu programów.
   */
  creatorSlug?: string
  done: boolean
  createdAt: string
}

/** Cały stan aplikacji zapisywany w localStorage. */
export interface AppState {
  snapshots: BalanceSnapshot[]
  checkIns: DailyCheckIn[]
  sessions: ActivationSession[]
  calendar: CalendarEntry[]
  favorites: string[]
  swipes: Swipe[]
  /** Dni, w których wykonano krok „Mózg na lata” (YYYY-MM-DD). */
  brainSteps: string[]
}
