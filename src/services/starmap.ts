// src/services/starmap.ts
// Rozgwiazda: jedna przestrzeń zamiast trzech. Ramiona to siedem obszarów,
// a każde ramię jest małym drzewem: korzeń → dwa węzły → po jednym z każdego.
// Docelowo pięć kart na obszar; przy czterech ostatni poziom ma jeden węzeł.
import { AREAS } from '../data/areas.ts'
import type { ActivationCard, AppState, AreaId } from '../types/index.ts'

export type NodeState = 'zrobione' | 'otwarte' | 'zamkniete'

export interface StarNode {
  card: ActivationCard
  state: NodeState
  /** Ile razy ukończone — węzeł rośnie z powtórzeniami. */
  powtorzenia: number
  /** 0 = korzeń ramienia, 1 = rozwidlenie, 2 = liście. */
  poziom: number
  /** Id karty-rodzica; korzeń wychodzi wprost z rdzenia. */
  rodzic?: string
  x: number
  y: number
}

export interface StarArm {
  area: AreaId
  name: string
  color: string
  icon: string
  /** Poziom 0–100 z ostatniego badania Mapy Balansu; brak = obszar niezbadany. */
  poziom?: number
  nodes: StarNode[]
}

/** Ile kart mieści się na kolejnych poziomach ramienia. */
export const ARM_SHAPE = [1, 2, 2]

/** Promień poziomów i rozstaw gałęzi w stopniach. */
const R = [15, 28, 41]
const SPREAD = 15

export function buildStarMap(
  state: AppState,
  cards: ActivationCard[],
  levels: Partial<Record<AreaId, number>> = {},
): StarArm[] {
  const zrobione = new Map<string, number>()
  for (const s of state.sessions) {
    if (s.completed) zrobione.set(s.cardId, (zrobione.get(s.cardId) ?? 0) + 1)
  }

  return AREAS.map((area, armIndex) => {
    const kat = -90 + (armIndex * 360) / AREAS.length
    const wArm = cards.filter((c) => c.area === area.id)
    const nodes: StarNode[] = []

    let i = 0
    let poprzedniPoziom: StarNode[] = []

    for (let poziom = 0; poziom < ARM_SHAPE.length && i < wArm.length; poziom += 1) {
      const ile = Math.min(ARM_SHAPE[poziom], wArm.length - i)
      const warstwa: StarNode[] = []

      for (let k = 0; k < ile; k += 1, i += 1) {
        // Rodzicem jest węzeł z poprzedniego poziomu — dzieci rozkładają się po kolei.
        const rodzic = poprzedniPoziom.length
          ? poprzedniPoziom[k % poprzedniPoziom.length]
          : undefined
        // Gałęzie rozchodzą się symetrycznie wokół osi ramienia.
        const offset = ile === 1 ? 0 : (k - (ile - 1) / 2) * SPREAD
        const radian = ((kat + offset) * Math.PI) / 180
        const r = R[poziom]

        const card = wArm[i]
        const powtorzenia = zrobione.get(card.id) ?? 0
        warstwa.push({
          card,
          powtorzenia,
          poziom,
          rodzic: rodzic?.card.id,
          state: 'zamkniete',
          x: 50 + r * Math.cos(radian),
          y: 50 + r * Math.sin(radian),
        })
      }

      nodes.push(...warstwa)
      poprzedniPoziom = warstwa
    }

    // Otwarte jest to, co nie ma rodzica albo czyj rodzic został zrobiony.
    for (const node of nodes) {
      const rodzicZrobiony = node.rodzic
        ? (zrobione.get(node.rodzic) ?? 0) > 0
        : true
      node.state = node.powtorzenia > 0 ? 'zrobione' : rodzicZrobiony ? 'otwarte' : 'zamkniete'
    }

    return {
      area: area.id,
      name: area.name,
      color: area.color,
      icon: area.icon,
      poziom: levels[area.id],
      nodes,
    }
  })
}

/** Ile kart odblokowanych z całej talii — licznik nad planszą. */
export function starProgress(arms: StarArm[]): { zrobione: number; wszystkie: number } {
  const nodes = arms.flatMap((a) => a.nodes)
  return { zrobione: nodes.filter((n) => n.state === 'zrobione').length, wszystkie: nodes.length }
}

/** Ilu kart brakuje twórczyni do pełnego drzewa na każdym ramieniu. */
export function brakujaceKarty(arms: StarArm[]): number {
  const pelne = ARM_SHAPE.reduce((a, b) => a + b, 0)
  return arms.reduce((brak, arm) => brak + Math.max(0, pelne - arm.nodes.length), 0)
}
