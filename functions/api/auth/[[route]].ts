// functions/api/auth/[[route]].ts
// Cały ruch /api/auth/* obsługuje Better Auth (magic link, Google OAuth, sesje).
import type { PagesFunction } from '@cloudflare/workers-types'
import { createAuth } from '../../../src/server/auth'
import type { Env } from '../../../src/server/auth'

export const onRequest: PagesFunction<Env> = (ctx) =>
  createAuth(ctx.env).handler(ctx.request as unknown as Request) as unknown as ReturnType<
    PagesFunction<Env>
  >
