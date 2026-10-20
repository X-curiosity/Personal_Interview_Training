/* POST /api/register — create an account with email + password. */
"use strict";

const { cleanEmail, cleanName, cleanPassword, hashPassword, newToken, cors, json, readBody } = require("./_util");
const { query, dbConfigured, ensureSchema, nowSec, newId, SESSION_TTL_SEC } = require("./_db");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "method not allowed" });
  if (!dbConfigured()) return json(res, 503, { error: "database not configured" });

  const body = await readBody(req);
  if (!body) return json(res, 400, { error: "invalid JSON body" });

  const email = cleanEmail(body.email);
  const name = cleanName(body.name);
  const password = cleanPassword(body.password);
  if (!email) return json(res, 400, { error: "valid email address required" });
  if (!name) return json(res, 400, { error: "display name required (1 to 40 characters)" });
  if (!password) return json(res, 400, { error: "password must be 8 to 128 characters" });

  try {
    await ensureSchema();
    const id = newId();
    await query(
      `INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)`,
      [id, email, name, hashPassword(password), nowSec()]
    );
    const token = newToken();
    await query(
      `INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
      [token, id, nowSec(), nowSec() + SESSION_TTL_SEC]
    );
    await query(`INSERT INTO progress (user_id, solved, updated_at) VALUES (?, '[]', ?) ON CONFLICT DO NOTHING`, [id, nowSec()]);
    return json(res, 201, { token, user: { id, email, name } });
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE constraint failed")) {
      return json(res, 409, { error: "an account with this email already exists" });
    }
    return json(res, 500, { error: "registration failed" });
  }
};
