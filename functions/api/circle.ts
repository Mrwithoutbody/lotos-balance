// functions/api/circle.ts
// GET /api/circle — wszystko, co rysuje ekran kręgu, jednym round-tripem:
// twórczynie z licznikiem kręgu + ostatnie ukończone ćwiczenia. Feed jest
// anonimowy: bez userId i bez ocen przed/po (RODO art. 9).
import { drizzle } from 'drizzle-orm/d1'
import { desc, eq, sql } from 'drizzle-orm'
import { pagesFunction } from '../../src/server/auth'
import { creators, follows, progress } from '../../src/server/db/schema'

export const onRequest = pagesFunction(async (ctx) => {
  if (ctx.request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })

  const db = drizzle(ctx.env.DB)
  const [creatorRows, feedRows] = await Promise.all([
    db
      .select({
        slug: creators.slug,
        name: creators.name,
        followers: sql<number>`count(${follows.userId})`,
      })
      .from(creators)
      .leftJoin(follows, eq(follows.creatorSlug, creators.slug))
      .groupBy(creators.slug),
    db
      .select({
        creatorSlug: progress.creatorSlug,
        creatorName: creators.name,
        cardId: progress.cardId,
        date: progress.date,
      })
      .from(progress)
      .innerJoin(creators, eq(creators.slug, progress.creatorSlug))
      .orderBy(desc(progress.createdAt))
      .limit(30),
  ])

  return Response.json({ creators: creatorRows, feed: feedRows })
})
