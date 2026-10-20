/* GET /api/leaderboard — global board, scored server-side from synced progress. */
"use strict";

const { cors, json } = require("./_util");
const { query, dbConfigured, ensureSchema, parseSolved } = require("./_db");
const { pointsFor } = require("./_points");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "method not allowed" });
  if (!dbConfigured()) return json(res, 503, { error: "database not configured" });

  try {
    await ensureSchema();
    const { rows } = await query(
      `SELECT u.name, p.solved FROM progress p JOIN users u ON u.id = p.user_id`
    );
    const board = rows
      .map((r) => {
        const s = pointsFor(parseSolved(r.solved));
        return { name: r.name, points: s.points, solved: s.solved, hard: s.hard, medium: s.medium, easy: s.easy };
      })
      .filter((r) => r.solved > 0)
      .sort((a, b) => b.points - a.points || b.hard - a.hard || b.medium - a.medium || a.name.localeCompare(b.name))
      .slice(0, 50)
      .map((r, i) => ({ rank: i + 1, ...r }));
    return json(res, 200, { board, total: rows.length });
  } catch {
    return json(res, 500, { error: "leaderboard lookup failed" });
  }
};
