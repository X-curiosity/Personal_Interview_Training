/* POST /api/logout — revoke the presented session token. */
"use strict";

const { bearerToken, cors, json } = require("./_util");
const { query, dbConfigured, ensureSchema } = require("./_db");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "method not allowed" });
  if (!dbConfigured()) return json(res, 503, { error: "database not configured" });

  const token = bearerToken(req);
  if (!token) return json(res, 401, { error: "not signed in" });

  try {
    await ensureSchema();
    await query(`DELETE FROM sessions WHERE token = ?`, [token]);
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 500, { error: "logout failed" });
  }
};
