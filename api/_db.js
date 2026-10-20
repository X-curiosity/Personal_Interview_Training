/* Postgres client + lazy schema. Works with Vercel Postgres (Neon) env vars. */
"use strict";

const { sql } = require("@vercel/postgres");

let schemaReady = null;

function dbConfigured() {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email         text NOT NULL UNIQUE,
          name          text NOT NULL,
          password_hash text NOT NULL,
          created_at    timestamptz NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token      text PRIMARY KEY,
          user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at timestamptz NOT NULL DEFAULT now(),
          expires_at timestamptz NOT NULL
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS progress (
          user_id    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          solved     jsonb NOT NULL DEFAULT '[]',
          updated_at timestamptz NOT NULL DEFAULT now()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at)`;
    })();
  }
  return schemaReady;
}

async function userForToken(token) {
  if (!token) return null;
  const { rows } = await sql`
    SELECT u.id, u.email, u.name
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > now()
    LIMIT 1`;
  return rows[0] || null;
}

module.exports = { sql, dbConfigured, ensureSchema, userForToken };
