// src/data/goals.ts
import type { AreaId, GoalId, Minutes, NeedId } from '../types'

export interface GoalDef {
  id: GoalId
  label: string
  icon: string
  /** Obszary, które ten cel najbardziej wspiera (używane w rekomendacji). */
  areas: AreaId[]
}

export const GOALS: GoalDef[] = [
  { id: 'wiecej-energii', label: 'Chcę mieć więcej energii', icon: 'Zap', areas: ['regeneracja', 'cialo'] },
  { id: 'mniej-stresu', label: 'Chcę lepiej radzić sobie ze stresem', icon: 'Waves', areas: ['emocje', 'regeneracja'] },
  { id: 'koncentracja', label: 'Chcę odzyskać koncentrację', icon: 'Brain', areas: ['umysl'] },
  { id: 'zaczac-dzialac', label: 'Chcę zacząć działać', icon: 'Target', areas: ['dzialanie'] },
  { id: 'lepszy-sen', label: 'Chcę poprawić sen', icon: 'Moon', areas: ['regeneracja'] },
  { id: 'zdrowe-relacje', label: 'Chcę budować zdrowe relacje', icon: 'Users', areas: ['relacje'] },
  { id: 'poczucie-kierunku', label: 'Chcę odzyskać poczucie kierunku', icon: 'Compass', areas: ['sens'] },
  {
    id: 'zdrowie-mozgu',
    label: 'Chcę dbać o zdrowie mózgu na przyszłość',
    icon: 'Sparkles',
    areas: ['cialo', 'umysl', 'relacje', 'regeneracja'],
  },
]

export const GOAL_BY_ID: Record<GoalId, GoalDef> = GOALS.reduce(
  (acc, g) => {
    acc[g.id] = g
    return acc
  },
  {} as Record<GoalId, GoalDef>,
)

export interface NeedDef {
  id: NeedId
  label: string
  icon: string
}

export const NEEDS: NeedDef[] = [
  { id: 'uspokojenie', label: 'Uspokojenia', icon: 'Waves' },
  { id: 'energia', label: 'Energii', icon: 'Zap' },
  { id: 'skupienie', label: 'Skupienia', icon: 'Brain' },
  { id: 'odwaga', label: 'Odwagi', icon: 'Flame' },
  { id: 'ulga', label: 'Ulgi od natłoku myśli', icon: 'CloudDrizzle' },
  { id: 'kontakt-z-cialem', label: 'Kontaktu z ciałem', icon: 'Footprints' },
  { id: 'kontakt-z-czlowiekiem', label: 'Kontaktu z drugim człowiekiem', icon: 'Users' },
  { id: 'kierunek', label: 'Poczucia kierunku', icon: 'Compass' },
]

export const NEED_BY_ID: Record<NeedId, NeedDef> = NEEDS.reduce(
  (acc, n) => {
    acc[n.id] = n
    return acc
  },
  {} as Record<NeedId, NeedDef>,
)

export const TIME_OPTIONS: { value: Minutes; label: string }[] = [
  { value: 3, label: '3 minuty' },
  { value: 7, label: '7 minut' },
  { value: 15, label: '15 minut' },
]
