// functions/api/auth/[[route]].ts
// Cały ruch /api/auth/* obsługuje Better Auth (magic link, Google OAuth, sesje).
import { createAuth, pagesFunction } from '../../../src/server/auth'

export const onRequest = pagesFunction((ctx) => createAuth(ctx.env).handler(ctx.request))
