/* GET/POST /api/progress — read and merge the signed-in user's solved set. */
"use strict";

const { bearerToken, cors, json, readBody } = require("./_util");
const { sql, dbConfigured, ensureSchema, userForToken } = require("./_db");
const { pointsFor, VALID_IDS } = require("./_points");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (!dbConfigured()) return json(res, 503, { error: "database not configured" });

  try {
    await ensureSchema();
    const user = await userForToken(bearerToken(req));
    if (!user) return json(res, 401, { error: "not signed in" });

    if (req.method === "GET") {
      const { rows } = await sql`SELECT solved, updated_at FROM progress WHERE user_id = ${user.id}`;
      const solved = Array.isArray(rows[0] && rows[0].solved) ? rows[0].solved : [];
      return json(res, 200, { solved, stats: pointsFor(solved), updatedAt: rows[0] ? rows[0].updated_at : null });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      if (!body || !Array.isArray(body.solved)) return json(res, 400, { error: "expected { solved: [ids] }" });
      /* Union merge: the server never un-solves a problem on sync. Only known
         ids are kept, capped to the registry size. */
      const incoming = new Set();
      for (const id of body.solved) {
        if (typeof id === "string" && VALID_IDS.has(id)) incoming.add(id);
      }
      const { rows } = await sql`SELECT solved FROM progress WHERE user_id = ${user.id}`;
      const current = new Set(Array.isArray(rows[0] && rows[0].solved) ? rows[0].solved : []);
      for (const id of incoming) current.add(id);
      const merged = Array.from(current).slice(0, VALID_IDS.size);
      await sql`
        INSERT INTO progress (user_id, solved, updated_at)
        VALUES (${user.id}, ${JSON.stringify(merged)}, now())
        ON CONFLICT (user_id) DO UPDATE SET solved = EXCLUDED.solved, updated_at = now()`;
      return json(res, 200, { solved: merged, stats: pointsFor(merged) });
    }

    return json(res, 405, { error: "method not allowed" });
  } catch {
    return json(res, 500, { error: "progress sync failed" });
  }
};
