// functions/api/me.ts
// GET /api/me — kim jest zalogowana osoba dla aplikacji: imię i rola.
// Bez sesji zwraca null, więc front nie musi łapać 401.
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { getSession, pagesFunction } from '../../src/server/auth'
import { user } from '../../src/server/db/schema'

export const onRequest = pagesFunction(async (ctx) => {
  if (ctx.request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })

  const session = await getSession(ctx)
  if (!session) return Response.json(null)

  const db = drizzle(ctx.env.DB)
  const [row] = await db
    .select({ name: user.name, role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))

  return Response.json({ name: row?.name ?? session.user.name, role: row?.role ?? 'user' })
})
