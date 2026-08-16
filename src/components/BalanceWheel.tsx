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
/** Promień pierścienia ikon, w jednostkach viewBox. */
const ICON_RING = 92

function polar(angle: number, radius: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)]
}

function point(angle: number, radius: number): string {
  const [x, y] = polar(angle, radius)
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
  const knownCount = AREAS.filter((a) => levels[a.id] !== undefined).length
  // Średnia z części obszarów czytałaby się jak wynik całości — pokazujemy ją
  // dopiero przy komplecie, wcześniej licznik poznanych.
  const average =
    knownCount === AREAS.length
      ? Math.round(AREAS.reduce((sum, a) => sum + (levels[a.id] ?? 0), 0) / AREAS.length)
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
                  // Dolna granica 6% trzyma płatek widocznym przy wyniku 0. Skala pytań
                  // daje tylko 0/25/50/75/100, więc granica nie zaciera żadnej realnej
                  // różnicy — najniższy wynik zostaje odróżnialny od kolejnego.
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
          {average ?? `${knownCount}/${AREAS.length}`}
        </text>
      </svg>

      {AREAS.map((area, i) => {
        // viewBox ma 200 jednostek na całą szerokość kontenera, stąd /2 na procenty.
        const [x, y] = polar(i * STEP, ICON_RING)
        const isKnown = levels[area.id] !== undefined
        return (
          <span
            key={area.id}
            className={`wheel-icon${isKnown ? '' : ' is-unknown'}`}
            style={{
              left: `${x / 2}%`,
              top: `${y / 2}%`,
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
