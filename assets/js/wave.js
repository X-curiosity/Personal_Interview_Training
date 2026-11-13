/* ==========================================================================
   wave.js — value-change-dump parser and waveform viewer.

   The Verilog runner can return a VCD (see runner-service `dump: true`); this
   file turns it into an interactive timing diagram: one row per signal, clocks
   highlighted, vectors shown as hex boxes, wheel to zoom and drag to pan.

   Exposed as window.PIT_WAVE:
     parse(vcd)                 -> { signals, endTime, unit, truncated, skipped }
     render(container, vcd)     -> renders a panel, returns the parsed model
   ========================================================================== */

(function () {
  "use strict";

  var LIMITS = { maxSignals: 32, maxTransitions: 40000, maxRows: 32 };

  var TIME_UNITS = ["s", "ms", "us", "ns", "ps", "fs"];

  function parseTimescale(text) {
    var m = /^\s*(\d+)\s*(s|ms|us|ns|ps|fs)\s*$/.exec(text || "");
    if (!m) return { factor: 1, unit: "ns", label: "ns" };
    return { factor: parseInt(m[1], 10) || 1, unit: m[2], label: m[1] + m[2] };
  }

  /* Value changes are kept as strings: scalars are "0"/"1"/"x"/"z",
     vectors are binary strings trimmed of leading zeros for display. */
  function normaliseVector(bits) {
    var trimmed = String(bits).replace(/^0+(?=.)/, "");
    return trimmed === "" ? "0" : trimmed;
  }

  var BODY_DIRECTIVES = {
    "$end": 1, "$dumpvars": 1, "$dumpall": 1, "$dumpon": 1, "$dumpoff": 1,
    "$enddefinitions": 1, "$comment": 1
  };

  function parse(text, limits) {
    limits = limits || LIMITS;
    var signals = [];
    var byId = {};
    var scope = [];
    var time = 0;
    var endTime = 0;
    var timescale = { factor: 1, unit: "ns", label: "ns" };
    var transitions = 0;
    var truncated = false;
    var skipped = [];
    var inHeader = true;
    var inComment = false;
    var pendingScope = null;
    var pendingVarTokens = null;

    /* VCD identifiers are aliases: a port and the net it connects to often
       share one id and therefore one row. Only the first declaration creates
       the row; later aliases are noted on it. */
    function addSignal(type, width, id, name) {
      var full = scope.concat([name]).join(".");
      var existing = byId[id];
      if (existing) {
        if (existing.aliases.indexOf(full) === -1) existing.aliases.push(full);
        return;
      }
      if (signals.length >= limits.maxSignals) {
        skipped.push(name);
        return;
      }
      var sig = {
        id: id,
        name: name,
        fullName: full,
        aliases: [],
        type: type,
        width: width,
        isClock: /(^|[._])(clk|clock)(\b|$)/i.test(name) || /clk/i.test(name),
        changes: []
      };
      byId[id] = sig;
      signals.push(sig);
    }

    function record(id, value) {
      var sig = byId[id];
      if (!sig) return;
      var last = sig.changes.length ? sig.changes[sig.changes.length - 1] : null;
      if (last && last.t === time) {
        last.v = value;
        return;
      }
      if (transitions >= limits.maxTransitions) {
        truncated = true;
        return;
      }
      sig.changes.push({ t: time, v: value });
      transitions += 1;
    }

    var lines = String(text || "").split(/\r?\n/);

    for (var li = 0; li < lines.length && !truncated; li++) {
      var raw = lines[li];
      var line = raw.trim();
      if (!line) continue;

      /* header sections */
      if (inHeader) {
        if (pendingScope) {
          if (line.indexOf("$end") !== -1) pendingScope = null;
          continue;
        }
        if (pendingVarTokens) {
          pendingVarTokens = pendingVarTokens.concat(line.split(/\s+/));
          if (line.indexOf("$end") !== -1) {
            finishVar(pendingVarTokens);
            pendingVarTokens = null;
          }
          continue;
        }
        if (line.charAt(0) === "$") {
          var parts = line.split(/\s+/);
          if (parts[0] === "$scope") {
            scope.push(parts[2] || parts[1] || "scope");
            if (line.indexOf("$end") === -1) pendingScope = true;
          } else if (parts[0] === "$upscope") {
            scope.pop();
          } else if (parts[0] === "$timescale") {
            var rest = line.replace("$timescale", "").replace("$end", "").trim();
            if (rest) timescale = parseTimescale(rest);
            else {
              /* value can sit on the next line */
              var next = (lines[li + 1] || "").replace("$end", "").trim();
              if (next) timescale = parseTimescale(next);
              li += 1;
            }
          } else if (parts[0] === "$var") {
            if (line.indexOf("$end") === -1) pendingVarTokens = parts;
            else finishVar(parts);
          } else if (parts[0] === "$enddefinitions") {
            inHeader = false;
          }
          continue;
        }
        continue;
      }

      /* body: "#time" and value changes, possibly several per line */
      var tokens = line.split(/\s+/);
      for (var ti = 0; ti < tokens.length; ti++) {
        var tok = tokens[ti];
        if (!tok) continue;
        if (inComment) {
          if (tok === "$end") inComment = false;
          continue;
        }
        if (tok.charAt(0) === "#") {
          time = parseInt(tok.slice(1), 10) || time;
          if (time > endTime) endTime = time;
        } else if (tok === "$comment") {
          inComment = true;
        } else if (BODY_DIRECTIVES[tok]) {
          /* $dumpvars / $dumpall / $end carry no value of their own */
        } else if (tok.charAt(0) === "b" || tok.charAt(0) === "B") {
          var bits = tok.slice(1);
          var id = tokens[ti + 1];
          if (id) {
            record(id, normaliseVector(bits));
            ti += 1;
          }
        } else if (tok.charAt(0) === "r") {
          var rid = tokens[ti + 1];
          if (rid) { record(rid, tok.slice(1)); ti += 1; }
        } else if (tok.length >= 2) {
          record(tok.slice(1), tok.charAt(0));
        }
      }
    }

    function finishVar(parts) {
      /* $var wire 8 ! data [7:0] $end  */
      var type = parts[1];
      var width = parseInt(parts[2], 10) || 1;
      var id = parts[3];
      var name = parts[4] || id;
      var range = parts[5] && parts[5].indexOf("[") === 0 ? parts[5] : "";
      if (!id) return;
      addSignal(type, width, id, range ? name + range : name);
    }

    /* Two scopes can expose the same short name; qualify only those. */
    var nameCount = {};
    signals.forEach(function (s) { nameCount[s.name] = (nameCount[s.name] || 0) + 1; });
    signals.forEach(function (s) {
      s.label = nameCount[s.name] > 1 ? s.fullName : s.name;
    });

    /* A signal that never changes still needs one level to draw. */
    signals.forEach(function (s) {
      if (!s.changes.length) s.changes.push({ t: 0, v: s.width > 1 ? "0" : "0" });
    });

    return {
      signals: signals,
      endTime: endTime,
      timescale: timescale,
      truncated: truncated,
      skipped: skipped,
      transitions: transitions
    };
  }

  /* ---------- formatting ---------- */

  function timeLabel(model, t) {
    var ts = model.timescale || { factor: 1, unit: "ns" };
    var value = t * (ts.factor || 1);
    if (Number.isInteger(value)) return value + " " + ts.unit;
    return (Math.round(value * 100) / 100) + " " + ts.unit;
  }

  function hex(value, width) {
    if (/^[xz]/i.test(value)) return value.toUpperCase();
    var n = parseInt(value, 2);
    if (isNaN(n)) return value;
    var digits = Math.max(1, Math.ceil((width || value.length) / 4));
    var s = n.toString(16).toUpperCase();
    while (s.length < digits) s = "0" + s;
    return "0x" + s;
  }

  function signalValueText(sig, value) {
    if (sig.width > 1) {
      if (value === "x" || value === "z") return value.toUpperCase();
      return hex(value, sig.width);
    }
    return value.toUpperCase();
  }

  /* ---------- rendering ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render(container, vcd, options) {
    options = options || {};
    var model = options.model || parse(vcd, options.limits);
    var signals = model.signals.slice(0, options.maxRows || LIMITS.maxRows);

    if (!signals.length) {
      container.innerHTML =
        '<p class="wave-empty">// no signals in the dump. Add a testbench that toggles a clock, ' +
        "then run again.</p>";
      return model;
    }

    var rowH = 26;
    var labelW = 168;
    var padTop = 22;
    var height = padTop + signals.length * rowH + 10;
    var endTime = Math.max(model.endTime, 1);

    var state = {
      span: endTime,
      start: 0,
      width: 0,
      plotW: 0
    };

    var wrap = document.createElement("div");
    wrap.className = "wave-panel";
    wrap.innerHTML =
      '<div class="wave-toolbar">' +
        '<span class="wave-title">Waveforms</span>' +
        '<span class="wave-meta" data-wave-meta></span>' +
        '<span class="wave-actions">' +
          '<button type="button" class="btn ghost small" data-wave-zoom-in aria-label="Zoom in">+</button>' +
          '<button type="button" class="btn ghost small" data-wave-zoom-out aria-label="Zoom out">−</button>' +
          '<button type="button" class="btn ghost small" data-wave-fit>Fit</button>' +
        "</span>" +
      "</div>" +
      '<div class="wave-scroll" data-wave-scroll></div>' +
      (model.truncated
        ? '<p class="wave-note">The dump was truncated; only the first transitions are drawn.</p>'
        : "") +
      (model.skipped && model.skipped.length
        ? '<p class="wave-note">' + model.skipped.length +
          " further signals are hidden to keep the diagram readable.</p>"
        : "");

    container.innerHTML = "";
    container.appendChild(wrap);

    var scroll = wrap.querySelector("[data-wave-scroll]");
    var meta = wrap.querySelector("[data-wave-meta]");

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "wave-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label",
      "Timing diagram of " + signals.length + " signals over " + timeLabel(model, model.endTime));
    scroll.appendChild(svg);

    function draw() {
      var width = Math.max(360, scroll.clientWidth || container.clientWidth || 880);
      var plotW = Math.max(120, width - labelW - 12);
      state.width = width;
      state.plotW = plotW;

      var pxPerTime = plotW / state.span;
      var offset = state.start;
      var xOf = function (t) { return labelW + (t - offset) * pxPerTime; };

      svg.setAttribute("viewBox", "0 0 " + width + " " + height);
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", height);

      var parts = [];
      parts.push('<rect x="0" y="0" width="' + width + '" height="' + height +
        '" fill="var(--bg-raised)"/>');

      /* time grid */
      var ticks = 8;
      var step = state.span / ticks;
      var nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
      for (var i = 0; i < nice.length; i++) {
        if (nice[i] >= step) { step = nice[i]; break; }
      }
      var first = Math.ceil(offset / step) * step;
      for (var t = first; t <= offset + state.span; t += step) {
        var x = xOf(t);
        parts.push('<line x1="' + x + '" y1="' + padTop + '" x2="' + x +
          '" y2="' + (height - 6) + '" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>');
        parts.push('<text x="' + (x + 3) + '" y="14" class="wave-tick">' +
          esc(timeLabel(model, t)) + "</text>");
      }

      /* signals */
      signals.forEach(function (sig, row) {
        var y0 = padTop + row * rowH;
        var mid = y0 + rowH / 2;
        var top = y0 + 6;
        var bottom = y0 + rowH - 6;
        var color = sig.isClock ? "var(--accent)" : "var(--track-python)";

        if (row % 2 === 1) {
          parts.push('<rect x="0" y="' + y0 + '" width="' + width + '" height="' + rowH +
            '" fill="rgba(255,255,255,0.025)"/>');
        }
        parts.push('<line x1="' + labelW + '" y1="' + (y0 + rowH) + '" x2="' + width +
          '" y2="' + (y0 + rowH) + '" stroke="rgba(255,255,255,0.06)"/>');
        parts.push('<text x="8" y="' + (mid + 4) + '" class="wave-label' +
          (sig.isClock ? " wave-clock" : "") + '">' + esc(sig.label || sig.name) + "</text>");
        parts.push('<text x="' + (labelW - 10) + '" y="' + (mid + 4) +
          '" class="wave-width" text-anchor="end">' +
          (sig.width > 1 ? sig.width + "b" : "") + "</text>");

        var changes = sig.changes;
        var segs = [];
        for (var c = 0; c < changes.length; c++) {
          var start = changes[c].t;
          if (start > offset + state.span + 1) break;
          var next = c + 1 < changes.length ? changes[c + 1].t : endTime;
          var x1 = Math.max(labelW, xOf(start));
          var x2 = Math.min(width, xOf(next));
          if (x2 <= labelW || x1 >= width) continue;
          segs.push({
            x1: Math.max(x1, labelW), x2: Math.max(x2, x1),
            v: changes[c].v,
            width: x2 - x1
          });
        }

        /* vertical transitions between consecutive levels */
        for (var s = 1; s < segs.length; s++) {
          var xv = segs[s].x1;
          parts.push('<line x1="' + xv + '" y1="' + top + '" x2="' + xv + '" y2="' + bottom +
            '" stroke="' + color + '" stroke-width="1.5"/>');
        }

        segs.forEach(function (seg) {
          var isVector = sig.width > 1;
          if (!isVector) {
            var level = seg.v === "1" ? top : (seg.v === "0" ? bottom : (top + bottom) / 2);
            parts.push('<line x1="' + seg.x1 + '" y1="' + level + '" x2="' + seg.x2 +
              '" y2="' + level + '" stroke="' + color + '" stroke-width="2"/>');
            if (seg.v !== "0" && seg.v !== "1" && seg.width > 6) {
              parts.push('<text x="' + (seg.x1 + 2) + '" y="' + (mid - 5) +
                '" class="wave-value">' + esc(sig.width > 1 ? hex(seg.v, sig.width) : seg.v.toUpperCase()) +
                "</text>");
            }
          } else {
            /* vector: a stretched hexagon with the value inside */
            var curve = Math.min(6, Math.max(0, seg.width / 4));
            parts.push('<polygon points="' +
              seg.x1 + "," + mid + " " +
              (seg.x1 + curve) + "," + top + " " +
              (seg.x2 - curve) + "," + top + " " +
              seg.x2 + "," + mid + " " +
              (seg.x2 - curve) + "," + bottom + " " +
              (seg.x1 + curve) + "," + bottom +
              '" fill="none" stroke="' + color + '" stroke-width="1.5"/>');
            var text = signalValueText(sig, seg.v);
            if (seg.width > 26) {
              parts.push('<text x="' + (seg.x1 + seg.width / 2) + '" y="' + (mid + 4) +
                '" class="wave-value" text-anchor="middle">' + esc(text) + "</text>");
            }
          }
        });
      });

      parts.push('<line x1="' + labelW + '" y1="' + padTop + '" x2="' + labelW +
        '" y2="' + (height - 6) + '" stroke="var(--ink)" stroke-width="2"/>');

      svg.innerHTML = parts.join("");
      if (meta) {
        meta.textContent = signals.length + " signals · " + model.transitions +
          " transitions · 0 to " + timeLabel(model, model.endTime);
      }
    }

    function clampView() {
      state.span = Math.max(2, Math.min(endTime, state.span));
      state.start = Math.max(0, Math.min(state.start, endTime - state.span));
    }

    function zoom(factor, anchorFraction) {
      var anchorTime = state.start + state.span * (anchorFraction == null ? 0.5 : anchorFraction);
      state.span = state.span / factor;
      clampView();
      state.start = Math.max(0, Math.min(anchorTime - state.span * (anchorFraction == null ? 0.5 : anchorFraction),
        endTime - state.span));
      draw();
    }

    wrap.querySelector("[data-wave-zoom-in]").addEventListener("click", function () { zoom(1.6); });
    wrap.querySelector("[data-wave-zoom-out]").addEventListener("click", function () { zoom(1 / 1.6); });
    wrap.querySelector("[data-wave-fit]").addEventListener("click", function () {
      state.span = endTime; state.start = 0; draw();
    });

    svg.addEventListener("wheel", function (e) {
      if (!e.deltaY) return;
      e.preventDefault();
      var rect = svg.getBoundingClientRect();
      var fraction = (e.clientX - rect.left - labelW) / Math.max(1, state.plotW);
      fraction = Math.max(0, Math.min(1, fraction));
      zoom(e.deltaY < 0 ? 1.2 : 1 / 1.2, fraction);
    }, { passive: false });

    var dragging = null;
    svg.addEventListener("pointerdown", function (e) {
      dragging = { x: e.clientX, start: state.start };
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragging.x;
      var perPixel = state.span / Math.max(1, state.plotW);
      state.start = dragging.start - dx * perPixel;
      clampView();
      draw();
    });
    svg.addEventListener("pointerup", function () { dragging = null; });
    svg.addEventListener("pointercancel", function () { dragging = null; });

    var resizeTimer = null;
    function onResize() {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(draw, 120);
    }
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("resize", onResize);
    }

    draw();
    return model;
  }

  window.PIT_WAVE = { parse: parse, render: render, hex: hex, timeLabel: timeLabel };
})();
