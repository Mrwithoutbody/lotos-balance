// src/server/db/schema.ts
// Tabele Better Auth (user/session/account/verification) + tabele kręgu.
// Podział pracy: treść talii mieszka w R2 (deck.json), D1 trzyma relacje —
// kto jest twórcą, kto kogo obserwuje, kto co ukończył.
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

// ——— Krąg ———

/** Twórczyni talii. Slug = folder w buckecie R2 i trasa /<slug>. */
export const creators = sqliteTable('creators', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  /** Konto twórczyni, gdy się zaloguje — na razie może być puste. */
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

/** Kto pracuje na czyjej talii — z tego krąg liczy „ilu znajomych tu jest”. */
export const follows = sqliteTable(
  'follows',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    creatorSlug: text('creator_slug')
      .notNull()
      .references(() => creators.slug, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.creatorSlug] })],
)

/**
 * Ukończona aktywacja zalogowanej osoby — serwerowy odpowiednik
 * ActivationSession z localStorage. Oceny przed/po to dane o samopoczuciu
 * (RODO art. 9): baza w regionie EU, udostępnianie tylko po wyraźnej zgodzie.
 */
export const progress = sqliteTable('progress', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  creatorSlug: text('creator_slug')
    .notNull()
    .references(() => creators.slug, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull(),
  /** YYYY-MM-DD. */
  date: text('date').notNull(),
  before: integer('before'),
  after: integer('after'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
