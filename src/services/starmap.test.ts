// src/services/starmap.test.ts
// Rozgwiazda jest wizualizacją talii — musi zgadzać się z historią co do karty.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildStarMap, starProgress } from './starmap.ts'
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

// Dwie karty w emocjach, jedna w regeneracji — reszta ramion pusta.
const cards = [card('e1', 'emocje'), card('e2', 'emocje'), card('r1', 'regeneracja')]

const state = (over: Partial<AppState> = {}): AppState => ({
  snapshots: [],
  sessions: [],
  calendar: [],
  swipes: [],
  ...over,
})

const sesja = (cardId: string, date = '2026-08-17') => ({
  id: `${cardId}-${date}`,
  cardId,
  date,
  startedAt: `${date}T10:00:00.000Z`,
  completed: true,
})

const nodeOf = (s: AppState, id: string) =>
  buildStarMap(s, cards).flatMap((a) => a.nodes).find((n) => n.card.id === id)

test('każdy obszar dostaje własne ramię, także pusty', () => {
  const arms = buildStarMap(state(), cards)
  assert.equal(arms.length, 7)
  assert.equal(arms.find((a) => a.area === 'emocje')?.nodes.length, 2)
  assert.equal(arms.find((a) => a.area === 'cialo')?.nodes.length, 0)
})

test('pierwsza karta ramienia jest otwarta, kolejna zamknięta', () => {
  assert.equal(nodeOf(state(), 'e1')?.state, 'otwarte')
  assert.equal(nodeOf(state(), 'e2')?.state, 'zamkniete')
})

test('zrobiona karta otwiera następną na swoim ramieniu', () => {
  const s = state({ sessions: [sesja('e1')] })
  assert.equal(nodeOf(s, 'e1')?.state, 'zrobione')
  assert.equal(nodeOf(s, 'e2')?.state, 'otwarte')
  // sąsiednie ramię pozostaje nietknięte
  assert.equal(nodeOf(s, 'r1')?.state, 'otwarte')
})

test('powtórzenia są liczone', () => {
  const s = state({ sessions: [sesja('e1', '2026-08-16'), sesja('e1', '2026-08-17')] })
  assert.equal(nodeOf(s, 'e1')?.powtorzenia, 2)
})

test('węzły leżą wewnątrz planszy i nie siedzą w rdzeniu', () => {
  for (const n of buildStarMap(state(), cards).flatMap((a) => a.nodes)) {
    const r = Math.hypot(n.x - 50, n.y - 50)
    assert.ok(r >= 15 && r <= 50, `promień poza planszą: ${r}`)
  }
})

test('poziomy z badania trafiają na ramiona', () => {
  const arms = buildStarMap(state(), cards, { emocje: 75 })
  assert.equal(arms.find((a) => a.area === 'emocje')?.poziom, 75)
  assert.equal(arms.find((a) => a.area === 'sens')?.poziom, undefined)
})

test('licznik postępu liczy karty, nie ramiona', () => {
  const s = state({ sessions: [sesja('e1'), sesja('r1')] })
  assert.deepEqual(starProgress(buildStarMap(s, cards)), { zrobione: 2, wszystkie: 3 })
})
