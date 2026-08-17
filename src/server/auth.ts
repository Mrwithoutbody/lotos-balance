// src/server/auth.ts
// Fabryka Better Auth — instancja powstaje per-request, bo bindingi (D1, sekrety)
// przychodzą w env dopiero w czasie żądania (Cloudflare Pages Functions).
import type { D1Database, PagesFunction } from '@cloudflare/workers-types'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './db/schema'

export interface Env {
  DB: D1Database
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  BREVO_API_KEY: string
  /** Sam adres nadawcy, bez nazwy — domena musi być uwierzytelniona w Brevo. */
  MAIL_FROM: string
}

/**
 * Kontekst funkcji opisany typami DOM: @cloudflare/workers-types kłóci się tutaj
 * z lib DOM, a funkcje potrzebują tylko env, request i params.
 */
export interface Ctx {
  env: Env
  request: Request
  params: Record<string, string | string[]>
}

/** Zdejmuje z każdego pliku funkcji to samo rzutowanie na PagesFunction. */
export const pagesFunction = (fn: (ctx: Ctx) => Promise<Response>) =>
  fn as unknown as PagesFunction<Env>

/** Sesja zalogowanej osoby albo null. */
export const getSession = (ctx: Ctx) =>
  createAuth(ctx.env).api.getSession({ headers: ctx.request.headers })

export function createAuth(env: Env) {
  return betterAuth({
    database: drizzleAdapter(drizzle(env.DB, { schema }), { provider: 'sqlite' }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [
      magicLink({
        async sendMagicLink({ email, url }) {
          // Dev bez klucza: link ląduje w logu wranglera zamiast w mailu.
          // Tylko localhost — na produkcji brak klucza ma być błędem, nie ciszą.
          if (!env.BREVO_API_KEY && env.BETTER_AUTH_URL?.startsWith('http://localhost')) {
            console.log(`[dev] Magic link dla ${email}: ${url}`)
            return
          }
          const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': env.BREVO_API_KEY,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              sender: { email: env.MAIL_FROM, name: 'Lotos Balance' },
              to: [{ email }],
              subject: 'Twój link do logowania — Lotos Balance',
              htmlContent: `<p>Kliknij, aby się zalogować:</p><p><a href="${url}">Zaloguj się do Lotos Balance</a></p><p>Link wygasa po kilku minutach. Jeśli to nie Ty — zignoruj tę wiadomość.</p>`,
            }),
          })
          if (!res.ok) throw new Error(`Brevo: ${res.status} ${await res.text()}`)
        },
      }),
    ],
  })
}
