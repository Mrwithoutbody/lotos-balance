// src/services/starmap.ts
// Rozgwiazda: jedna przestrzeń zamiast trzech. Ramiona to siedem obszarów,
// węzły na ramieniu to karty talii w kolejności twórczyni, a stan węzła bierze
// się z historii — karta odblokowuje kolejną w swoim obszarze.
import { AREAS } from '../data/areas.ts'
import type { ActivationCard, AppState, AreaId } from '../types/index.ts'

export type NodeState = 'zrobione' | 'otwarte' | 'zamkniete'

export interface StarNode {
  card: ActivationCard
  state: NodeState
  /** Ile razy ukończone — węzeł rośnie z powtórzeniami. */
  powtorzenia: number
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
  /** Koniec ramienia — tam siada podpis obszaru. */
  labelX: number
  labelY: number
}

/** Promień pierwszego węzła i odstęp kolejnych, w procentach planszy. */
const R0 = 16
const DR = 9.5

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
    // Ramiona rozchodzą się równo, pierwsze do góry.
    const kat = (-Math.PI / 2) + (armIndex * 2 * Math.PI) / AREAS.length
    const wArm = cards.filter((c) => c.area === area.id)

    let poprzedniaZrobiona = true
    const nodes = wArm.map((card, i) => {
      const powtorzenia = zrobione.get(card.id) ?? 0
      const state: NodeState = powtorzenia > 0 ? 'zrobione' : poprzedniaZrobiona ? 'otwarte' : 'zamkniete'
      poprzedniaZrobiona = powtorzenia > 0
      const r = R0 + i * DR
      return {
        card,
        state,
        powtorzenia,
        x: 50 + r * Math.cos(kat),
        y: 50 + r * Math.sin(kat),
      }
    })

    // Podpis siada tuż za ostatnim węzłem, ale nie wychodzi poza planszę.
    const rLabel = Math.min(R0 + Math.max(0, wArm.length - 1) * DR + 8, 44)
    return {
      area: area.id,
      name: area.name,
      color: area.color,
      icon: area.icon,
      poziom: levels[area.id],
      nodes,
      labelX: clamp(50 + rLabel * Math.cos(kat)),
      labelY: clamp(50 + rLabel * Math.sin(kat)),
    }
  })
}

/** Podpisy trzymamy w środku planszy, żeby nie ucinała ich krawędź. */
const clamp = (v: number) => Math.min(92, Math.max(8, v))

/** Ile kart odblokowanych z całej talii — licznik nad planszą. */
export function starProgress(arms: StarArm[]): { zrobione: number; wszystkie: number } {
  const nodes = arms.flatMap((a) => a.nodes)
  return { zrobione: nodes.filter((n) => n.state === 'zrobione').length, wszystkie: nodes.length }
}
