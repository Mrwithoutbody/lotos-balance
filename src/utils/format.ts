// src/utils/format.ts
// Jedno miejsce, w którym dane karty zamieniają się w tekst dla użytkowniczki.
import type { DayPart } from '../services/day'
import { plural } from './plural'

export function minutesLabel(minutes: number): string {
  return `${minutes} ${plural(minutes, 'minuta', 'minuty', 'minut')}`
}

export function stepsLabel(steps: number): string {
  return `${steps} ${plural(steps, 'krok', 'kroki', 'kroków')}`
}

export function exercisesLabel(count: number): string {
  return `${count} ${plural(count, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}`
}

export function daysLabel(days: number): string {
  return `${days} ${plural(days, 'dzień', 'dni', 'dni')}`
}

const DAY_PART_LABEL: Record<DayPart, string> = {
  rano: 'Rano',
  popołudnie: 'Po południu',
  wieczór: 'Wieczorem',
}

export function dayPartLabel(part: DayPart): string {
  return DAY_PART_LABEL[part]
}
