// src/screens/TreeScreen.tsx
// Drzewo osiągnięć: plansza jak w grze — węzły połączone ścieżkami, zdobyte
// świecą, zakryte są znakiem zapytania. Wszystko liczone z historii ćwiczeń.
import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { useAppState } from '../hooks/useAppState'
import { useProgram } from '../hooks/useProgram'
import { buildTree, treeEdges } from '../services/achievements'
import type { TreeNode } from '../services/achievements'

export function TreeScreen() {
  const { state } = useAppState()
  const program = useProgram()
  const [wybrany, setWybrany] = useState<TreeNode | null>(null)

  const nodes = useMemo(() => {
    const byId = new Map(program.cards.map((c) => [c.id, c]))
    return buildTree(state, (id) => {
      const card = byId.get(id)
      return card ? { area: card.area, minutes: card.minutes } : undefined
    })
  }, [state, program.cards])

  const edges = useMemo(() => treeEdges(), [])
  const stanOf = (id: string) => nodes.find((n) => n.achievement.id === id)?.state ?? 'zakryte'
  const zdobyte = nodes.filter((n) => n.state === 'zdobyte').length

  return (
    <div className="stack">
      <div className="row-between">
        <p className="eyebrow">Drzewo</p>
        <span className="tiny">
          {zdobyte} z {nodes.length} odblokowanych
        </span>
      </div>

      <div className="tree-board">
        <svg className="tree-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map(({ from, to }) => (
            <line
              key={`${from.id}-${to.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={
                stanOf(to.id) === 'zakryte' ? 'tree-line' : 'tree-line is-open'
              }
            />
          ))}
        </svg>

        {nodes.map((node) => {
          const { achievement: a, state: s } = node
          const zakryte = s === 'zakryte'
          return (
            <button
              key={a.id}
              type="button"
              className={`tree-node is-${s}${wybrany?.achievement.id === a.id ? ' is-picked' : ''}`}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              onClick={() => setWybrany(node)}
              aria-label={zakryte ? 'Osiągnięcie zakryte' : a.title}
            >
              <Icon name={zakryte ? 'Search' : a.icon} size={18} />
            </button>
          )
        })}
      </div>

      <section className="surface stack-sm">
        {wybrany ? (
          <>
            <p className="eyebrow">
              {wybrany.state === 'zdobyte'
                ? 'Zdobyte'
                : wybrany.state === 'dostepne'
                  ? 'W zasięgu'
                  : 'Jeszcze zakryte'}
            </p>
            <h2 className="h2">
              {wybrany.state === 'zakryte' ? 'Odblokuje się później' : wybrany.achievement.title}
            </h2>
            <p className="muted">
              {wybrany.state === 'zakryte'
                ? 'Najpierw zdobądź osiągnięcia, z których wychodzi ścieżka do tego węzła.'
                : wybrany.achievement.hint}
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Jak to czytać</p>
            <p className="muted">
              Dotknij węzła, żeby zobaczyć, co odblokowuje. Ścieżki pokazują kolejność — węzeł
              odsłania się, gdy zdobędziesz to, co go poprzedza.
            </p>
          </>
        )}
      </section>
    </div>
  )
}
