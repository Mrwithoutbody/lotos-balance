// src/data/achievements.ts
// Drzewo osiągnięć: co można odblokować i gdzie to leży na planszy.
// Warunki są deterministyczne — liczone z historii, nigdy z klikania po apce.
import type { AppState } from '../types/index.ts'

export interface Achievement {
  id: string
  title: string
  /** Co trzeba zrobić — pokazywane też, gdy węzeł jest jeszcze zamknięty. */
  hint: string
  icon: string
  /** Węzły, które muszą być zdobyte, żeby ten w ogóle się odsłonił. */
  after: string[]
  /** Pozycja na planszy w procentach, jak w drzewku umiejętności. */
  x: number
  y: number
  done: (s: Stats) => boolean
}

/** Policzone raz wejście dla wszystkich warunków — węzły nie liczą same. */
export interface Stats {
  ukonczone: number
  seria: number
  dni: number
  obszary: Set<string>
  pory: Set<string>
  dlugie: number
  badania: number
  najwiecejWDniu: number
  powrot: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'start',
    title: 'Pierwszy krok',
    hint: 'Ukończ pierwsze ćwiczenie.',
    icon: 'Play',
    after: [],
    x: 50,
    y: 8,
    done: (s) => s.ukonczone >= 1,
  },
  {
    id: 'seria-3',
    title: 'Trzy dni',
    hint: 'Ćwicz trzy dni z rzędu.',
    icon: 'Flame',
    after: ['start'],
    x: 26,
    y: 24,
    done: (s) => s.seria >= 3,
  },
  {
    id: 'seria-7',
    title: 'Tydzień',
    hint: 'Ćwicz siedem dni z rzędu.',
    icon: 'Sunrise',
    after: ['seria-3'],
    x: 14,
    y: 42,
    done: (s) => s.seria >= 7,
  },
  {
    id: 'seria-30',
    title: 'Miesiąc',
    hint: 'Trzydzieści dni z rzędu.',
    icon: 'Target',
    after: ['seria-7'],
    x: 10,
    y: 62,
    done: (s) => s.seria >= 30,
  },
  {
    id: 'rano',
    title: 'Ranna',
    hint: 'Zrób ćwiczenie przed południem.',
    icon: 'Sun',
    after: ['start'],
    x: 74,
    y: 24,
    done: (s) => s.pory.has('rano'),
  },
  {
    id: 'wieczor',
    title: 'Wieczorna',
    hint: 'Zrób ćwiczenie po osiemnastej.',
    icon: 'Moon',
    after: ['start'],
    x: 88,
    y: 40,
    done: (s) => s.pory.has('wieczór'),
  },
  {
    id: 'cala-doba',
    title: 'O każdej porze',
    hint: 'Ćwicz rano, po południu i wieczorem.',
    icon: 'Compass',
    after: ['rano', 'wieczor'],
    x: 78,
    y: 58,
    done: (s) => s.pory.size >= 3,
  },
  {
    id: 'trzy-obszary',
    title: 'Trzy strony',
    hint: 'Ćwiczenia z trzech różnych obszarów.',
    icon: 'Layers',
    after: ['start'],
    x: 50,
    y: 30,
    done: (s) => s.obszary.size >= 3,
  },
  {
    id: 'siedem-obszarow',
    title: 'Pełne koło',
    hint: 'Po ćwiczeniu z każdego z siedmiu obszarów.',
    icon: 'CircleDot',
    after: ['trzy-obszary'],
    x: 50,
    y: 50,
    done: (s) => s.obszary.size >= 7,
  },
  {
    id: 'dlugie',
    title: 'Dłuższa chwila',
    hint: 'Ukończ ćwiczenie piętnastominutowe.',
    icon: 'Timer',
    after: ['trzy-obszary'],
    x: 34,
    y: 46,
    done: (s) => s.dlugie >= 1,
  },
  {
    id: 'dzien-pelny',
    title: 'Cały dzień',
    hint: 'Zrób wszystkie trzy karty jednego dnia.',
    icon: 'CheckCircle2',
    after: ['trzy-obszary'],
    x: 64,
    y: 44,
    done: (s) => s.najwiecejWDniu >= 3,
  },
  {
    id: 'dziesiec',
    title: 'Dziesięć ćwiczeń',
    hint: 'Ukończ dziesięć ćwiczeń.',
    icon: 'Sparkles',
    after: ['siedem-obszarow'],
    x: 38,
    y: 70,
    done: (s) => s.ukonczone >= 10,
  },
  {
    id: 'piecdziesiat',
    title: 'Pięćdziesiąt',
    hint: 'Ukończ pięćdziesiąt ćwiczeń.',
    icon: 'Star',
    after: ['dziesiec'],
    x: 32,
    y: 88,
    done: (s) => s.ukonczone >= 50,
  },
  {
    id: 'mapa',
    title: 'Mapa Balansu',
    hint: 'Wypełnij badanie siedmiu obszarów.',
    icon: 'PenLine',
    after: ['start'],
    x: 64,
    y: 70,
    done: (s) => s.badania >= 1,
  },
  {
    id: 'mapa-2',
    title: 'Zmiana w czasie',
    hint: 'Powtórz badanie innego dnia.',
    icon: 'Activity',
    after: ['mapa'],
    x: 72,
    y: 86,
    done: (s) => s.badania >= 2,
  },
  {
    id: 'powrot',
    title: 'Powrót',
    hint: 'Wróć do ćwiczeń po tygodniu przerwy.',
    icon: 'RefreshCw',
    after: ['start'],
    x: 88,
    y: 14,
    done: (s) => s.powrot,
  },
]

/** Skąd warunki wiedzą, czym była wykonana karta — talia mieszka poza stanem. */
export type CardLookup = (cardId: string) => { area: string; minutes: number } | undefined

/** Wszystko, czego potrzebują warunki — jedno przejście po historii. */
export function statsFrom(state: AppState, card: CardLookup): Stats {
  const done = state.sessions.filter((s) => s.completed)
  const perDay = new Map<string, number>()
  const obszary = new Set<string>()
  const pory = new Set<string>()

  let dlugie = 0
  for (const s of done) {
    perDay.set(s.date, (perDay.get(s.date) ?? 0) + 1)
    const info = card(s.cardId)
    if (info) {
      obszary.add(info.area)
      if (info.minutes >= 15) dlugie += 1
    }
    const h = new Date(s.startedAt).getHours()
    pory.add(h < 12 ? 'rano' : h < 18 ? 'popołudnie' : 'wieczór')
  }

  const dni = [...perDay.keys()].sort()
  let seria = 0
  let biezaca = 0
  for (let i = 0; i < dni.length; i += 1) {
    const dzien = new Date(`${dni[i]}T00:00:00`)
    const poprzedni = i > 0 ? new Date(`${dni[i - 1]}T00:00:00`) : null
    const odstep = poprzedni ? Math.round((+dzien - +poprzedni) / 86400000) : null
    biezaca = odstep === 1 ? biezaca + 1 : 1
    seria = Math.max(seria, biezaca)
  }

  const powrot = dni.some((d, i) => {
    if (i === 0) return false
    const przerwa = Math.round(
      (+new Date(`${d}T00:00:00`) - +new Date(`${dni[i - 1]}T00:00:00`)) / 86400000,
    )
    return przerwa >= 7
  })

  return {
    ukonczone: done.length,
    seria,
    dni: dni.length,
    obszary,
    pory,
    dlugie,
    badania: state.snapshots.length,
    najwiecejWDniu: Math.max(0, ...perDay.values()),
    powrot,
  }
}
