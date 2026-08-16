// functions/api/feed.ts
// GET — ostatnie ukończone aktywacje w kręgu, anonimowo. Bez userId i bez
// ocen przed/po (RODO art. 9) — publiczny feed to tylko „ktoś ukończył kartę”.
import type { PagesFunction } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import { desc, eq } from 'drizzle-orm'
import type { Env } from '../../src/server/auth'
import { creators, progress } from '../../src/server/db/schema'

export const onRequest: PagesFunction<Env> = (async (ctx: { env: Env; request: { method: string } }) => {
  if (ctx.request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })

  const rows = await drizzle(ctx.env.DB)
    .select({
      creatorSlug: progress.creatorSlug,
      creatorName: creators.name,
      cardId: progress.cardId,
      date: progress.date,
    })
    .from(progress)
    .innerJoin(creators, eq(creators.slug, progress.creatorSlug))
    .orderBy(desc(progress.createdAt))
    .limit(30)

  return Response.json(rows)
}) as unknown as PagesFunction<Env>
