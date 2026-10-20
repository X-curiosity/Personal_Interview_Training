/* POST /api/login — exchange email + password for a session token. */
"use strict";

const { cleanEmail, cleanPassword, verifyPassword, newToken, cors, json, readBody } = require("./_util");
const { query, dbConfigured, ensureSchema, nowSec, SESSION_TTL_SEC } = require("./_db");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "method not allowed" });
  if (!dbConfigured()) return json(res, 503, { error: "database not configured" });

  const body = await readBody(req);
  if (!body) return json(res, 400, { error: "invalid JSON body" });

  const email = cleanEmail(body.email);
  const password = cleanPassword(body.password);
  if (!email || !password) return json(res, 400, { error: "email and password required" });

  try {
    await ensureSchema();
    const { rows } = await query(
      `SELECT id, email, name, password_hash FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    const user = rows[0];
    /* Uniform failure to avoid leaking which emails exist. */
    if (!user || !verifyPassword(password, user.password_hash)) {
      return json(res, 401, { error: "invalid email or password" });
    }
    const token = newToken();
    await query(
      `INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
      [token, user.id, nowSec(), nowSec() + SESSION_TTL_SEC]
    );
    return json(res, 200, { token, user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return json(res, 500, { error: "login failed" });
  }
};
