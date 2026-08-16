// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CORS bucketa lotos-balance przepuszcza tylko :5173 i :8788 — stąd strictPort.
// Bez niego Vite po cichu bierze kolejny wolny port, a talia przestaje się wczytywać
// bez żadnego sensownego komunikatu.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 8788, strictPort: true },
})
