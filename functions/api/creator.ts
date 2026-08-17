// functions/api/creator.ts
// GET /api/creator?dzien=YYYY-MM-DD — panel twórczyni: jej talie i to, co realnie
// się w nich dzieje. Liczby są zagregowane, bez userId i bez ocen — twórczyni
// ogląda własną talię w działaniu, nie ludzi.
import { drizzle } from 'drizzle-orm/d1'
import { eq, inArray } from 'drizzle-orm'
import { getSession, pagesFunction } from '../../src/server/auth'
import { creators, progress, user } from '../../src/server/db/schema'

export const onRequest = pagesFunction(async (ctx) => {
  if (ctx.request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })

  const session = await getSession(ctx)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const db = drizzle(ctx.env.DB)
  const [account] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
  if (account?.role !== 'creator' && account?.role !== 'specialist') {
    return new Response('Forbidden', { status: 403 })
  }

  const owned = await db
    .select({ slug: creators.slug, name: creators.name })
    .from(creators)
    .where(eq(creators.userId, session.user.id))
  if (owned.length === 0) return Response.json({ decks: [] })

  // Dzień liczy przeglądarka — serwer nie zna strefy czasowej użytkowniczki.
  const dzien = new URL(ctx.request.url).searchParams.get('dzien') ?? ''

  // ponytail: jedno zapytanie i liczenie w pamięci; przy dziesiątkach tysięcy
  // wierszy trzeba będzie wrócić do agregacji po stronie D1.
  const rows = await db
    .select({ slug: progress.creatorSlug, cardId: progress.cardId, userId: progress.userId, date: progress.date })
    .from(progress)
    .where(inArray(progress.creatorSlug, owned.map((d) => d.slug)))

  const decks = owned.map((deck) => {
    const swoje = rows.filter((r) => r.slug === deck.slug)
    const naKarte = new Map<string, number>()
    for (const r of swoje) naKarte.set(r.cardId, (naKarte.get(r.cardId) ?? 0) + 1)

    return {
      ...deck,
      ukonczenia: swoje.length,
      osoby: new Set(swoje.map((r) => r.userId)).size,
      dzis: swoje.filter((r) => r.date === dzien).length,
      top: [...naKarte.entries()]
        .map(([cardId, ile]) => ({ cardId, ile }))
        .sort((a, b) => b.ile - a.ile)
        .slice(0, 5),
    }
  })

  return Response.json({ decks })
})
