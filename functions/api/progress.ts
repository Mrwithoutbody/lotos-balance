// functions/api/progress.ts
// POST — ukończone ćwiczenie zalogowanej osoby: tytuł ćwiczenia i data.
// Aplikacja nie zbiera już ocen samopoczucia, więc kolumny before/after zostają puste.
import { drizzle } from 'drizzle-orm/d1'
import { getSession, pagesFunction } from '../../src/server/auth'
import { progress } from '../../src/server/db/schema'

interface Body {
  creatorSlug?: string
  cardId?: string
  date?: string
}

export const onRequest = pagesFunction(async (ctx) => {
  if (ctx.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const session = await getSession(ctx)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { creatorSlug, cardId, date } = (await ctx.request.json()) as Body
  if (!creatorSlug || !cardId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response('Niepełne dane', { status: 400 })
  }

  await drizzle(ctx.env.DB).insert(progress).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    creatorSlug,
    cardId,
    date,
    createdAt: new Date(),
  })
  return Response.json({ ok: true })
})
