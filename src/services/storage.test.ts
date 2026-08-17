// src/services/storage.test.ts
// Kształt zapisu zmieniał się kilka razy (mapa, kalendarz, oceny, pory dnia).
// Migracja jest jedyną rzeczą, która stoi między starym localStorage a białym ekranem.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultState, migrate } from './storage.ts'

test('pusty albo popsuty zapis daje czysty stan', () => {
  assert.deepEqual(migrate(null), defaultState())
  assert.deepEqual(migrate('["nie","obiekt"]'), defaultState())
  assert.deepEqual(migrate(42), defaultState())
})

test('zapis sprzed przebudowy zachowuje historię, a resztę pól porzuca', () => {
  const stary = {
    snapshots: [{ id: 's1', date: '2026-08-01', answers: { emocje: 4 }, levels: { emocje: 75 } }],
    checkIns: [{ id: 'c1', date: '2026-08-01', need: 'uspokojenie' }],
    sessions: [{ id: 'x1', date: '2026-08-01', cardId: 'emo-nazwij', before: 2, after: 4, completed: true }],
    calendar: [{ id: 'k1', date: '2026-08-02', cardId: 'emo-spirala', creatorSlug: 'anna-rysnik', done: false }],
    favorites: ['emo-nazwij'],
    swipes: [{ id: 'w1', cardId: 'emo-nazwij', area: 'emocje', direction: 'w-prawo', date: '2026-08-01' }],
    brainSteps: ['2026-08-01'],
  }
  const stan = migrate(stary)
  assert.equal(stan.sessions.length, 1)
  assert.equal(stan.calendar.length, 1)
  assert.equal(stan.swipes.length, 1)
  assert.equal(stan.snapshots.length, 1)
  assert.equal('favorites' in stan, false)
  assert.equal('checkIns' in stan, false)
})

test('jeden uszkodzony wpis nie kasuje pozostałych', () => {
  const stan = migrate({
    sessions: [
      { id: 'ok', date: '2026-08-17', cardId: 'c1', completed: true },
      { id: 'bez-daty', cardId: 'c2' },
      null,
      'napis',
    ],
  })
  assert.deepEqual(stan.sessions.map((s) => s.id), ['ok'])
})

test('deckStart przechodzi tylko jako data, inaczej znika', () => {
  assert.equal(migrate({ deckStart: '2026-08-17' }).deckStart, '2026-08-17')
  assert.equal(migrate({ deckStart: 1755388800000 }).deckStart, undefined)
  assert.equal(migrate({}).deckStart, undefined)
})

test('brak tablic nie wywraca stanu', () => {
  const stan = migrate({ sessions: 'nie-tablica', calendar: null })
  assert.deepEqual(stan.sessions, [])
  assert.deepEqual(stan.calendar, [])
})
