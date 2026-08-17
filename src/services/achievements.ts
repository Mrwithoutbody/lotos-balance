// src/services/achievements.ts
// Stan drzewa: co zdobyte, co dostępne, co jeszcze zakryte.
// Węzeł odsłania się dopiero, gdy zdobyty jest każdy jego poprzednik —
// stąd „?” na planszy, dokładnie jak w drzewku umiejętności.
import { ACHIEVEMENTS, statsFrom } from '../data/achievements.ts'
import type { Achievement, CardLookup } from '../data/achievements.ts'
import type { AppState } from '../types/index.ts'

export type NodeState = 'zdobyte' | 'dostepne' | 'zakryte'

export interface TreeNode {
  achievement: Achievement
  state: NodeState
}

export function buildTree(state: AppState, card: CardLookup): TreeNode[] {
  const stats = statsFrom(state, card)
  const zdobyte = new Set<string>()

  // Warunek liczy się sam z historii; kolejność w tablicy idzie od korzenia,
  // więc jedno przejście wystarcza do rozstrzygnięcia poprzedników.
  for (const a of ACHIEVEMENTS) {
    if (a.done(stats)) zdobyte.add(a.id)
  }

  return ACHIEVEMENTS.map((achievement) => {
    const odsloniete = achievement.after.every((id) => zdobyte.has(id))
    const state: NodeState = zdobyte.has(achievement.id)
      ? 'zdobyte'
      : odsloniete
        ? 'dostepne'
        : 'zakryte'
    return { achievement, state }
  })
}

/** Krawędzie do narysowania: od poprzednika do węzła. */
export function treeEdges(): { from: Achievement; to: Achievement }[] {
  const byId = new Map(ACHIEVEMENTS.map((a) => [a.id, a]))
  return ACHIEVEMENTS.flatMap((a) =>
    a.after.map((id) => ({ from: byId.get(id) as Achievement, to: a })).filter((e) => e.from),
  )
}
