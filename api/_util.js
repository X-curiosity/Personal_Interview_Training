/* Shared helpers for the API: validation, hashing, sessions, CORS. */
"use strict";

const crypto = require("crypto");

/* ---------- validation ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function cleanEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  return EMAIL_RE.test(s) && s.length <= 254 ? s : null;
}

function cleanName(v) {
  const s = String(v || "").trim().replace(/\s+/g, " ");
  return s.length >= 1 && s.length <= 40 ? s : null;
}

function cleanPassword(v) {
  const s = String(v || "");
  return s.length >= 8 && s.length <= 128 ? s : null;
}

/* ---------- password hashing (scrypt, built-in) ---------- */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

function verifyPassword(password, stored) {
  const parts = String(stored || "").split(":");
  if (parts.length !== 2) return false;
  const expect = Buffer.from(parts[1], "hex");
  const actual = crypto.scryptSync(password, parts[0], 64);
  return expect.length === actual.length && crypto.timingSafeEqual(expect, actual);
}

/* ---------- sessions ---------- */

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

function bearerToken(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

/* ---------- HTTP helpers ---------- */

/* The API is same-origin on Vercel; the GitHub Pages mirror is cross-origin. */
const ALLOWED_ORIGINS = [
  "https://personal-interview-training.vercel.app",
  "https://x-curiosity.github.io",
  "http://localhost:8000",
  "http://localhost:3000",
  "http://localhost:8931",
];

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw.length > 64 * 1024) return null;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return null;
  }
}

module.exports = {
  cleanEmail, cleanName, cleanPassword,
  hashPassword, verifyPassword,
  newToken, bearerToken,
  cors, json, readBody,
};
