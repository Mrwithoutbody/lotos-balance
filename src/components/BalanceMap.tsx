// src/components/BalanceMap.tsx
import { AREAS } from '../data/areas'
import type { AreaId } from '../types'
import type { Levels } from '../utils/balance'
import { statusOf } from '../utils/balance'
import { Icon } from './Icon'

interface Props {
  levels: Levels
  highlight?: AreaId[]
}

export function BalanceMap({ levels, highlight = [] }: Props) {
  return (
    <ul className="balance-map">
      {AREAS.map((area) => {
        const level = levels[area.id]
        const known = level !== undefined
        const status = known ? statusOf(level) : 'jeszcze nie wiemy'
        return (
          <li
            key={area.id}
            className={`balance-row${highlight.includes(area.id) ? ' is-highlight' : ''}${
              known ? '' : ' is-unknown'
            }`}
          >
            <span className="balance-icon" style={{ background: area.softColor, color: area.color }}>
              <Icon name={area.icon} size={17} />
            </span>
            <div className="grow">
              <div className="balance-head">
                <span className="balance-name">{area.name}</span>
                <span className="balance-level">{known ? level : '—'}</span>
              </div>
              <div
                className="meter"
                role="img"
                aria-label={
                  known ? `${area.name}: ${level} na 100, ${status}` : `${area.name}: jeszcze nie wiemy`
                }
              >
                {known && (
                  <span
                    className="meter-fill"
                    style={{ width: `${Math.max(3, level)}%`, background: area.color }}
                  />
                )}
              </div>
              <p className="balance-status">{status}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
