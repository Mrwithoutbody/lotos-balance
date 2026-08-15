// drizzle.config.ts — tylko generowanie migracji SQL; aplikuje je wrangler d1 migrations.
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
})
