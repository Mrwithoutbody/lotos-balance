// src/data/areas.ts
import type { AreaId, BalanceArea } from '../types'

export const AREAS: BalanceArea[] = [
  {
    id: 'emocje',
    name: 'Emocje',
    icon: 'Heart',
    color: '#D0705C',
    softColor: '#F6E4DE',
    description: 'Napięcie, nastrój i to, jak wracasz do równowagi.',
    aspects: ['napięcie', 'nastrój', 'regulacja emocjonalna'],
    question: 'Na ile potrafiłaś wrócić do równowagi po trudnych emocjach?',
  },
  {
    id: 'regeneracja',
    name: 'Regeneracja',
    icon: 'Moon',
    color: '#6C87A8',
    softColor: '#E1E8F0',
    description: 'Sen, odpoczynek i poziom energii w ciągu dnia.',
    aspects: ['sen', 'odpoczynek', 'energia'],
    question: 'Na ile budziłaś się wypoczęta?',
  },
  {
    id: 'umysl',
    name: 'Umysł',
    icon: 'Brain',
    color: '#8B79B0',
    softColor: '#E9E4F2',
    description: 'Koncentracja, przeciążenie i poczucie jasności myślenia.',
    aspects: ['koncentracja', 'przeciążenie poznawcze', 'jasność myślenia'],
    question: 'Na ile łatwo było Ci skupić się na jednej rzeczy?',
  },
  {
    id: 'dzialanie',
    name: 'Działanie',
    icon: 'Target',
    color: '#C2884A',
    softColor: '#F5E8D6',
    description: 'Motywacja, sprawczość i kończenie rozpoczętych rzeczy.',
    aspects: ['motywacja', 'sprawczość', 'kończenie spraw'],
    question: 'Na ile przechodziłaś od zamiaru do działania?',
  },
  {
    id: 'cialo',
    name: 'Ciało',
    icon: 'Footprints',
    color: '#7B9A78',
    softColor: '#E4EDE2',
    description: 'Ruch, oddech i kontakt z sygnałami z ciała.',
    aspects: ['ruch', 'oddech', 'sygnały z ciała'],
    question: 'Na ile miałaś kontakt z potrzebami swojego ciała?',
  },
  {
    id: 'relacje',
    name: 'Relacje',
    icon: 'Users',
    color: '#BC7680',
    softColor: '#F3E2E4',
    description: 'Bliskość, granice i kontakt społeczny.',
    aspects: ['bliskość', 'granice', 'kontakt społeczny'],
    question: 'Na ile czułaś wspierający kontakt z innymi?',
  },
  {
    id: 'sens',
    name: 'Sens',
    icon: 'Compass',
    color: '#9A8352',
    softColor: '#F0EADA',
    description: 'Wartości, kierunek i poczucie znaczenia.',
    aspects: ['wartości', 'kierunek', 'poczucie znaczenia'],
    question: 'Na ile czułaś, że wiesz, w jakim kierunku idziesz?',
  },
]

export const AREA_BY_ID: Record<AreaId, BalanceArea> = AREAS.reduce(
  (acc, area) => {
    acc[area.id] = area
    return acc
  },
  {} as Record<AreaId, BalanceArea>,
)

export const AREA_IDS: AreaId[] = AREAS.map((a) => a.id)
