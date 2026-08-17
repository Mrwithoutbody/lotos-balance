// functions/api/creator.ts
// GET /api/creator — panel twórczyni: jej talie i to, co realnie się w nich dzieje.
// Liczby są zagregowane, bez userId i bez ocen — twórczyni nie ogląda osób,
// tylko własną talię w działaniu.
import { drizzle } from 'drizzle-orm/d1'
import { and, desc, eq, sql } from 'drizzle-orm'
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

  const decks = await Promise.all(
    owned.map(async (deck) => {
      const [totals] = await db
        .select({
          ukonczenia: sql<number>`count(*)`,
          osoby: sql<number>`count(distinct ${progress.userId})`,
        })
        .from(progress)
        .where(eq(progress.creatorSlug, deck.slug))

      const top = await db
        .select({ cardId: progress.cardId, ile: sql<number>`count(*)` })
        .from(progress)
        .where(eq(progress.creatorSlug, deck.slug))
        .groupBy(progress.cardId)
        .orderBy(desc(sql`count(*)`))
        .limit(5)

      const [dzis] = await db
        .select({ ile: sql<number>`count(*)` })
        .from(progress)
        .where(
          and(
            eq(progress.creatorSlug, deck.slug),
            eq(progress.date, new Date().toISOString().slice(0, 10)),
          ),
        )

      return {
        ...deck,
        ukonczenia: totals?.ukonczenia ?? 0,
        osoby: totals?.osoby ?? 0,
        dzis: dzis?.ile ?? 0,
        top,
      }
    }),
  )

  return Response.json({ decks })
})
