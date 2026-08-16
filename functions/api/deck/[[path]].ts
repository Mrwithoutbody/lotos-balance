// functions/api/deck/[[path]].ts
// GET — programy z bucketa R2 podane spod własnej domeny. Dzięki temu przeglądarka
// nie robi żadnego zapytania cross-origin (koniec ze sztywną listą origin na buckecie,
// więc program wstaje na dowolnym porcie deweloperskim), a my ustawiamy Cache-Control.
import type { PagesFunction } from '@cloudflare/workers-types'

/** Publiczny bucket lotos-balance (konto dadmor, jurysdykcja EU). */
const R2_URL = 'https://pub-b800680ed48f426cab8c4693966aa056.r2.dev'

// Manifest zmienia się przy każdej publikacji programu, grafiki i nagrania nie.
const MANIFEST_CACHE = 'public, max-age=300, stale-while-revalidate=3600'
const ASSET_CACHE = 'public, max-age=604800, immutable'

export const onRequest: PagesFunction = (async (ctx: {
  request: { method: string }
  params: { path?: string | string[] }
}) => {
  if (!['GET', 'HEAD'].includes(ctx.request.method)) {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const raw = ctx.params.path
  const parts = Array.isArray(raw) ? raw : raw ? [raw] : []
  // Bez „..” i pustych segmentów — ścieżka z adresu nie może wyjść poza bucket.
  if (parts.length === 0 || parts.some((p) => !p || p === '.' || p === '..')) {
    return new Response('Not Found', { status: 404 })
  }

  const upstream = await fetch(`${R2_URL}/${parts.map(encodeURIComponent).join('/')}`)
  if (!upstream.ok) return new Response('Not Found', { status: upstream.status })

  const headers = new Headers(upstream.headers)
  headers.set(
    'Cache-Control',
    parts[parts.length - 1] === 'deck.json' ? MANIFEST_CACHE : ASSET_CACHE,
  )
  return new Response(upstream.body, { status: 200, headers })
}) as unknown as PagesFunction
