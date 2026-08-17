// src/services/starmap.test.ts
// Rozgwiazda jest wizualizacją talii — musi zgadzać się z historią co do karty,
// a ramię ma być drzewem (korzeń → dwa → dwa), nie linią.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ARM_SHAPE, brakujaceKarty, buildStarMap, starProgress } from './starmap.ts'
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

/** Pełne ramię emocji (5 kart) i niepełne regeneracji (2 karty). */
const cards = [
  ...['e1', 'e2', 'e3', 'e4', 'e5'].map((id) => card(id, 'emocje')),
  ...['r1', 'r2'].map((id) => card(id, 'regeneracja')),
]

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

const node = (s: AppState, id: string) =>
  buildStarMap(s, cards).flatMap((a) => a.nodes).find((n) => n.card.id === id)

test('ramię układa się w trzy poziomy: jeden, dwa, dwa', () => {
  assert.deepEqual(ARM_SHAPE, [1, 2, 2])
  const emocje = buildStarMap(state(), cards).find((a) => a.area === 'emocje')!
  assert.deepEqual(
    emocje.nodes.map((n) => n.poziom),
    [0, 1, 1, 2, 2],
  )
})

test('rodzice: korzeń bez rodzica, liście pod różnymi gałęziami', () => {
  assert.equal(node(state(), 'e1')?.rodzic, undefined)
  assert.equal(node(state(), 'e2')?.rodzic, 'e1')
  assert.equal(node(state(), 'e3')?.rodzic, 'e1')
  assert.equal(node(state(), 'e4')?.rodzic, 'e2')
  assert.equal(node(state(), 'e5')?.rodzic, 'e3')
})

test('na starcie otwarty jest tylko korzeń każdego ramienia', () => {
  const s = state()
  assert.equal(node(s, 'e1')?.state, 'otwarte')
  assert.equal(node(s, 'e2')?.state, 'zamkniete')
  assert.equal(node(s, 'r1')?.state, 'otwarte')
})

test('zrobiony korzeń otwiera oba rozwidlenia, ale nie liście', () => {
  const s = state({ sessions: [sesja('e1')] })
  assert.equal(node(s, 'e2')?.state, 'otwarte')
  assert.equal(node(s, 'e3')?.state, 'otwarte')
  assert.equal(node(s, 'e4')?.state, 'zamkniete')
})

test('gałąź otwiera się niezależnie od sąsiedniej', () => {
  const s = state({ sessions: [sesja('e1'), sesja('e2')] })
  assert.equal(node(s, 'e4')?.state, 'otwarte')
  assert.equal(node(s, 'e5')?.state, 'zamkniete')
})

test('niepełne ramię nie wymyśla węzłów, a braki są policzone', () => {
  const arms = buildStarMap(state(), cards)
  assert.equal(arms.find((a) => a.area === 'regeneracja')?.nodes.length, 2)
  assert.equal(arms.find((a) => a.area === 'cialo')?.nodes.length, 0)
  // 5 pełnego ramienia: emocje mają komplet, regeneracja 3 braki, pięć pustych po 5.
  assert.equal(brakujaceKarty(arms), 3 + 5 * 5)
})

test('węzły trzymają się planszy i nie wchodzą w rdzeń', () => {
  for (const n of buildStarMap(state(), cards).flatMap((a) => a.nodes)) {
    const r = Math.hypot(n.x - 50, n.y - 50)
    assert.ok(r >= 18 && r <= 49, `promień poza planszą: ${r}`)
  }
})

test('licznik postępu i powtórzenia liczą karty', () => {
  const s = state({ sessions: [sesja('e1', '2026-08-16'), sesja('e1', '2026-08-17'), sesja('r1')] })
  assert.equal(node(s, 'e1')?.powtorzenia, 2)
  assert.deepEqual(starProgress(buildStarMap(s, cards)), { zrobione: 2, wszystkie: 7 })
})
