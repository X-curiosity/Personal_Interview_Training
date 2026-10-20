/* ==========================================================================
   shield.js — screenshot / capture deterrence (best effort).

   WHAT THIS DOES
   - PrintScreen keyup        → instant blackout + clipboard wipe attempt
   - Cmd/Ctrl+Shift+3/4/5/S   → instant blackout (where the browser sees them)
   - Tab hidden / window blur → full veil until focus returns
   Every trigger also wipes the window selection and blurs <body> content
   while veiled.

   WHAT THIS CANNOT DO (documented in REPORT.md — do not overclaim)
   A web page cannot stop OS-level screen capture: macOS/Windows consume
   their screenshot shortcuts before the page sees them, the compositor can
   always copy the frame, JS can be disabled, and a camera always works.
   This layer deters casual local capture (screen-grab tools, AI overlays
   that steal focus, clipboard pastes) — it is deterrence, not security.
   ========================================================================== */

(function () {
  "use strict";

  var overlay = null;
  var flashTimer = null;
  var veiled = false;   // persistent veil (blur/hidden)
  var flashed = false;  // timed veil (key strike)

  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "shield-overlay";
    overlay.setAttribute("role", "alert");
    overlay.innerHTML =
      '<div class="shield-card">' +
        '<div class="shield-glyph" aria-hidden="true">&#9632;</div>' +
        '<p class="shield-title">SCREEN PROTECTED</p>' +
        '<p class="shield-msg" data-shield-msg>Capture attempt blocked.</p>' +
      "</div>";
    overlay.addEventListener("click", function () {
      /* Click only dismisses a timed flash; a focus veil stays until the
         window genuinely regains focus. */
      if (flashed && !veiled) hide();
    });
    document.body.appendChild(overlay);
  }

  function show(msg) {
    build();
    overlay.querySelector("[data-shield-msg]").textContent = msg;
    overlay.classList.add("on");
    document.body.classList.add("shielded");
    try { window.getSelection().removeAllRanges(); } catch (e) { /* noop */ }
  }

  function hide() {
    if (!overlay) return;
    flashed = false;
    veiled = false;
    overlay.classList.remove("on");
    document.body.classList.remove("shielded");
    if (flashTimer) { window.clearTimeout(flashTimer); flashTimer = null; }
  }

  /* Timed blackout for detected capture gestures. */
  function strike(msg) {
    flashed = true;
    show(msg);
    /* Best-effort clipboard wipe so a captured PrintScreen pastes nothing.
       Requires clipboard permission; silently skipped otherwise. */
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("").catch(function () { /* denied */ });
      }
    } catch (e) { /* noop */ }
    if (flashTimer) window.clearTimeout(flashTimer);
    flashTimer = window.setTimeout(function () {
      flashed = false;
      if (!veiled) hide();
    }, 3000);
  }

  /* Persistent veil while the window is unfocused or hidden. */
  function refreshVeil() {
    var shouldVeil = document.hidden || !document.hasFocus();
    if (shouldVeil) {
      veiled = true;
      show("Window not focused. Content hidden.");
    } else if (veiled) {
      hide();
    }
  }

  document.addEventListener("keyup", function (e) {
    if (e.key === "PrintScreen" || e.keyCode === 44) {
      strike("Screenshot key detected. Screen blanked.");
    }
  });

  document.addEventListener("keydown", function (e) {
    var k = String(e.key || "").toLowerCase();
    var combo = (e.metaKey || e.ctrlKey) && e.shiftKey &&
                (k === "3" || k === "4" || k === "5" || k === "s");
    if (combo) strike("Screenshot shortcut detected. Screen blanked.");
  });

  document.addEventListener("visibilitychange", refreshVeil);
  window.addEventListener("blur", refreshVeil);
  window.addEventListener("focus", refreshVeil);
})();
