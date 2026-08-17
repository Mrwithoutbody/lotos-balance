// src/lib/auth-client.ts
// Klient Better Auth — ten sam origin co API (/api/auth), więc bez baseURL.
import { createAuthClient } from 'better-auth/react'
import { magicLinkClient } from 'better-auth/client/plugins'

const authClient = createAuthClient({
  plugins: [magicLinkClient()],
})

export const { useSession, signIn, signOut } = authClient
