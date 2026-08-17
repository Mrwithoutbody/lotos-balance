// src/data/areas.ts
import type { AreaId, BalanceArea } from '../types/index.ts'

export const AREAS: BalanceArea[] = [
  {
    id: 'emocje',
    name: 'Emocje',
    icon: 'Heart',
    color: '#D0705C',
    softColor: '#F6E4DE',
    question: 'Na ile potrafiłaś wrócić do równowagi po trudnych emocjach?',
  },
  {
    id: 'regeneracja',
    name: 'Regeneracja',
    icon: 'Moon',
    color: '#6C87A8',
    softColor: '#E1E8F0',
    question: 'Na ile budziłaś się wypoczęta?',
  },
  {
    id: 'umysl',
    name: 'Umysł',
    icon: 'Brain',
    color: '#8B79B0',
    softColor: '#E9E4F2',
    question: 'Na ile łatwo było Ci skupić się na jednej rzeczy?',
  },
  {
    id: 'dzialanie',
    name: 'Działanie',
    icon: 'Target',
    color: '#C2884A',
    softColor: '#F5E8D6',
    question: 'Na ile przechodziłaś od zamiaru do działania?',
  },
  {
    id: 'cialo',
    name: 'Ciało',
    icon: 'Footprints',
    color: '#7B9A78',
    softColor: '#D8EAD2',
    question: 'Na ile miałaś kontakt z potrzebami swojego ciała?',
  },
  {
    id: 'relacje',
    name: 'Relacje',
    icon: 'Users',
    color: '#BC7680',
    softColor: '#F3E2E4',
    question: 'Na ile czułaś wspierający kontakt z innymi?',
  },
  {
    id: 'sens',
    name: 'Sens',
    icon: 'Compass',
    color: '#9A8352',
    softColor: '#F0EADA',
    question: 'Na ile czułaś, że wiesz, w jakim kierunku idziesz?',
  },
]

export const AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<
  AreaId,
  BalanceArea
>

export const AREA_IDS: AreaId[] = AREAS.map((a) => a.id)
