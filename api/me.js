/* GET /api/me — current profile plus synced progress and server-computed score. */
"use strict";

const { bearerToken, cors, json } = require("./_util");
const { sql, dbConfigured, ensureSchema, userForToken } = require("./_db");
const { pointsFor } = require("./_points");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "method not allowed" });
  if (!dbConfigured()) return json(res, 503, { error: "database not configured" });

  try {
    await ensureSchema();
    const user = await userForToken(bearerToken(req));
    if (!user) return json(res, 401, { error: "not signed in" });

    const { rows } = await sql`SELECT solved, updated_at FROM progress WHERE user_id = ${user.id}`;
    const solved = Array.isArray(rows[0] && rows[0].solved) ? rows[0].solved : [];
    return json(res, 200, {
      user,
      solved,
      stats: pointsFor(solved),
      updatedAt: rows[0] ? rows[0].updated_at : null,
    });
  } catch {
    return json(res, 500, { error: "profile lookup failed" });
  }
};
