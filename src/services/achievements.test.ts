// src/services/achievements.test.ts
// Drzewo ma być deterministyczne: te same wykonane ćwiczenia = ten sam stan węzłów.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildTree } from './achievements.ts'
import type { AppState } from '../types/index.ts'

const cards: Record<string, { area: string; minutes: number }> = {
  emo: { area: 'emocje', minutes: 3 },
  reg: { area: 'regeneracja', minutes: 15 },
  cia: { area: 'cialo', minutes: 7 },
  umy: { area: 'umysl', minutes: 3 },
  dzi: { area: 'dzialanie', minutes: 3 },
  rel: { area: 'relacje', minutes: 3 },
  sen: { area: 'sens', minutes: 3 },
}
const lookup = (id: string) => cards[id]

const sesja = (cardId: string, date: string, godzina = 10) => ({
  id: `${cardId}-${date}-${godzina}`,
  cardId,
  date,
  startedAt: `${date}T${String(godzina).padStart(2, '0')}:00:00.000Z`,
  completed: true,
})

const state = (over: Partial<AppState> = {}): AppState => ({
  snapshots: [],
  sessions: [],
  calendar: [],
  swipes: [],
  ...over,
})

const stan = (s: AppState, id: string) =>
  buildTree(s, lookup).find((n) => n.achievement.id === id)?.state

test('czysty stan: tylko pierwszy węzeł jest w zasięgu, reszta zakryta', () => {
  const drzewo = buildTree(state(), lookup)
  assert.equal(stan(state(), 'start'), 'dostepne')
  assert.equal(stan(state(), 'seria-3'), 'zakryte')
  assert.equal(drzewo.filter((n) => n.state === 'zdobyte').length, 0)
})

test('pierwsze ćwiczenie zdobywa korzeń i odsłania jego dzieci', () => {
  const s = state({ sessions: [sesja('emo', '2026-08-17')] })
  assert.equal(stan(s, 'start'), 'zdobyte')
  assert.equal(stan(s, 'seria-3'), 'dostepne')
  assert.equal(stan(s, 'seria-7'), 'zakryte')
})

test('seria liczy dni z rzędu, nie liczbę ćwiczeń', () => {
  const jedenDzien = state({
    sessions: [sesja('emo', '2026-08-17', 8), sesja('cia', '2026-08-17', 9), sesja('umy', '2026-08-17', 11)],
  })
  assert.equal(stan(jedenDzien, 'seria-3'), 'dostepne')
  // trzy karty jednego dnia to za to inne osiągnięcie
  assert.equal(stan(jedenDzien, 'dzien-pelny'), 'zdobyte')

  const trzyDni = state({
    sessions: [sesja('emo', '2026-08-15'), sesja('emo', '2026-08-16'), sesja('emo', '2026-08-17')],
  })
  assert.equal(stan(trzyDni, 'seria-3'), 'zdobyte')
})

test('pory dnia biorą się z godziny startu', () => {
  const s = state({
    sessions: [sesja('emo', '2026-08-17', 7), sesja('cia', '2026-08-17', 14), sesja('umy', '2026-08-17', 21)],
  })
  assert.equal(stan(s, 'rano'), 'zdobyte')
  assert.equal(stan(s, 'wieczor'), 'zdobyte')
  assert.equal(stan(s, 'cala-doba'), 'zdobyte')
})

test('pełne koło wymaga wszystkich siedmiu obszarów', () => {
  const szesc = state({
    sessions: ['emo', 'reg', 'cia', 'umy', 'dzi', 'rel'].map((c, i) => sesja(c, `2026-08-${10 + i}`)),
  })
  assert.equal(stan(szesc, 'siedem-obszarow'), 'dostepne')

  const siedem = state({
    sessions: Object.keys(cards).map((c, i) => sesja(c, `2026-08-${10 + i}`)),
  })
  assert.equal(stan(siedem, 'siedem-obszarow'), 'zdobyte')
})

test('dłuższa chwila tylko za ćwiczenie piętnastominutowe', () => {
  const krotkie = state({ sessions: [sesja('emo', '2026-08-17'), sesja('cia', '2026-08-16'), sesja('umy', '2026-08-15')] })
  assert.equal(stan(krotkie, 'dlugie'), 'dostepne')
  const dlugie = state({ sessions: [...krotkie.sessions, sesja('reg', '2026-08-14')] })
  assert.equal(stan(dlugie, 'dlugie'), 'zdobyte')
})

test('powrót po tygodniu przerwy', () => {
  const s = state({ sessions: [sesja('emo', '2026-08-01'), sesja('emo', '2026-08-12')] })
  assert.equal(stan(s, 'powrot'), 'zdobyte')
})

test('badania mapy odblokowują własną gałąź', () => {
  const snap = (id: string, date: string) => ({ id, date, createdAt: `${date}T10:00:00.000Z`, answers: {}, levels: {} })
  const jedno = state({ sessions: [sesja('emo', '2026-08-17')], snapshots: [snap('s1', '2026-08-17')] })
  assert.equal(stan(jedno, 'mapa'), 'zdobyte')
  assert.equal(stan(jedno, 'mapa-2'), 'dostepne')
})
