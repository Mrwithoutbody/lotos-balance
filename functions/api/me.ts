// functions/api/me.ts
// GET /api/me — kim jestem i w czyich kręgach; null gdy niezalogowana.
import type { PagesFunction } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import type { Env } from '../../src/server/auth'
import { createAuth } from '../../src/server/auth'
import { follows } from '../../src/server/db/schema'

export const onRequest: PagesFunction<Env> = (async (ctx: {
  env: Env
  request: { headers: Headers }
}) => {
  const auth = createAuth(ctx.env)
  const session = await auth.api.getSession({ headers: ctx.request.headers })
  if (!session) return Response.json(null)

  const mine = await drizzle(ctx.env.DB)
    .select({ slug: follows.creatorSlug })
    .from(follows)
    .where(eq(follows.userId, session.user.id))

  return Response.json({
    user: { name: session.user.name, email: session.user.email },
    follows: mine.map((r) => r.slug),
  })
}) as unknown as PagesFunction<Env>
