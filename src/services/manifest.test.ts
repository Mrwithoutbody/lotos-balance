// src/services/manifest.test.ts
// Manifest przychodzi z bucketa, którego apka nie zapisuje — tu jest granica zaufania.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseManifest } from './manifest.ts'

const card = (over: Record<string, unknown> = {}) => ({
  id: 'emo-nazwij',
  title: 'Nazwij to, co czujesz',
  area: 'emocje',
  icon: 'Heart',
  minutes: 3,
  energy: 'niska',
  needs: ['uspokojenie'],
  description: 'Krótkie zatrzymanie.',
  steps: ['Usiądź wygodnie.'],
  why: 'Nazwanie emocji porządkuje.',
  ...over,
})

const manifest = (over: Record<string, unknown> = {}) => ({
  creator: { slug: 'anna-rysnik', name: 'Anna Ryśnik', cover: 'okladka.webp' },
  title: 'Lotos Balance',
  art: { emocje: 'emocje.webp' },
  cards: [card()],
  ...over,
})

test('poprawny manifest przechodzi bez zmian treści', () => {
  const deck = parseManifest(manifest(), 'anna-rysnik')
  assert.equal(deck.title, 'Lotos Balance')
  assert.equal(deck.cards.length, 1)
  assert.equal(deck.cards[0].title, 'Nazwij to, co czujesz')
  assert.deepEqual(deck.art, { emocje: 'emocje.webp' })
})

test('uszkodzona karta wypada, reszta talii zostaje', () => {
  const deck = parseManifest(
    manifest({ cards: [card(), card({ id: 'zly', area: 'kosmos' }), card({ id: 'bez-krokow', steps: [] })] }),
    'anna-rysnik',
  )
  assert.deepEqual(deck.cards.map((c) => c.id), ['emo-nazwij'])
})

test('braki nieobowiązkowych pól dostają wartości domyślne', () => {
  const deck = parseManifest(
    manifest({ cards: [card({ energy: 'kosmiczna', description: undefined, why: undefined, needs: 'nie-lista' })] }),
    'anna-rysnik',
  )
  assert.equal(deck.cards[0].energy, 'srednia')
  assert.equal(deck.cards[0].description, '')
  assert.deepEqual(deck.cards[0].needs, [])
})

test('brak tytułu talii spada do nazwy twórczyni, brak slugu do trasy', () => {
  const deck = parseManifest(
    manifest({ title: '', creator: { name: 'Anna Ryśnik' } }),
    'anna-rysnik',
  )
  assert.equal(deck.title, 'Anna Ryśnik')
  assert.equal(deck.creator.slug, 'anna-rysnik')
})

test('talia bez nazwy twórczyni albo bez zdatnych kart nie wchodzi do aplikacji', () => {
  assert.throws(() => parseManifest(manifest({ creator: {} }), 'x'), /nazwy twórczyni/)
  assert.throws(() => parseManifest(manifest({ cards: [] }), 'x'), /żadna karta/)
  assert.throws(() => parseManifest('nie-obiekt', 'x'), /nie jest obiektem/)
})

test('grafiki spoza siedmiu obszarów są odsiewane', () => {
  const deck = parseManifest(manifest({ art: { emocje: 'ok.webp', kosmos: 'zle.webp', sens: 42 } }), 'x')
  assert.deepEqual(deck.art, { emocje: 'ok.webp' })
})
