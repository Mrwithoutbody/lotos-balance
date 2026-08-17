// functions/api/me.ts
// GET /api/me — kim jestem; null gdy niezalogowana.
import { getSession, pagesFunction } from '../../src/server/auth'

export const onRequest = pagesFunction(async (ctx) => {
  const session = await getSession(ctx)
  if (!session) return Response.json(null)
  return Response.json({ user: { name: session.user.name, email: session.user.email } })
})
