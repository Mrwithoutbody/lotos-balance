// src/utils/balance.ts
import { AREA_IDS } from '../data/areas'
import type { AreaId, AreaStatus, BalanceSnapshot, Scale5 } from '../types'

export type Levels = Partial<Record<AreaId, number>>

/** Odpowiedź 1–5 przeliczona liniowo na poziom 0–100. */
const answerToLevel = (answer: Scale5) => Math.round(((answer - 1) / 4) * 100)

/** Tylko znane obszary z odpowiedzią — filtr trzyma śmieci z localStorage poza mapą. */
export function levelsFromAnswers(answers: Partial<Record<AreaId, Scale5>>): Levels {
  return Object.fromEntries(
    AREA_IDS.filter((id) => answers[id] !== undefined).map((id) => [
      id,
      answerToLevel(answers[id] as Scale5),
    ]),
  )
}

export function statusOf(level: number): AreaStatus {
  if (level < 40) return 'potrzebuje wsparcia'
  if (level < 70) return 'stabilny'
  return 'mocna strona'
}

export function latestSnapshot(snapshots: BalanceSnapshot[]): BalanceSnapshot | null {
  if (snapshots.length === 0) return null
  return snapshots.reduce((a, b) => (a.createdAt >= b.createdAt ? a : b))
}

export function knownAreas(levels: Levels): AreaId[] {
  return AREA_IDS.filter((id) => levels[id] !== undefined)
}

/** Najsłabsze poznane obszary — kolejność deterministyczna. */
export function weakestAreas(levels: Levels, count = 2): AreaId[] {
  return knownAreas(levels)
    .sort(
      (a, b) => (levels[a] as number) - (levels[b] as number) || AREA_IDS.indexOf(a) - AREA_IDS.indexOf(b),
    )
    .slice(0, count)
}

export function strongestArea(levels: Levels): AreaId | null {
  const known = knownAreas(levels)
  if (known.length === 0) return null
  return known.sort(
    (a, b) => (levels[b] as number) - (levels[a] as number) || AREA_IDS.indexOf(a) - AREA_IDS.indexOf(b),
  )[0]
}

