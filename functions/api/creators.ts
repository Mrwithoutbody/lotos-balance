// functions/api/creators.ts
// GET /api/creators — lista talii na ekran startowy. Tylko to, co rysuje UI:
// slug do trasy i nazwa twórczyni. Reszta manifestu idzie z R2.
import { drizzle } from 'drizzle-orm/d1'
import { pagesFunction } from '../../src/server/auth'
import { creators } from '../../src/server/db/schema'

export const onRequest = pagesFunction(async (ctx) => {
  if (ctx.request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })

  const rows = await drizzle(ctx.env.DB)
    .select({ slug: creators.slug, name: creators.name })
    .from(creators)

  return Response.json(rows)
})
