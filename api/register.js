/* POST /api/register — create an account with email + password. */
"use strict";

const { cleanEmail, cleanName, cleanPassword, hashPassword, newToken, cors, json, readBody } = require("./_util");
const { sql, dbConfigured, ensureSchema } = require("./_db");

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
    const { rows } = await sql`
      INSERT INTO users (email, name, password_hash)
      VALUES (${email}, ${name}, ${hashPassword(password)})
      RETURNING id, email, name`;
    const user = rows[0];
    const token = newToken();
    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, now() + interval '30 days')`;
    await sql`INSERT INTO progress (user_id) VALUES (${user.id}) ON CONFLICT DO NOTHING`;
    return json(res, 201, { token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    if (String(e && e.message).includes("users_email_key") || String(e && e.code) === "23505") {
      return json(res, 409, { error: "an account with this email already exists" });
    }
    return json(res, 500, { error: "registration failed" });
  }
};
