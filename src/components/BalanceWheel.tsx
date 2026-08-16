// src/components/BalanceWheel.tsx
import { AREAS } from '../data/areas'
import type { AreaId } from '../types'
import type { Levels } from '../utils/balance'
import { Icon } from './Icon'

interface Props {
  levels: Levels
  highlight?: AreaId[]
}

const CENTER = 100
const CORE = 22
const MAX = 80
const STEP = 360 / AREAS.length
/** Rozwarcie płatka w stopniach — 0.42 kroku zostawia szczelinę między sąsiadami. */
const SPREAD = STEP * 0.42
/** Promień pierścienia ikon, w procentach połowy kontenera. */
const ICON_RING = 46

function polar(angle: number, radius: number, origin: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180
  return [origin + radius * Math.cos(rad), origin + radius * Math.sin(rad)]
}

function point(angle: number, radius: number): string {
  const [x, y] = polar(angle, radius, CENTER)
  return `${x.toFixed(1)} ${y.toFixed(1)}`
}

/** Płatek: od rdzenia do wierzchołka i z powrotem, dwiema krzywymi kwadratowymi. */
function petal(angle: number, radius: number): string {
  const belly = CORE + (radius - CORE) * 0.55
  return [
    `M ${point(angle, CORE)}`,
    `Q ${point(angle - SPREAD, belly)} ${point(angle, radius)}`,
    `Q ${point(angle + SPREAD, belly)} ${point(angle, CORE)}`,
    'Z',
  ].join(' ')
}

export function BalanceWheel({ levels, highlight = [] }: Props) {
  const known = AREAS.filter((a) => levels[a.id] !== undefined)
  // Średnia z części obszarów czytałaby się jak wynik całości — pokazujemy ją
  // dopiero przy komplecie, wcześniej licznik poznanych.
  const average =
    known.length === AREAS.length
      ? Math.round(known.reduce((sum, a) => sum + (levels[a.id] ?? 0), 0) / AREAS.length)
      : null

  const label = AREAS.map((a) => {
    const level = levels[a.id]
    return `${a.name}: ${level === undefined ? 'jeszcze nie wiemy' : `${level} na 100`}`
  }).join('. ')

  return (
    <div className="balance-wheel">
      <svg viewBox="0 0 200 200" role="img" aria-label={`Mapa Balansu. ${label}`}>
        {AREAS.map((area, i) => {
          const angle = i * STEP
          const level = levels[area.id]
          return (
            <g key={area.id}>
              {/* Ślad pełnego płatka — pokazuje, ile obszaru jeszcze nie znamy. */}
              <path d={petal(angle, MAX)} className="wheel-track" />
              {level !== undefined && (
                <path
                  // ponytail: dolna granica 6% trzyma płatek widocznym, więc 0 i 6
                  // rysują się tak samo; osobny znacznik dla zera gdy rozróżnienie
                  // „najniższy wynik” od „prawie najniższy” zacznie mieć znaczenie.
                  d={petal(angle, CORE + ((MAX - CORE) * Math.max(6, level)) / 100)}
                  fill={area.color}
                  className={highlight.includes(area.id) ? 'wheel-petal is-highlight' : 'wheel-petal'}
                />
              )}
            </g>
          )
        })}
        <circle cx={CENTER} cy={CENTER} r={CORE - 3} className="wheel-core" />
        <text x={CENTER} y={CENTER} className="wheel-center">
          {average ?? `${known.length}/${AREAS.length}`}
        </text>
      </svg>

      {AREAS.map((area, i) => {
        const [x, y] = polar(i * STEP, ICON_RING, 50)
        const isKnown = levels[area.id] !== undefined
        return (
          <span
            key={area.id}
            className={`wheel-icon${isKnown ? '' : ' is-unknown'}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              background: area.softColor,
              color: area.color,
            }}
            title={`${area.name}${isKnown ? `: ${levels[area.id]}` : ''}`}
            aria-hidden="true"
          >
            <Icon name={area.icon} size={14} />
          </span>
        )
      })}
    </div>
  )
}
