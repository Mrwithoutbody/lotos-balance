// functions/api/creators.ts
// GET /api/creators — lista twórczyń kręgu z D1. Treść ich talii front bierze z R2.
import type { PagesFunction } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import type { Env } from '../../src/server/auth'
import { creators } from '../../src/server/db/schema'

export const onRequest: PagesFunction<Env> = (async (ctx: { env: Env }) => {
  const rows = await drizzle(ctx.env.DB)
    .select({ slug: creators.slug, name: creators.name })
    .from(creators)
  return Response.json(rows)
}) as unknown as PagesFunction<Env>
