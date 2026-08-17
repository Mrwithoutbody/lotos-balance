// src/services/manifest.ts
// Bramka między bucketem a aplikacją. Manifest talii pisze człowiek (albo skrypt
// publikujący), więc zanim wejdzie do UI, sprawdzamy go i odsiewamy uszkodzone karty.
// Zła talia ma dać zdanie po polsku, nie biały ekran.
import { AREA_IDS } from '../data/areas.ts'
import type { ActivationCard, AreaId, Minutes } from '../types/index.ts'
import type { DeckManifest } from '../types/deck.ts'

const MINUTES: Minutes[] = [3, 7, 15]
const ENERGY = ['niska', 'srednia', 'wysoka']

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const isArea = (v: unknown): v is AreaId => AREA_IDS.includes(v as AreaId)

/** Karta wchodzi do talii tylko z kompletem pól, których używa ekran ćwiczenia. */
function parseCard(raw: unknown): ActivationCard | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>

  if (!isText(c.id) || !isText(c.title) || !isText(c.icon)) return null
  if (!isArea(c.area)) return null
  if (!MINUTES.includes(c.minutes as Minutes)) return null
  if (!Array.isArray(c.steps) || !c.steps.every(isText) || c.steps.length === 0) return null

  return {
    id: c.id,
    title: c.title,
    area: c.area,
    secondaryArea: isArea(c.secondaryArea) ? c.secondaryArea : undefined,
    icon: c.icon,
    minutes: c.minutes as Minutes,
    energy: ENERGY.includes(c.energy as string)
      ? (c.energy as ActivationCard['energy'])
      : 'srednia',
    needs: Array.isArray(c.needs) ? (c.needs.filter(isText) as ActivationCard['needs']) : [],
    description: isText(c.description) ? c.description : '',
    steps: c.steps as string[],
    why: isText(c.why) ? c.why : '',
    caution: isText(c.caution) ? c.caution : undefined,
  }
}

/** Rzuca, gdy manifest nie nadaje się do pokazania — komunikat trafia na ekran. */
export function parseManifest(raw: unknown, slug: string): DeckManifest {
  if (!raw || typeof raw !== 'object') throw new Error(`Talia ${slug}: manifest nie jest obiektem.`)
  const d = raw as Record<string, unknown>
  const creator = (d.creator ?? {}) as Record<string, unknown>

  if (!isText(creator.name)) throw new Error(`Talia ${slug}: brakuje nazwy twórczyni.`)

  const cards = Array.isArray(d.cards)
    ? (d.cards.map(parseCard).filter(Boolean) as ActivationCard[])
    : []
  if (cards.length === 0) throw new Error(`Talia ${slug}: żadna karta nie ma kompletu pól.`)

  const art = Object.fromEntries(
    Object.entries((d.art ?? {}) as Record<string, unknown>).filter(
      ([area, file]) => isArea(area) && isText(file),
    ),
  ) as Partial<Record<AreaId, string>>

  return {
    creator: {
      slug: isText(creator.slug) ? creator.slug : slug,
      name: creator.name,
      cover: isText(creator.cover) ? creator.cover : undefined,
      bio: isText(creator.bio) ? creator.bio : undefined,
    },
    title: isText(d.title) ? d.title : creator.name,
    art,
    cards,
  }
}
