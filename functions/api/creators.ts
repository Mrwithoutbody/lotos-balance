// functions/api/creators.ts
// GET /api/creators — twórczynie + ilu ludzi jest w ich kręgu (count z follows).
import type { PagesFunction } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import type { Env } from '../../src/server/auth'
import { creators, follows } from '../../src/server/db/schema'

export const onRequest: PagesFunction<Env> = (async (ctx: { env: Env }) => {
  const rows = await drizzle(ctx.env.DB)
    .select({
      slug: creators.slug,
      name: creators.name,
      followers: sql<number>`count(${follows.userId})`,
    })
    .from(creators)
    .leftJoin(follows, eq(follows.creatorSlug, creators.slug))
    .groupBy(creators.slug)
  return Response.json(rows)
}) as unknown as PagesFunction<Env>
