// ROVER RESCUE: Mission to Discover
// A self-contained educational rover game for Lunar Echoes.
// Data: rover-data.json (missions, samples, instruments, questions, sources).
// ALL instrument readings are SIMULATED (see rover-data.json "_note").
// Progress is kept in sessionStorage only (nothing is sent anywhere).

(function () {
  "use strict";

  var STORE = "lunar-echoes-rover-v1";
  var WORLD_W = 2200, WORLD_H = 1500;
  var SPEED = 190;          // world px per second
  var REACH = 72;           // how close the rover must be to collect
  var SWATCH = {
    mare_basalt: "#3c3d42", anorthosite: "#e6e7ea", breccia: "#7d7f86", regolith: "#8f9095",
    orange_glass: "#e0822f", olivine_basalt: "#3a3330", hematite_spherules: "#6f7584",
    layered_sandstone: "#d1b48a", red_dust: "#b4502a", gypsum_vein: "#f4f1ea"
  };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DATA = null;    // rover-data.json
  var M = null;       // current mission definition
  var S = null;       // current mission state (saved)
  var canvas, ctx, terrain = null;
  var keys = {}, pad = {};
  var particles = [];
  var lastT = 0, running = false, warnAt = 0, chargeGlow = 0, saveAt = 0;
  var lab = { code: null, tab: "instruments" };
  var $ = function (id) { return document.getElementById(id); };

  // ---------- small helpers ----------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad3(n) { return ("00" + n).slice(-3); }
  function rng(seed) { // mulberry32: same terrain every visit
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function instById(id) {
    for (var i = 0; i < DATA.instruments.length; i++) if (DATA.instruments[i].id === id) return DATA.instruments[i];
    return null;
  }
  function sampleByCode(code) {
    for (var i = 0; i < S.samples.length; i++) if (S.samples[i].code === code) return S.samples[i];
    return null;
  }
  function usedCount(s) { return Object.keys(s.inst).length; }
  function simTag() { var t = el("span", "sim-tag", "SIMULATED"); t.title = "Illustrative value, not a real NASA measurement"; return t; }

  // ---------- saving (session only) ----------
  function readAll() {
    try { return JSON.parse(sessionStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function save() {
    if (!S) return;
    try {
      var all = readAll();
      all[S.mission] = S;
      sessionStorage.setItem(STORE, JSON.stringify(all));
    } catch (e) { /* storage unavailable: the game still works for this visit */ }
    // Small mirror for the site-wide Explorer's Logbook (samples, instruments, answers only)
    try {
      var slim = {};
      Object.keys(all || {}).forEach(function (m) {
        slim[m] = { samples: (all[m].samples || []).map(function (s) { return { inst: s.inst, answers: s.answers }; }) };
      });
      localStorage.setItem("lunar-echoes-rover-mirror-v1", JSON.stringify(slim));
    } catch (e) { /* optional */ }
  }
  function freshState(id) {
    return {
      mission: id, x: 1100, y: 760, angle: -Math.PI / 2, energy: DATA.energy.start,
      samples: [], collected: {}, counter: 0, distance: 0, acc: 0, recharges: 0,
      points: 0, notes: "", complete: false, trail: []
    };
  }

  // ---------- toasts ----------
  function toast(msg, kind) {
    var box = $("toasts");
    var t = el("div", "toast" + (kind ? " " + kind : ""), msg);
    box.appendChild(t);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3600);
  }

  // ---------- startup ----------
  async function boot() {
    try {
      var r = await fetch("rover-data.json", { cache: "no-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      DATA = await r.json();
    } catch (e) {
      var msg = "The game data (rover-data.json) could not be loaded. ";
      if (location.protocol === "file:") msg += "Open this page through a local server (see the README).";
      else msg += e.message;
      $("load-status").textContent = msg;
      document.querySelectorAll(".mission-card").forEach(function (b) { b.disabled = true; });
      return;
    }
    $("sim-note").textContent = DATA.simulatedNote;
    $("sim-note-2").textContent = DATA.simulatedNote;
    $("disclaimer").textContent = DATA.disclaimer;

    canvas = $("world");
    ctx = canvas.getContext("2d");

    document.querySelectorAll(".mission-card").forEach(function (b) {
      b.addEventListener("click", function () { startMission(b.getAttribute("data-mission")); });
    });
    $("btn-switch").addEventListener("click", showSelect);
    $("btn-collect").addEventListener("click", collect);
    $("btn-lab").addEventListener("click", function () { openLab(); });
    $("btn-journal").addEventListener("click", openJournal);
    $("btn-recharge").addEventListener("click", recharge);
    document.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () { b.closest("dialog").close(); });
    });
    document.querySelectorAll("dialog").forEach(function (d) {
      d.addEventListener("close", function () { refreshPanel(); canvas.focus({ preventScroll: true }); });
    });

    renderInstrumentList();
    bindInput();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas.parentNode);
    window.addEventListener("resize", resize);

    // Deep link: rover/index.html#moon or #mars starts that mission
    var h = location.hash.replace("#", "");
    if (DATA.missions[h]) startMission(h);
  }

  function showSelect() {
    save();
    running = false;
    $("play").hidden = true;
    $("select").hidden = false;
    document.body.className = "";
    if (history.replaceState) history.replaceState(null, "", location.pathname);
  }

  function startMission(id) {
    M = DATA.missions[id];
    M.id = id;
    var saved = readAll()[id];
    S = saved && saved.mission === id ? saved : freshState(id);
    if (!S.trail) S.trail = [];
    document.body.className = "m-" + id;
    $("select").hidden = true;
    $("play").hidden = false;
    $("hud-mission").textContent = M.name;
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    terrain = buildTerrain(id);
    resize();
    refreshPanel();
    canvas.focus({ preventScroll: true });
    if (!saved) toast(M.intro);
    else toast("Welcome back. Your " + M.short + " progress was restored.");
    if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(loop); }
  }

  // ---------- terrain (drawn once to an offscreen canvas) ----------
  function buildTerrain(id) {
    var p = M.palette;
    var c = document.createElement("canvas");
    c.width = WORLD_W; c.height = WORLD_H;
    var g = c.getContext("2d");
    var R = rng(id === "moon" ? 1969 : 2004);

    g.fillStyle = p.ground;
    g.fillRect(0, 0, WORLD_W, WORLD_H);

    // large soft patches for variety
    for (var i = 0; i < 26; i++) {
      var x = R() * WORLD_W, y = R() * WORLD_H, r = 120 + R() * 260;
      var grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, p.ground2); grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }

    if (id === "moon") {
      // bright highlands toward the top right, around the anorthosite site
      var hg = g.createRadialGradient(1600, 260, 40, 1600, 260, 560);
      hg.addColorStop(0, "#a9aab0"); hg.addColorStop(1, "rgba(169,170,176,0)");
      g.fillStyle = hg; g.fillRect(0, 0, WORLD_W, WORLD_H);
      // darker mare plain toward the left
      var mg = g.createRadialGradient(480, 480, 40, 480, 480, 520);
      mg.addColorStop(0, "#4f5055"); mg.addColorStop(1, "rgba(79,80,85,0)");
      g.fillStyle = mg; g.fillRect(0, 0, WORLD_W, WORLD_H);
      // orange patch
      var og = g.createRadialGradient(1720, 1180, 5, 1720, 1180, 90);
      og.addColorStop(0, "rgba(224,130,47,.85)"); og.addColorStop(1, "rgba(224,130,47,0)");
      g.fillStyle = og; g.beginPath(); g.arc(1720, 1180, 90, 0, 7); g.fill();
    } else {
      // pale layered outcrop
      g.save(); g.translate(1080, 940); g.rotate(-0.15);
      for (var b = 0; b < 7; b++) {
        g.fillStyle = b % 2 ? "#c9a679" : "#b8935f";
        g.fillRect(-170, -70 + b * 20, 340, 14);
      }
      g.restore();
      // white vein
      g.strokeStyle = "#f4f1ea"; g.lineWidth = 4; g.lineCap = "round";
      g.beginPath(); g.moveTo(1690, 1110); g.lineTo(1735, 1145); g.lineTo(1760, 1190); g.lineTo(1815, 1215); g.stroke();
      // grey spherule field
      for (var s = 0; s < 90; s++) {
        var a = R() * 7, d = R() * 70;
        g.fillStyle = "#6f7584";
        g.beginPath(); g.arc(1450 + Math.cos(a) * d, 420 + Math.sin(a) * d, 2 + R() * 2, 0, 7); g.fill();
      }
    }

    // speckles
    for (var k = 0; k < 2600; k++) {
      g.fillStyle = R() < 0.5 ? p.speck : p.ground2;
      g.fillRect(R() * WORLD_W, R() * WORLD_H, 1 + R() * 2, 1 + R() * 2);
    }

    function nearSite(x, y, min) {
      for (var i = 0; i < M.sites.length; i++) {
        var st = M.sites[i];
        if (Math.hypot(st.x - x, st.y - y) < min) return true;
      }
      return Math.hypot(1100 - x, 760 - y) < min; // keep the landing spot clear
    }

    if (id === "moon") {
      for (var cN = 0; cN < 70; cN++) {
        var cx = R() * WORLD_W, cy = R() * WORLD_H, cr = R() < 0.85 ? 10 + R() * 40 : 60 + R() * 90;
        if (nearSite(cx, cy, cr + 70)) continue;
        drawCrater(g, cx, cy, cr, p);
      }
    } else {
      // dunes: sinuous ridges
      g.lineWidth = 3;
      for (var dN = 0; dN < 40; dN++) {
        var dx = R() * WORLD_W, dy = R() * WORLD_H;
        if (nearSite(dx, dy, 140)) continue;
        for (var l = 0; l < 4; l++) {
          g.strokeStyle = l % 2 ? p.rim : p.crater;
          g.globalAlpha = 0.55;
          g.beginPath();
          for (var t = 0; t <= 160; t += 8) {
            var px = dx + t, py = dy + l * 10 + Math.sin((t + l * 20) / 22) * 7;
            if (t === 0) g.moveTo(px, py); else g.lineTo(px, py);
          }
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      for (var cM = 0; cM < 14; cM++) {
        var mx = R() * WORLD_W, my = R() * WORLD_H, mr = 20 + R() * 60;
        if (nearSite(mx, my, mr + 80)) continue;
        drawCrater(g, mx, my, mr, p);
      }
    }

    // scattered rocks
    for (var q = 0; q < (id === "moon" ? 140 : 220); q++) {
      var rx = R() * WORLD_W, ry = R() * WORLD_H, rr = 2 + R() * 7;
      if (nearSite(rx, ry, 50)) continue;
      g.fillStyle = "rgba(0,0,0,.25)";
      g.beginPath(); g.ellipse(rx + 2, ry + 2, rr, rr * 0.7, 0, 0, 7); g.fill();
      g.fillStyle = p.rock;
      g.beginPath(); g.ellipse(rx, ry, rr, rr * 0.7, R(), 0, 7); g.fill();
    }

    // world edge
    g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 6; g.setLineDash([18, 14]);
    g.strokeRect(3, 3, WORLD_W - 6, WORLD_H - 6);
    g.setLineDash([]);
    return c;
  }

  function drawCrater(g, x, y, r, p) {
    g.fillStyle = p.rim;
    g.beginPath(); g.ellipse(x, y, r * 1.12, r * 1.02, 0, 0, 7); g.fill();
    var cg = g.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
    cg.addColorStop(0, p.ground2); cg.addColorStop(1, p.crater);
    g.fillStyle = cg;
    g.beginPath(); g.ellipse(x, y, r, r * 0.9, 0, 0, 7); g.fill();
  }

  // ---------- canvas sizing ----------
  function resize() {
    if (!canvas || $("play").hidden) return;
    var box = canvas.parentNode.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(box.width * dpr));
    canvas.height = Math.max(1, Math.round(box.height * dpr));
    canvas.style.width = box.width + "px";
    canvas.style.height = box.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  // ---------- input ----------
  var KEYMAP = {
    ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right"
  };
  function anyDialogOpen() { return !!document.querySelector("dialog[open]"); }
  function typing(e) { var t = e.target; return t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable); }

  function bindInput() {
    document.addEventListener("keydown", function (e) {
      if ($("play").hidden || anyDialogOpen() || typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      var dir = KEYMAP[e.code];
      if (dir) {
        // arrows drive only while the map or page body has focus, so they still scroll/tab elsewhere
        var onGame = document.activeElement === canvas || document.activeElement === document.body;
        if (!onGame && e.code.indexOf("Arrow") === 0) return;
        keys[dir] = true; e.preventDefault(); return;
      }
      if (e.code === "KeyE") { e.preventDefault(); collect(); }
      else if (e.code === "KeyL") { e.preventDefault(); openLab(); }
      else if (e.code === "KeyJ") { e.preventDefault(); openJournal(); }
      else if (e.code === "KeyR") { e.preventDefault(); recharge(); }
    });
    document.addEventListener("keyup", function (e) { var d = KEYMAP[e.code]; if (d) keys[d] = false; });
    window.addEventListener("blur", function () { keys = {}; pad = {}; });

    document.querySelectorAll(".pad-btn").forEach(function (b) {
      var dir = b.getAttribute("data-dir");
      function on(e) { e.preventDefault(); pad[dir] = true; b.classList.add("on"); if (b.setPointerCapture && e.pointerId != null) b.setPointerCapture(e.pointerId); }
      function off() { pad[dir] = false; b.classList.remove("on"); }
      b.addEventListener("pointerdown", on);
      b.addEventListener("pointerup", off);
      b.addEventListener("pointercancel", off);
      b.addEventListener("lostpointercapture", off);
      b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });

    // Tap/click on the map: drive toward that point (helps on touch screens)
    canvas.addEventListener("pointerdown", function (e) {
      var r = canvas.getBoundingClientRect();
      var cam = camera();
      S.target = { x: cam.x + (e.clientX - r.left), y: cam.y + (e.clientY - r.top) };
      canvas.focus({ preventScroll: true });
    });
  }

  // ---------- game loop ----------
  function loop(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    update(dt);
    draw(t);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (!S || anyDialogOpen()) return;
    var vx = 0, vy = 0;
    if (keys.up || pad.up) vy -= 1;
    if (keys.down || pad.down) vy += 1;
    if (keys.left || pad.left) vx -= 1;
    if (keys.right || pad.right) vx += 1;
    if (vx || vy) S.target = null;
    else if (S.target) {
      var tx = S.target.x - S.x, ty = S.target.y - S.y, td = Math.hypot(tx, ty);
      if (td < 6) S.target = null; else { vx = tx / td; vy = ty / td; }
    }
    var moving = vx || vy;
    if (moving) {
      if (S.energy <= 0) {
        S.target = null;
        if (performance.now() - warnAt > 2500) {
          warnAt = performance.now();
          toast("Battery empty. Press R (Recharge) to unfold the solar panels.", "warn");
        }
        moving = false;
      } else {
        var len = Math.hypot(vx, vy);
        vx /= len; vy /= len;
        var nx = Math.max(30, Math.min(WORLD_W - 30, S.x + vx * SPEED * dt));
        var ny = Math.max(30, Math.min(WORLD_H - 30, S.y + vy * SPEED * dt));
        var moved = Math.hypot(nx - S.x, ny - S.y);
        S.x = nx; S.y = ny;
        S.distance += moved;
        S.acc += moved;
        while (S.acc >= DATA.energy.driveUnitPx) {
          S.acc -= DATA.energy.driveUnitPx;
          S.energy = Math.max(0, S.energy - DATA.energy.drivePerUnit);
          if (S.energy === 20) toast("Energy at 20%. Recharging is free: press R any time.", "warn");
        }
        // turn smoothly toward the direction of travel
        var want = Math.atan2(vy, vx), diff = want - S.angle;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        S.angle += diff * Math.min(1, dt * 10);
        var last = S.trail[S.trail.length - 1];
        if (!last || Math.hypot(last[0] - S.x, last[1] - S.y) > 14) {
          S.trail.push([Math.round(S.x), Math.round(S.y), +S.angle.toFixed(2)]);
          if (S.trail.length > 500) S.trail.shift();
        }
        if (performance.now() - saveAt > 1500) { saveAt = performance.now(); save(); }
      }
    }
    S.moving = !!moving;
    updateHud();
  }

  function camera() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    return {
      x: Math.max(0, Math.min(WORLD_W - w, S.x - w / 2)),
      y: Math.max(0, Math.min(WORLD_H - h, S.y - h / 2)),
      w: w, h: h
    };
  }

  function draw(t) {
    if (!S || !terrain) return;
    var cam = camera();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cam.w, cam.h);
    ctx.drawImage(terrain, cam.x, cam.y, cam.w, cam.h, 0, 0, cam.w, cam.h);
    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    // wheel tracks
    ctx.fillStyle = "rgba(0,0,0,.18)";
    S.trail.forEach(function (p) {
      var a = p[2] + Math.PI / 2;
      ctx.fillRect(p[0] + Math.cos(a) * 11 - 2, p[1] + Math.sin(a) * 11 - 2, 4, 4);
      ctx.fillRect(p[0] - Math.cos(a) * 11 - 2, p[1] - Math.sin(a) * 11 - 2, 4, 4);
    });

    // sample sites
    var pulse = REDUCED ? 0.5 : (Math.sin(t / 300) + 1) / 2;
    M.sites.forEach(function (st, i) {
      var col = SWATCH[st.type];
      if (S.collected[i]) {
        // collected: a small marker flag
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x, st.y - 26); ctx.stroke();
        ctx.fillStyle = M.palette.accent;
        ctx.beginPath(); ctx.moveTo(st.x, st.y - 26); ctx.lineTo(st.x + 14, st.y - 21); ctx.lineTo(st.x, st.y - 16); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = "11px system-ui, sans-serif";
        ctx.fillText(S.collected[i], st.x + 4, st.y + 14);
        return;
      }
      ctx.strokeStyle = M.palette.accent;
      ctx.globalAlpha = 0.35 + pulse * 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(st.x, st.y, 30 + pulse * 10, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      // a little cluster of the sample material
      var R = rng(i + 7);
      for (var k = 0; k < 7; k++) {
        var a = R() * 7, d = R() * 16, r = 3 + R() * 5;
        ctx.fillStyle = "rgba(0,0,0,.3)";
        ctx.beginPath(); ctx.arc(st.x + Math.cos(a) * d + 1.5, st.y + Math.sin(a) * d + 1.5, r, 0, 7); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(st.x + Math.cos(a) * d, st.y + Math.sin(a) * d, r, 0, 7); ctx.fill();
      }
      if (Math.hypot(st.x - S.x, st.y - S.y) < 220) {
        ctx.fillStyle = "rgba(10,12,20,.75)";
        var label = DATA.samples[st.type].label;
        ctx.font = "12px system-ui, sans-serif";
        var w = ctx.measureText(label).width + 12;
        ctx.fillRect(st.x - w / 2, st.y - 62, w, 20);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, st.x - w / 2 + 6, st.y - 48);
      }
    });

    drawRover(t);

    // collection particles
    particles = particles.filter(function (p) { return t - p.born < 900; });
    particles.forEach(function (p) {
      var k = (t - p.born) / 900;
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x + p.vx * k * 60, p.y + p.vy * k * 60 - k * 20, 3 * (1 - k) + 1, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (S.target) {
      ctx.strokeStyle = M.palette.accent; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(S.target.x, S.target.y, 8, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function drawRover(t) {
    ctx.save();
    ctx.translate(S.x, S.y);
    ctx.rotate(S.angle);
    var bob = S.moving && !REDUCED ? Math.sin(t / 60) * 0.6 : 0;
    // shadow
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(-20 + 3, -16 + 3, 40, 32);
    // wheels
    ctx.fillStyle = "#1b1c20";
    [-14, 0, 14].forEach(function (x) { ctx.fillRect(x - 5, -18, 10, 6); ctx.fillRect(x - 5, 12, 10, 6); });
    // solar panels (glow while charging)
    var glow = chargeGlow > performance.now();
    ctx.fillStyle = glow ? "#4c7cf0" : "#273a6b";
    ctx.fillRect(-22, -13 + bob, 30, 26);
    ctx.strokeStyle = glow ? "#bcd0ff" : "#4a5f94"; ctx.lineWidth = 1;
    for (var i = -14; i < 8; i += 7) { ctx.beginPath(); ctx.moveTo(i, -13 + bob); ctx.lineTo(i, 13 + bob); ctx.stroke(); }
    // body
    ctx.fillStyle = "#e8e4d8";
    ctx.fillRect(4, -9 + bob, 14, 18);
    // mast + camera head
    ctx.fillStyle = "#cfc9b8";
    ctx.fillRect(12, -3 + bob, 10, 6);
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.arc(22, bob, 3, 0, 7); ctx.fill();
    ctx.restore();
    // reach ring when a site is near
    if (nearestSite(REACH)) {
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.arc(S.x, S.y, REACH, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  // ---------- sites, scanner, collection ----------
  function nearestSite(maxDist) {
    var best = null, bestD = Infinity;
    M.sites.forEach(function (st, i) {
      if (S.collected[i]) return;
      var d = Math.hypot(st.x - S.x, st.y - S.y);
      if (d < bestD) { bestD = d; best = { i: i, site: st, d: d }; }
    });
    if (best && maxDist != null && best.d > maxDist) return null;
    return best;
  }

  function compass(dx, dy) {
    var dirs = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
    var a = Math.atan2(dy, dx);
    var idx = Math.round(a / (Math.PI / 4));
    return dirs[(idx + 8) % 8];
  }

  var lastNearby = "";
  function updateHud() {
    var e = S.energy;
    var fill = $("energy-fill");
    fill.style.width = (e / DATA.energy.max * 100) + "%";
    fill.className = e <= 20 ? "low" : e <= 45 ? "mid" : "";
    $("energy-num").textContent = Math.round(e);
    $("hud-status").textContent = "Status: " + (S.energy <= 0 ? "battery empty, recharge" : S.moving ? "driving" : "ready");
    $("hud-count").textContent = S.samples.length + " / " + M.sites.length;

    var n = nearestSite();
    $("scanner").textContent = n
      ? "Scanner: nearest site " + Math.round(n.d / 10) + " m " + compass(n.site.x - S.x, n.site.y - S.y)
      : "Scanner: all sites sampled";

    var near = nearestSite(REACH);
    var text = near ? "Sample site: " + DATA.samples[near.site.type].label + ". Press E to collect." : "";
    $("btn-collect").disabled = !near;
    if (text !== lastNearby) { $("nearby").textContent = text; lastNearby = text; }
  }

  function spend(cost, what) {
    if (S.energy < cost) {
      toast("Not enough energy to " + what + " (needs " + cost + "). Press R to recharge.", "warn");
      return false;
    }
    S.energy -= cost;
    return true;
  }

  function collect() {
    if (!S || $("play").hidden) return;
    var near = nearestSite(REACH);
    if (!near) { toast("No sample site in reach. Follow the scanner to the nearest site."); return; }
    if (!spend(DATA.energy.collect, "collect a sample")) return;
    S.counter += 1;
    var code = M.codePrefix + "-" + pad3(S.counter);
    S.collected[near.i] = code;
    S.samples.push({ code: code, type: near.site.type, site: near.i, inst: {}, answers: {}, notes: "", at: new Date().toISOString() });
    var col = SWATCH[near.site.type];
    var now = performance.now();
    for (var k = 0; k < 26; k++) {
      var a = Math.random() * 7;
      particles.push({ x: near.site.x, y: near.site.y, vx: Math.cos(a), vy: Math.sin(a), c: k % 3 ? col : "#fff", born: now });
    }
    toast("Sample " + code + " collected: " + DATA.samples[near.site.type].name + ". Open the lab (L) to analyse it.", "good");
    save();
    refreshPanel();
    checkObjectives();
  }

  function recharge() {
    if (!S || $("play").hidden) return;
    if (S.energy >= DATA.energy.max) { toast("Battery already full."); return; }
    S.energy = Math.min(DATA.energy.max, S.energy + DATA.energy.recharge);
    S.recharges += 1;
    chargeGlow = performance.now() + 1400;
    toast("Solar panels charged the battery: +" + DATA.energy.recharge + " energy.", "good");
    save();
    updateHud();
  }

  // ---------- side panel ----------
  function renderInstrumentList() {
    var ul = $("inst-list");
    ul.innerHTML = "";
    DATA.instruments.forEach(function (ins) {
      var li = el("li");
      li.appendChild(el("span", "ico", ins.icon));
      li.appendChild(el("span", null, ins.name + ": " + ins.measures));
      ul.appendChild(li);
    });
  }

  function swatch(type) {
    var s = el("span", "inv-swatch");
    s.style.background = type === "breccia"
      ? "conic-gradient(#4a4b50 0 25%, #c9cacf 0 45%, #7d7f86 0 70%, #2f3034 0)"
      : type === "hematite_spherules" ? "radial-gradient(circle at 35% 35%, #9aa0ad, #4a4f5a)" : SWATCH[type];
    return s;
  }

  function sampleButton(s, onClick) {
    var b = el("button", "inv-item");
    b.type = "button";
    b.appendChild(swatch(s.type));
    var meta = el("span", "inv-meta");
    meta.appendChild(el("strong", null, s.code));
    meta.appendChild(el("small", null, DATA.samples[s.type].name + " · " + usedCount(s) + "/4 instruments"));
    b.appendChild(meta);
    b.addEventListener("click", onClick);
    return b;
  }

  function refreshPanel() {
    if (!S) return;
    var inv = $("inventory");
    inv.innerHTML = "";
    if (!S.samples.length) inv.appendChild(el("li", "empty", "No samples yet. Drive to a marked site."));
    S.samples.forEach(function (s) {
      var li = el("li");
      li.appendChild(sampleButton(s, function () { openLab(s.code); }));
      inv.appendChild(li);
    });
    renderObjectives();
    updateHud();
  }

  function progress() {
    var analysed = S.samples.filter(function (s) { return usedCount(s) >= 2; }).length;
    var reasoned = S.samples.filter(function (s) {
      var qs = DATA.samples[s.type].questions;
      return qs.every(function (q, i) { return s.answers[i] && s.answers[i].result !== "wrong"; });
    }).length;
    return [
      { text: "Collect at least 3 samples", n: S.samples.length, of: 3 },
      { text: "Analyse 3 samples with at least 2 instruments", n: analysed, of: 3 },
      { text: "Complete the reasoning challenges for 2 samples", n: reasoned, of: 2 },
      { text: "Bonus: find all " + M.sites.length + " sample sites", n: S.samples.length, of: M.sites.length, bonus: true }
    ];
  }

  function renderObjectives() {
    var ul = $("objectives");
    ul.innerHTML = "";
    progress().forEach(function (o) {
      var li = el("li", o.n >= o.of ? "done" : "", o.text + " ");
      li.appendChild(el("span", "prog", "(" + Math.min(o.n, o.of) + "/" + o.of + ")"));
      ul.appendChild(li);
    });
  }

  function checkObjectives() {
    var p = progress();
    if (!S.complete && p[0].n >= 3 && p[1].n >= 3 && p[2].n >= 2) {
      S.complete = true;
      save();
      toast("Mission objectives complete! Your journal now holds a full science record.", "good");
    }
    renderObjectives();
  }

  // ---------- lab ----------
  function openLab(code) {
    if (!S || $("play").hidden) return;
    keys = {}; pad = {};
    var prev = lab.code;
    if (code) lab.code = code;
    if (!lab.code || !sampleByCode(lab.code)) lab.code = S.samples.length ? S.samples[S.samples.length - 1].code : null;
    if (code || lab.code !== prev) lab.tab = "instruments";
    var d = $("journal"); if (d.open) d.close();
    renderLab();
    var dlg = $("lab");
    if (!dlg.open) dlg.showModal();
  }

  function renderLab() {
    var list = $("lab-samples"), main = $("lab-main");
    list.innerHTML = ""; main.innerHTML = "";
    if (!S.samples.length) {
      main.appendChild(el("p", "lab-empty", "The lab is empty. Drive to a pulsing sample site and press E to collect your first sample."));
      return;
    }
    S.samples.forEach(function (s) {
      var b = sampleButton(s, function () { lab.code = s.code; renderLab(); });
      if (s.code === lab.code) b.setAttribute("aria-current", "true");
      list.appendChild(b);
    });

    var s = sampleByCode(lab.code), info = DATA.samples[s.type];
    var head = el("div", "sample-head");
    var art = swatch(s.type); art.className = "sample-art";
    head.appendChild(art);
    var ht = el("div");
    ht.appendChild(el("h3", null, s.code + ": " + info.name));
    ht.appendChild(el("p", null, M.short + " · " + info.type + " · collected at \"" + info.label + "\""));
    head.appendChild(ht);
    main.appendChild(head);

    var tabs = el("div", "tabs");
    tabs.setAttribute("role", "tablist");
    [["instruments", "Instruments"], ["report", "Sample report"], ["reasoning", "Reasoning challenge"]].forEach(function (t) {
      var b = el("button", "tab", t[1]);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", lab.tab === t[0] ? "true" : "false");
      b.addEventListener("click", function () { lab.tab = t[0]; renderLab(); var f = document.querySelector(".tab[aria-selected=true]"); if (f) f.focus(); });
      tabs.appendChild(b);
    });
    main.appendChild(tabs);

    var panel = el("div");
    panel.setAttribute("role", "tabpanel");
    main.appendChild(panel);
    if (lab.tab === "instruments") renderInstruments(panel, s, info);
    else if (lab.tab === "report") renderReport(panel, s, info);
    else renderReasoning(panel, s, info);
  }

  function readingsList(obj) {
    var dl = el("dl", "readings");
    Object.keys(obj).forEach(function (k) {
      dl.appendChild(el("dt", null, k));
      dl.appendChild(el("dd", null, obj[k]));
    });
    return dl;
  }

  function renderInstruments(panel, s, info) {
    var intro = el("p", "note");
    intro.appendChild(document.createTextNode("Each instrument costs energy and reveals a different kind of evidence. Readings are "));
    intro.appendChild(simTag());
    intro.appendChild(document.createTextNode(" values that match published descriptions of this kind of sample."));
    panel.appendChild(intro);

    var grid = el("div", "inst-grid");
    DATA.instruments.forEach(function (ins) {
      var used = !!s.inst[ins.id];
      var card = el("div", "inst-card" + (used ? " used" : ""));
      var h = el("h4"); h.appendChild(el("span", "ico", ins.icon)); h.appendChild(document.createTextNode(ins.name));
      card.appendChild(h);
      var p1 = el("p"); p1.appendChild(el("strong", null, "Measures: ")); p1.appendChild(document.createTextNode(ins.measures)); card.appendChild(p1);
      var p2 = el("p"); p2.appendChild(el("strong", null, "Why scientists use it: ")); p2.appendChild(document.createTextNode(ins.why)); card.appendChild(p2);
      card.appendChild(el("p", "real", ins.real));
      if (used) {
        var r = el("p"); r.appendChild(el("strong", null, "Readings ")); r.appendChild(simTag()); card.appendChild(r);
        card.appendChild(readingsList(info.readings[ins.id]));
      } else {
        var b = el("button", "btn small", "Run " + ins.name.toLowerCase() + " (−" + ins.cost + " energy)");
        b.type = "button";
        b.addEventListener("click", function () { runInstrument(s, ins, card, b); });
        card.appendChild(b);
      }
      grid.appendChild(card);
    });
    panel.appendChild(grid);

    var foot = el("p", "note");
    foot.textContent = usedCount(s) >= 2
      ? "You have two or more lines of evidence. Read the sample report, then try the reasoning challenge."
      : "Tip: run at least two instruments. One line of evidence is rarely enough for a conclusion.";
    panel.appendChild(foot);
  }

  function runInstrument(s, ins, card, btn) {
    if (!spend(ins.cost, "run the " + ins.name.toLowerCase())) return;
    btn.disabled = true;
    btn.textContent = "Measuring…";
    var bar = el("div", "scan"); bar.appendChild(el("span")); card.appendChild(bar);
    setTimeout(function () {
      s.inst[ins.id] = true;
      save();
      toast(ins.name + " readings added to " + s.code + "'s report.", "good");
      checkObjectives();
      if ($("lab").open && lab.code === s.code) renderLab();
      refreshPanel();
    }, REDUCED ? 0 : 900);
  }

  function pending(text) { return el("span", "pending", text); }

  function reportRows(s, info) {
    var R = info.readings, rows = [];
    function val(inst, key, hint) {
      return s.inst[inst] && R[inst][key] ? R[inst][key] : { pending: "Not measured yet: use the " + hint + "." };
    }
    var spec = s.inst.spectrometer
      ? Object.keys(R.spectrometer).map(function (k) { return k + ": " + R.spectrometer[k]; })
      : { pending: "Not measured yet: use the spectrometer." };
    rows.push(["Sample ID", s.code]);
    rows.push(["Planet", info.planet]);
    rows.push(["Sample type", info.type + " (" + info.name.toLowerCase() + ")"]);
    rows.push(["Collected at", info.label]);
    rows.push(["Colour", val("camera", "Colour", "camera")]);
    rows.push(["Texture", val("camera", "Texture", "camera")]);
    rows.push(["Grain size", val("microscope", "Grain size", "microscope")]);
    rows.push(["Microscopic structure", val("microscope", "Structure", "microscope")]);
    rows.push(["Mineral / elemental indications (SIMULATED)", spec]);
    rows.push(["Magnetic response (SIMULATED)", val("magnetic", "Magnetic response", "magnetic sensor")]);
    rows.push(["Instruments used", usedCount(s) ? Object.keys(s.inst).map(function (k) { return instById(k).name; }).join(", ") : { pending: "None yet." }]);
    rows.push(["Interpretation (from NASA sources)", usedCount(s) >= 2 ? info.interpretation : { pending: "Run at least 2 instruments to unlock the interpretation. Good science uses more than one line of evidence." }]);
    rows.push(["Uncertainties", info.uncertainty]);
    return rows;
  }

  function renderReport(panel, s, info) {
    var box = el("div", "report");
    var table = el("table");
    var cap = el("caption", null, "Sample report " + s.code);
    cap.style.cssText = "text-align:left;padding:10px 12px;font-weight:700";
    table.appendChild(cap);
    reportRows(s, info).forEach(function (r) {
      var tr = el("tr");
      tr.appendChild(el("th", null, r[0]));
      var td = el("td");
      if (Array.isArray(r[1])) { var ul = el("ul"); r[1].forEach(function (x) { ul.appendChild(el("li", null, x)); }); td.appendChild(ul); }
      else if (r[1] && r[1].pending) td.appendChild(pending(r[1].pending));
      else td.textContent = r[1];
      tr.appendChild(td);
      table.appendChild(tr);
    });
    // Observations: the explorer's own words
    var tr2 = el("tr");
    tr2.appendChild(el("th", null, "Your observations"));
    var td2 = el("td");
    var ta = el("textarea", "notes-input");
    ta.setAttribute("aria-label", "Your observations for " + s.code);
    ta.placeholder = "What do you notice? Write what you see before deciding what it means.";
    ta.value = s.notes || "";
    ta.addEventListener("input", function () { s.notes = ta.value; save(); });
    td2.appendChild(ta);
    tr2.appendChild(td2);
    table.appendChild(tr2);
    // sources
    var tr3 = el("tr");
    tr3.appendChild(el("th", null, "Sources"));
    var td3 = el("td");
    var ul3 = el("ul");
    info.sources.forEach(function (k) {
      var src = DATA.sources[k]; if (!src) return;
      var li = el("li"); var a = el("a", null, src.name); a.href = src.url; a.target = "_blank"; a.rel = "noopener";
      li.appendChild(a); ul3.appendChild(li);
    });
    td3.appendChild(ul3);
    tr3.appendChild(td3);
    table.appendChild(tr3);
    box.appendChild(table);
    panel.appendChild(box);

    var note = el("p", "note"); note.textContent = DATA.simulatedNote; panel.appendChild(note);
    var acts = el("div", "report-actions");
    var pr = el("button", "btn small", "Print report"); pr.type = "button";
    pr.addEventListener("click", function () { printDoc("Sample report " + s.code, reportHtml(s, info)); });
    var go = el("button", "btn small", "Go to reasoning challenge →"); go.type = "button";
    go.addEventListener("click", function () { lab.tab = "reasoning"; renderLab(); });
    acts.appendChild(pr); acts.appendChild(go);
    panel.appendChild(acts);
  }

  function renderReasoning(panel, s, info) {
    var intro = el("p", "note");
    intro.textContent = "Choose the conclusion the evidence supports best. \"Insufficient evidence\" is a real option: careful scientists say so when the data cannot decide.";
    panel.appendChild(intro);
    info.questions.forEach(function (q, qi) {
      var card = el("div", "q-card");
      card.appendChild(el("h4", null, (qi + 1) + ". " + q.q));
      if (q.needs && !s.inst[q.needs]) {
        card.appendChild(el("p", "q-locked", "Gather evidence first: run the " + instById(q.needs).name.toLowerCase() + " on this sample."));
        var b = el("button", "btn small", "Go to instruments"); b.type = "button"; b.style.marginTop = "8px";
        b.addEventListener("click", function () { lab.tab = "instruments"; renderLab(); });
        card.appendChild(b);
        panel.appendChild(card);
        return;
      }
      var ans = s.answers[qi];
      var opts = el("div", "q-opts");
      q.options.forEach(function (o) {
        var b = el("button", "q-opt" + (o === "Insufficient evidence" ? " insufficient" : ""), o);
        b.type = "button";
        if (ans) {
          b.disabled = true;
          if (o === ans.choice) b.classList.add(ans.result === "best" ? "best" : ans.result === "ok" ? "ok" : "wrong");
          else if (o === q.best && ans.result !== "wrong") b.classList.add("best");
        } else {
          b.addEventListener("click", function () { answer(s, q, qi, o); });
        }
        opts.appendChild(b);
      });
      card.appendChild(opts);
      if (ans) {
        var fb = el("p", "q-feedback");
        var head;
        if (ans.result === "best") head = el("strong", "good", "Well reasoned. ");
        else if (ans.result === "ok") head = el("strong", "ok", "Careful reasoning: this evidence alone can't settle it. ");
        else if (ans.choice === "Insufficient evidence") head = el("strong", "bad", "Here the evidence is actually enough to decide. ");
        else head = el("strong", "bad", "The evidence doesn't support that. ");
        fb.appendChild(head);
        fb.appendChild(document.createTextNode(q.explain));
        card.appendChild(fb);
        if (ans.result === "wrong") {
          var retry = el("button", "btn small", "Think again"); retry.type = "button"; retry.style.marginTop = "8px";
          retry.addEventListener("click", function () { delete s.answers[qi]; s.retried = s.retried || {}; s.retried[qi] = true; save(); renderLab(); });
          card.appendChild(retry);
        }
      }
      panel.appendChild(card);
    });
    var pts = el("p", "note"); pts.textContent = "Reasoning points this mission: " + S.points + ". Careful answers on the first try earn 2 points, after rethinking 1.";
    panel.appendChild(pts);
  }

  function answer(s, q, qi, choice) {
    var result = choice === q.best ? "best" : choice === q.alsoGood ? "ok" : "wrong";
    s.answers[qi] = { choice: choice, result: result };
    if (result !== "wrong") S.points += s.retried && s.retried[qi] ? 1 : 2;
    save();
    checkObjectives();
    renderLab();
    refreshPanel();
  }

  // ---------- journal ----------
  function openJournal() {
    if (!S || $("play").hidden) return;
    keys = {}; pad = {};
    var l = $("lab"); if (l.open) l.close();
    renderJournal();
    var d = $("journal");
    if (!d.open) d.showModal();
  }

  function instrumentRuns() {
    var counts = {};
    S.samples.forEach(function (s) { Object.keys(s.inst).forEach(function (k) { counts[k] = (counts[k] || 0) + 1; }); });
    return counts;
  }

  function renderJournal() {
    var b = $("journal-body");
    b.innerHTML = "";
    var counts = instrumentRuns();
    var runs = Object.keys(counts).reduce(function (a, k) { return a + counts[k]; }, 0);
    var stats = el("div", "j-stats");
    [[S.samples.length + " / " + M.sites.length, "samples collected"], [runs, "instrument runs"], [S.points, "reasoning points"],
     [Math.round(S.distance / 10) + " m", "driven (game scale)"], [S.recharges, "solar recharges"]].forEach(function (x) {
      var d = el("div", "j-stat"); d.appendChild(el("b", null, String(x[0]))); d.appendChild(el("span", null, x[1])); stats.appendChild(d);
    });
    b.appendChild(stats);
    if (S.complete) b.appendChild(el("p", null, "✓ Mission objectives complete."));

    b.appendChild(el("h3", "j-h", "Samples and conclusions"));
    if (!S.samples.length) b.appendChild(el("p", "note", "No samples yet."));
    S.samples.forEach(function (s) {
      var info = DATA.samples[s.type];
      var e = el("div", "j-entry");
      e.appendChild(el("h4", null, s.code + ": " + info.name));
      e.appendChild(el("p", null, "Instruments used: " + (usedCount(s) ? Object.keys(s.inst).map(function (k) { return instById(k).name; }).join(", ") : "none yet")));
      if (s.notes) e.appendChild(el("p", null, "Your observations: " + s.notes));
      var concl = info.questions.map(function (q, i) { return s.answers[i] ? { q: q, a: s.answers[i] } : null; }).filter(Boolean);
      if (concl.length) {
        var ul = el("ul");
        concl.forEach(function (c) {
          ul.appendChild(el("li", null, c.q.q + " → " + c.a.choice + (c.a.result === "wrong" ? " (rethink this)" : "")));
        });
        e.appendChild(el("p", null, "Conclusions:")); e.appendChild(ul);
      }
      var open = el("button", "btn small", "Open report"); open.type = "button";
      open.addEventListener("click", function () { openLab(s.code); lab.tab = "report"; renderLab(); });
      e.appendChild(open);
      b.appendChild(e);
    });

    b.appendChild(el("h3", "j-h", "Instruments"));
    var iu = el("ul");
    DATA.instruments.forEach(function (ins) {
      iu.appendChild(el("li", null, ins.name + ": used " + (counts[ins.id] || 0) + " time(s). " + ins.real));
    });
    b.appendChild(iu);

    b.appendChild(el("h3", "j-h", "Unanswered questions"));
    var uq = el("ul");
    (DATA.unanswered[M.id] || []).forEach(function (q) { uq.appendChild(el("li", null, q)); });
    S.samples.forEach(function (s) {
      DATA.samples[s.type].questions.forEach(function (q, i) {
        var a = s.answers[i];
        if (!a || a.result === "wrong") uq.appendChild(el("li", null, s.code + ": " + q.q));
      });
    });
    b.appendChild(uq);

    b.appendChild(el("h3", "j-h", "Mission notes"));
    var ta = el("textarea", "notes-input");
    ta.setAttribute("aria-label", "Mission notes");
    ta.placeholder = "Ideas, patterns, what you would investigate next…";
    ta.value = S.notes || "";
    ta.addEventListener("input", function () { S.notes = ta.value; save(); });
    b.appendChild(ta);

    var acts = el("div", "report-actions");
    var pr = el("button", "btn small", "Print journal"); pr.type = "button";
    pr.addEventListener("click", function () { printDoc(M.name + " journal", journalHtml()); });
    var rs = el("button", "btn small", "Restart this mission"); rs.type = "button";
    rs.addEventListener("click", function () {
      if (!confirm("Restart the " + M.short + " mission? Your samples and notes for this mission will be cleared.")) return;
      S = freshState(M.id); save(); $("journal").close(); refreshPanel(); toast("Mission restarted. " + M.intro);
    });
    acts.appendChild(pr); acts.appendChild(rs);
    b.appendChild(acts);
    b.appendChild(el("p", "note", DATA.simulatedNote));
  }

  // ---------- printing ----------
  function reportHtml(s, info) {
    var rows = reportRows(s, info).map(function (r) {
      var v = Array.isArray(r[1]) ? "<ul>" + r[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
        : r[1] && r[1].pending ? "<em>" + esc(r[1].pending) + "</em>" : esc(r[1]);
      return "<tr><th>" + esc(r[0]) + "</th><td>" + v + "</td></tr>";
    }).join("");
    rows += "<tr><th>Your observations</th><td>" + (s.notes ? esc(s.notes) : "<em>(none written)</em>") + "</td></tr>";
    rows += "<tr><th>Sources</th><td><ul>" + info.sources.map(function (k) {
      var x = DATA.sources[k]; return x ? "<li>" + esc(x.name) + "<br><small>" + esc(x.url) + "</small></li>" : "";
    }).join("") + "</ul></td></tr>";
    return "<h1>Sample report " + esc(s.code) + "</h1><p>" + esc(M.name) + " · ROVER RESCUE</p><table>" + rows + "</table>";
  }

  function journalHtml() {
    var h = "<h1>" + esc(M.name) + ": mission journal</h1><p>ROVER RESCUE · " + S.samples.length + " samples · " + S.points + " reasoning points</p>";
    S.samples.forEach(function (s) { h += reportHtml(s, DATA.samples[s.type]).replace("<h1>", "<h2>").replace("</h1>", "</h2>"); });
    h += "<h2>Unanswered questions</h2><ul>" + (DATA.unanswered[M.id] || []).map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ul>";
    if (S.notes) h += "<h2>Mission notes</h2><p>" + esc(S.notes) + "</p>";
    return h;
  }

  function printDoc(title, body) {
    var html = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>" + esc(title) + "</title><style>" +
      "body{font:14px/1.5 system-ui,sans-serif;max-width:800px;margin:24px auto;padding:0 16px;color:#111}" +
      "table{border-collapse:collapse;width:100%;margin:8px 0 24px}th,td{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}" +
      "th{width:32%;background:#f2f2f2}.sim{border:1px solid #6a3fc0;color:#6a3fc0;padding:6px 10px;border-radius:6px}ul{margin:0;padding-left:18px}" +
      "</style></head><body>" + body + "<p class='sim'>" + esc(DATA.simulatedNote) + "</p><p><small>" + esc(DATA.disclaimer) + "</small></p>" +
      "<script>window.onload=function(){window.print()}<\/script></body></html>";
    var url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    var w = window.open(url, "_blank");
    if (!w) toast("Your browser blocked the print window. Allow pop-ups for this page to print.", "warn");
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  // debugging hook (read-only snapshot + manual step for testing in hidden tabs)
  window.RoverRescue = {
    state: function () { return S; },
    step: function (dt) { update(dt || 0.1); draw(performance.now()); }
  };

  document.addEventListener("DOMContentLoaded", boot);
})();
