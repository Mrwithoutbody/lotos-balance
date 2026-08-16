// src/data/goals.ts
import type { Minutes, NeedId } from '../types'

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

export const NEED_BY_ID = Object.fromEntries(NEEDS.map((n) => [n.id, n])) as Record<
  NeedId,
  NeedDef
>

export const TIME_OPTIONS: { value: Minutes; label: string }[] = [
  { value: 3, label: '3 minuty' },
  { value: 7, label: '7 minut' },
  { value: 15, label: '15 minut' },
]
