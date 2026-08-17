// functions/api/follow.ts
// POST {slug} — dołącz do kręgu twórczyni; DELETE {slug} — wyjdź.
import { drizzle } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { getSession, pagesFunction } from '../../src/server/auth'
import { creators, follows } from '../../src/server/db/schema'

export const onRequest = pagesFunction(async (ctx) => {
  const { method } = ctx.request
  if (method !== 'POST' && method !== 'DELETE') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const session = await getSession(ctx)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { slug } = (await ctx.request.json()) as { slug?: string }
  if (!slug) return new Response('Brak sluga', { status: 400 })

  const db = drizzle(ctx.env.DB)
  const creator = await db.select().from(creators).where(eq(creators.slug, slug))
  if (creator.length === 0) return new Response('Nie ma takiej twórczyni', { status: 404 })

  if (method === 'POST') {
    await db
      .insert(follows)
      .values({ userId: session.user.id, creatorSlug: slug, createdAt: new Date() })
      .onConflictDoNothing()
  } else {
    await db
      .delete(follows)
      .where(and(eq(follows.userId, session.user.id), eq(follows.creatorSlug, slug)))
  }
  return Response.json({ ok: true })
})
