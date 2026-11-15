// Lunar Echoes - cinematic layer (css/cinematic.css)
// 1. Draws a static star field once (redrawn on resize). Twinkle and nebula drift are CSS.
// 2. Glass navigation: mobile menu toggle, Investigations/Experiences disclosure menus, Moon/Mars shortcuts.
// 3. Gentle reveal of sections on scroll, only when the visitor allows motion.
// Purely presentational: if this file fails, the CSS gradient sky and every feature still work.

(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Star field ----------
  function drawStars() {
    var c = document.getElementById("starfield");
    if (!c || !c.getContext) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    var g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    // Seeded so the sky does not reshuffle on every resize
    var seed = 20261115;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    var count = Math.round(w * h / 2600);
    for (var i = 0; i < count; i++) {
      var x = rnd() * w, y = rnd() * h, r = rnd();
      var size = r < 0.82 ? 0.45 + rnd() * 0.5 : r < 0.97 ? 0.9 + rnd() * 0.6 : 1.4 + rnd() * 0.8;
      var a = r < 0.82 ? 0.25 + rnd() * 0.45 : 0.6 + rnd() * 0.4;
      var tint = rnd();
      g.fillStyle = tint < 0.15 ? "rgba(255,226,200," + a + ")" : tint < 0.35 ? "rgba(200,215,255," + a + ")" : "rgba(255,255,255," + a + ")";
      g.beginPath();
      g.arc(x, y, size, 0, 6.2832);
      g.fill();
      if (size > 1.5) { // a soft halo on the brightest stars
        var grad = g.createRadialGradient(x, y, 0, x, y, size * 5);
        grad.addColorStop(0, "rgba(190,205,255,0.18)");
        grad.addColorStop(1, "rgba(190,205,255,0)");
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, size * 5, 0, 6.2832);
        g.fill();
      }
    }
    // A faint band of distant galaxies/dust across the sky
    var band = g.createLinearGradient(0, h * 0.15, w, h * 0.85);
    band.addColorStop(0, "rgba(120,130,255,0)");
    band.addColorStop(0.5, "rgba(150,140,255,0.035)");
    band.addColorStop(1, "rgba(120,130,255,0)");
    g.fillStyle = band;
    g.fillRect(0, 0, w, h);
  }
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawStars, 200);
  });

  // ---------- 2. Navigation ----------
  function closeMenus(except) {
    document.querySelectorAll(".nav-menu-btn").forEach(function (b) {
      if (b === except) return;
      b.setAttribute("aria-expanded", "false");
      var m = document.getElementById(b.getAttribute("aria-controls"));
      if (m) m.hidden = true;
    });
  }
  function closeMobile() {
    var t = document.querySelector(".nav-toggle"), nav = document.getElementById("site-nav");
    if (!t || !nav) return;
    t.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }

  function wireNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", open ? "false" : "true");
        nav.classList.toggle("is-open", !open);
        if (open) closeMenus();
      });
    }
    document.querySelectorAll(".nav-menu-btn").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var menu = document.getElementById(b.getAttribute("aria-controls"));
        var open = b.getAttribute("aria-expanded") === "true";
        closeMenus(b);
        b.setAttribute("aria-expanded", open ? "false" : "true");
        if (menu) {
          menu.hidden = open;
          if (!open) {
            var first = menu.querySelector("a");
            if (first && e.detail === 0) first.focus(); // keyboard activation moves into the menu
          }
        }
      });
    });
    // Close on outside click, Escape, or after following a link
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".nav-group")) closeMenus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var openBtn = document.querySelector(".nav-menu-btn[aria-expanded='true']");
      closeMenus();
      if (openBtn) openBtn.focus();
    });
    if (nav) {
      nav.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a");
        if (!a) return;
        // Moon / Mars shortcuts: open the archive filtered to that world
        var world = a.getAttribute("data-world");
        if (world) {
          var btn = document.querySelector('.filter-btn[data-planet="' + world + '"]');
          if (btn) btn.click();
        }
        closeMenus();
        closeMobile();
      });
    }
    // Header gains depth once the page scrolls
    var header = document.querySelector(".site-header");
    function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- 3. Reveal on scroll ----------
  function wireReveal() {
    if (reduce || !("IntersectionObserver" in window)) return;
    // Only hide things below the fold, so nothing flashes and deep links land on visible content
    var targets = Array.prototype.slice.call(document.querySelectorAll("main > section, main > .chapter"));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
    document.documentElement.classList.add("cine-motion");
    targets.forEach(function (t) {
      var r = t.getBoundingClientRect();
      t.classList.add("reveal");
      if (r.top < window.innerHeight) t.classList.add("is-in");
      else io.observe(t);
    });
    // A deep link or in-page jump should never land on hidden content
    window.addEventListener("hashchange", function () {
      var id = location.hash.slice(1);
      var el = id && document.getElementById(id);
      var sec = el && el.closest && el.closest("main > section");
      if (sec) sec.classList.add("is-in");
    });
    document.addEventListener("focusin", function (e) {
      var sec = e.target.closest && e.target.closest(".reveal");
      if (sec) sec.classList.add("is-in");
    });
  }

  function start() {
    drawStars();
    wireNav();
    wireReveal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
