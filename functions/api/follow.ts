// functions/api/follow.ts
// POST {slug} — dołącz do kręgu twórczyni; DELETE {slug} — wyjdź.
import type { PagesFunction } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import type { Env } from '../../src/server/auth'
import { createAuth } from '../../src/server/auth'
import { creators, follows } from '../../src/server/db/schema'

export const onRequest: PagesFunction<Env> = (async (ctx: {
  env: Env
  request: { method: string; headers: Headers; json(): Promise<{ slug?: string }> }
}) => {
  const { method } = ctx.request
  if (method !== 'POST' && method !== 'DELETE') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const session = await createAuth(ctx.env).api.getSession({ headers: ctx.request.headers })
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { slug } = await ctx.request.json()
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
}) as unknown as PagesFunction<Env>
