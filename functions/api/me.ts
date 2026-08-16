// functions/api/me.ts
// GET /api/me — kim jestem; null gdy niezalogowana.
import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../src/server/auth'
import { createAuth } from '../../src/server/auth'

export const onRequest: PagesFunction<Env> = (async (ctx: {
  env: Env
  request: { headers: Headers }
}) => {
  const session = await createAuth(ctx.env).api.getSession({ headers: ctx.request.headers })
  if (!session) return Response.json(null)
  return Response.json({ user: { name: session.user.name, email: session.user.email } })
}) as unknown as PagesFunction<Env>
