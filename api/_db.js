/* SQLite client via libSQL. Points at Turso (libsql://...) in production or a
   local file: URL for development and tests. Cheapest possible real database:
   Turso free tier, actual SQLite, no credit card. */
"use strict";

const crypto = require("crypto");
const { createClient } = require("@libsql/client");

let client = null;
let schemaReady = null;

function dbConfigured() {
  return !!process.env.TURSO_DATABASE_URL;
}

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return client;
}

/* All queries go through here: plain SQL with ? placeholders, returns { rows }. */
async function query(text, args = []) {
  const rs = await getClient().execute({ sql: text, args });
  return { rows: rs.rows };
}

const nowSec = () => Math.floor(Date.now() / 1000);
const newId = () => crypto.randomUUID();
const SESSION_TTL_SEC = 30 * 24 * 60 * 60; /* 30 days */

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        name          TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    INTEGER NOT NULL
      )`);
      await query(`CREATE TABLE IF NOT EXISTS sessions (
        token      TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )`);
      await query(`CREATE TABLE IF NOT EXISTS progress (
        user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        solved     TEXT NOT NULL DEFAULT '[]',
        updated_at INTEGER NOT NULL
      )`);
      await query(`CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)`);
      await query(`CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at)`);
    })();
  }
  return schemaReady;
}

async function userForToken(token) {
  if (!token) return null;
  const { rows } = await query(
    `SELECT u.id, u.email, u.name
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?
     LIMIT 1`,
    [token, nowSec()]
  );
  return rows[0] || null;
}

/* solved is stored as a JSON string; helpers keep handlers tidy. */
function parseSolved(v) {
  try {
    const a = JSON.parse(v || "[]");
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

module.exports = {
  query, dbConfigured, ensureSchema, userForToken,
  nowSec, newId, SESSION_TTL_SEC, parseSolved,
};
