// src/services/day.test.ts
// Rozkład talii to jedyna nietrywialna logika w tym repo — tu jest jej siatka.
// Uruchomienie: npm test (node --test, bez dodatkowych zależności).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CARDS_PER_DAY, dayCards, dayDeal, dayNumber } from './day.ts'
import type { ActivationCard, AppState } from '../types/index.ts'

const card = (id: string, area: ActivationCard['area']): ActivationCard => ({
  id,
  title: id,
  area,
  icon: 'Heart',
  minutes: 3,
  energy: 'niska',
  needs: [],
  description: '',
  steps: ['krok'],
  why: '',
})

// Kolejność jak w manifeście twórczyni.
const cards = [
  card('c1', 'emocje'),
  card('c2', 'regeneracja'),
  card('c3', 'cialo'),
  card('c4', 'umysl'),
  card('c5', 'sens'),
  card('c6', 'relacje'),
]

const state = (over: Partial<AppState> = {}): AppState => ({
  deckStart: '2026-08-17',
  snapshots: [],
  sessions: [],
  calendar: [],
  swipes: [],
  ...over,
})

test('dzień pierwszy dostaje pierwszą trójkę, drugi kolejną', () => {
  const day1 = dayDeal(state(), cards, '2026-08-17').map((s) => s.card.id)
  const day2 = dayDeal(state(), cards, '2026-08-18').map((s) => s.card.id)
  assert.deepEqual(day1.sort(), ['c1', 'c2', 'c3'])
  assert.deepEqual(day2.sort(), ['c4', 'c5', 'c6'])
  assert.equal(day1.length, CARDS_PER_DAY)
})

test('pory idą od budzących obszarów do regeneracji', () => {
  const parts = dayDeal(state(), cards, '2026-08-17')
  assert.deepEqual(
    parts.map((s) => [s.card.id, s.part]),
    [
      ['c3', 'rano'],
      ['c1', 'popołudnie'],
      ['c2', 'wieczór'],
    ],
  )
})

test('numer dnia liczy się od pierwszego wejścia', () => {
  assert.equal(dayNumber(state(), '2026-08-17'), 1)
  assert.equal(dayNumber(state(), '2026-08-20'), 4)
  assert.equal(dayNumber(state({ deckStart: undefined }), '2026-08-20'), 1)
})

test('„nie dla mnie” zdejmuje kartę z rozdań na dwa tygodnie', () => {
  const swipes = [{ id: 's1', cardId: 'c1', direction: 'w-lewo' as const, date: '2026-08-17' }]
  // 24.08 to dzień 8 — rozdanie c1..c3 wypadałoby dopiero w dniu nieparzystym,
  // więc sprawdzamy dzień 15 (31.08): rozdanie znów obejmuje c1, a okno właśnie minęło.
  assert.equal(dayDeal(state({ swipes }), cards, '2026-08-29').map((s) => s.card.id).includes('c1'), false)
  assert.equal(dayDeal(state({ swipes }), cards, '2026-08-31').map((s) => s.card.id).includes('c1'), true)
})

test('dzisiejszy gest zdejmuje kartę z dnia, ale nie dosuwa nowej', () => {
  const swipes = [{ id: 's1', cardId: 'c1', direction: 'w-lewo' as const, date: '2026-08-17' }]
  const left = dayCards(state({ swipes }), cards, '2026-08-17').map((s) => s.card.id)
  assert.deepEqual(left.sort(), ['c2', 'c3'])
})

test('wykonane dziś znika z kart dnia', () => {
  const sessions = [
    { id: 'x', cardId: 'c3', date: '2026-08-17', startedAt: '', completed: true },
  ]
  const left = dayCards(state({ sessions }), cards, '2026-08-17').map((s) => s.card.id)
  assert.deepEqual(left.sort(), ['c1', 'c2'])
})

test('gdy wszystko odłożone, dzień jest zamknięty', () => {
  const swipes = ['c1', 'c2', 'c3'].map((cardId, i) => ({
    id: `s${i}`,
    cardId,
    direction: 'w-prawo' as const,
    date: '2026-08-17',
  }))
  assert.deepEqual(dayCards(state({ swipes }), cards, '2026-08-17'), [])
})
