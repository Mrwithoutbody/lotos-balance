// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run dev` to samo Vite, bez Functions — więc /api/deck (na produkcji funkcja
// proxy do R2) w devie leci prosto do bucketa. Proxy działa po stronie serwera,
// więc CORS bucketa nie ma tu nic do rzeczy i port może być dowolny.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api/deck': {
        target: 'https://pub-b800680ed48f426cab8c4693966aa056.r2.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deck/, ''),
      },
    },
  },
  preview: { host: true },
})
