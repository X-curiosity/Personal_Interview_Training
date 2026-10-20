/* ==========================================================================
   auth.js — profile client: register/login/logout, session token in
   localStorage, and progress sync between localStorage and the account.
   Degrades silently when the API is unreachable (local-only mode).
   ========================================================================== */

(function () {
  "use strict";

  var KEY = "pit.session.v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  }
  function save(s) {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  }

  var session = load();

  function token() { return session && session.token; }
  function user() { return session && session.user; }

  /* Same-origin on Vercel; the GitHub Pages mirror calls the Vercel API
     cross-origin (allowed by the API's CORS list). */
  var API_BASE = /github\.io$/.test(location.hostname)
    ? "https://personal-interview-training.vercel.app/api/"
    : "/api/";

  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    if (token()) opts.headers.Authorization = "Bearer " + token();
    return fetch(API_BASE + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        return { ok: r.ok, status: r.status, body: body };
      });
    });
  }

  function register(email, name, password) {
    return api("register", { method: "POST", body: JSON.stringify({ email: email, name: name, password: password }) })
      .then(function (r) {
        if (r.ok) { session = { token: r.body.token, user: r.body.user }; save(session); syncNow(); }
        return r;
      });
  }

  function login(email, password) {
    return api("login", { method: "POST", body: JSON.stringify({ email: email, password: password }) })
      .then(function (r) {
        if (r.ok) {
          session = { token: r.body.token, user: r.body.user };
          save(session);
          /* pull server progress, then push the union back down to local */
          return pullToLocal().then(function () { return r; });
        }
        return r;
      });
  }

  function logout() {
    var done = token()
      ? api("logout", { method: "POST", body: "{}" }).catch(function () { return null; })
      : Promise.resolve(null);
    return done.then(function () { session = null; save(null); });
  }

  /* Push local solved ids up (server merges as a union). */
  function syncNow() {
    if (!token() || typeof PIT_STORE === "undefined") return Promise.resolve(null);
    var solved = Array.from(PIT_STORE.getSolved());
    return api("progress", { method: "POST", body: JSON.stringify({ solved: solved }) })
      .then(function (r) { return r.ok ? r.body : null; })
      .catch(function () { return null; });
  }

  /* Pull server solved ids down into localStorage. */
  function pullToLocal() {
    if (!token() || typeof PIT_STORE === "undefined") return Promise.resolve(null);
    return api("progress").then(function (r) {
      if (!r.ok || !Array.isArray(r.body.solved)) return null;
      r.body.solved.forEach(function (id) {
        if (!PIT_STORE.isSolved(id)) PIT_STORE.toggleSolved(id);
      });
      if (window.PIT && window.PIT.refreshStats) window.PIT.refreshStats();
      return r.body;
    }).catch(function () { return null; });
  }

  /* Auto-sync a few seconds after solves, debounced. */
  var timer = null;
  function syncSoon() {
    if (!token()) return;
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(syncNow, 2500);
  }

  /* Hook solve events: wrap the store marker once. */
  if (typeof PIT_STORE !== "undefined" && PIT_STORE.toggleSolved && !PIT_STORE.__authWrapped) {
    var orig = PIT_STORE.toggleSolved;
    PIT_STORE.toggleSolved = function (id) {
      var out = orig(id);
      if (PIT_STORE.isSolved(id)) syncSoon();
      return out;
    };
    PIT_STORE.__authWrapped = true;
  }

  window.PIT_AUTH = {
    user: user, token: token,
    register: register, login: login, logout: logout,
    syncNow: syncNow, pullToLocal: pullToLocal,
    online: function () { return !!token(); }
  };
})();
