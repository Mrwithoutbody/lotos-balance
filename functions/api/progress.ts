// functions/api/progress.ts
// POST — ukończona aktywacja zalogowanej osoby. Oceny przed/po to dane
// o samopoczuciu (RODO art. 9): zapis wyłącznie własnych sesji, baza w EU.
import type { PagesFunction } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import type { Env } from '../../src/server/auth'
import { createAuth } from '../../src/server/auth'
import { progress } from '../../src/server/db/schema'

interface Body {
  creatorSlug?: string
  cardId?: string
  date?: string
  before?: number
  after?: number
}

export const onRequest: PagesFunction<Env> = (async (ctx: {
  env: Env
  request: { method: string; headers: Headers; json(): Promise<Body> }
}) => {
  if (ctx.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const session = await createAuth(ctx.env).api.getSession({ headers: ctx.request.headers })
  if (!session) return new Response('Unauthorized', { status: 401 })

  const body = await ctx.request.json()
  if (!body.creatorSlug || !body.cardId || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? '')) {
    return new Response('Niepełne dane', { status: 400 })
  }

  await drizzle(ctx.env.DB).insert(progress).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    creatorSlug: body.creatorSlug,
    cardId: body.cardId,
    date: body.date!,
    before: body.before ?? null,
    after: body.after ?? null,
    createdAt: new Date(),
  })
  return Response.json({ ok: true })
}) as unknown as PagesFunction<Env>
