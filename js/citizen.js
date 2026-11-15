// Lunar Echoes - BEYOND THE ARCHIVE
// Two investigations (Moon: MoonDiff, Mars: Cloudspotting on Mars: Shapes), an Observation Lab,
// a Moon/Mars comparison and a session-only Discovery Journal.
//
// Content: data/citizen-science.json. Helpers (makeEl, makeLink, makeTag, addImageUrl, localImagePath,
// findObject, openStoryById, isMissing, isWebLink) come from js/objects.js.
// Nothing here is ever sent anywhere. Real participation happens only on the official project sites.

var BEYOND_KEY = "lunar-echoes-beyond-v1";
var beyondData = null;
var beyond = { world: "moon", stage: { moon: 0, mars: 0 }, done: {} };

// ---------- Session storage (this browser tab only; safe if storage is blocked) ----------
function beyondLoad() {
  try {
    var saved = JSON.parse(sessionStorage.getItem(BEYOND_KEY) || "null");
    if (saved && saved.stage && saved.done) beyond = saved;
  } catch (e) { /* storage unavailable: progress simply is not remembered */ }
}
function beyondSave() {
  try { sessionStorage.setItem(BEYOND_KEY, JSON.stringify(beyond)); } catch (e) { /* ignore */ }
}
function markDone(id) {
  if (beyond.done[id]) return;
  beyond.done[id] = true;
  beyondSave();
  renderJournal();
  updateWorldTabs();
}

// ---------- Entry point (called from main.js) ----------
function renderCitizenScience(data) {
  var box = document.getElementById("beyond-box");
  if (!box) return;
  box.innerHTML = "";
  if (!data || !data.worlds || !data.worlds.moon || !data.worlds.mars) {
    box.appendChild(makeEl("p", "no-results", "Beyond the Archive is not available right now. The rest of the museum still works."));
    return;
  }
  beyondData = data;
  beyondLoad();

  // Page order follows the discovery journey; the extra sections are filled by js/beyond-extras.js.
  function slot(id, cls) {
    var s = makeEl("section", cls || "beyond-block");
    s.id = id;
    box.appendChild(s);
    return s;
  }
  box.appendChild(buildHero(data));
  slot("beyond-ppf");
  box.appendChild(buildSubnav());
  box.appendChild(buildWorldTabs(data));
  ["moon", "mars"].forEach(function (w) { box.appendChild(buildWorldPanel(w, data.worlds[w])); });
  box.appendChild(buildComparison(data));
  slot("beyond-impact");
  slot("beyond-wall");
  slot("beyond-ask");
  slot("beyond-profile");
  var journal = slot("beyond-journal", "beyond-journal");
  journal.setAttribute("aria-labelledby", "journal-title");
  slot("beyond-charter");

  var note = makeEl("p", "beyond-disclaimer");
  note.appendChild(makeEl("strong", "", "Independent project. "));
  note.appendChild(document.createTextNode(data.disclaimer));
  box.appendChild(note);

  selectWorld(beyond.world, false, true);
  renderJournal();

  // Deep links: #beyond-moon, #beyond-mars, #beyond-journal
  function fromHash() {
    var h = location.hash;
    if (h === "#beyond-moon" || h === "#beyond-mars") selectWorld(h.slice(8), true);
    else if (/^#beyond-(journal|wall|ask|charter|compare|impact|profile|ppf)$/.test(h)) {
      var el = document.querySelector(h);
      if (el) scrollToElement(el);
    }
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
}

// ---------- Shared intro ----------
// Planetary Mission Control: the opening of the experience
function buildHero(data) {
  var h = data.hero;
  var hero = makeEl("div", "beyond-hero mission-control");
  hero.appendChild(makeEl("p", "beyond-tagline-top", h.eyebrow || h.tagline));
  hero.appendChild(makeEl("h3", "beyond-hero-title", h.title));
  if (h.subtitle) hero.appendChild(makeEl("p", "mc-subtitle", h.subtitle));
  hero.appendChild(makeEl("p", "beyond-hero-text", h.narrative));

  if (h.objective) {
    var brief = makeEl("div", "mc-briefing");
    brief.appendChild(makeEl("p", "mc-briefing-label", "Mission briefing · Objective"));
    brief.appendChild(makeEl("p", "mc-objective", h.objective));
    hero.appendChild(brief);
  }

  var actions = makeEl("div", "mc-actions");
  var go = makeEl("button", "btn btn-primary beyond-begin", h.button);
  go.type = "button";
  go.addEventListener("click", function () { selectWorld(beyond.world, true); });
  actions.appendChild(go);
  ["moon", "mars"].forEach(function (w) {
    var b = makeEl("button", "btn btn-ghost mc-path is-" + w,
      w === "moon" ? "Lunar investigation →" : "Martian atmosphere investigation →");
    b.type = "button";
    b.addEventListener("click", function () { selectWorld(w, true); });
    actions.appendChild(b);
  });
  hero.appendChild(actions);
  hero.appendChild(makeEl("p", "mc-tagline", h.tagline));

  var pr = makeEl("ul", "beyond-principles");
  pr.setAttribute("aria-label", "How scientists think: four steps");
  data.principles.forEach(function (p) {
    var li = makeEl("li");
    li.appendChild(makeEl("strong", "", p.title));
    li.appendChild(makeEl("span", "", p.text));
    pr.appendChild(li);
  });
  hero.appendChild(pr);
  return hero;
}

function buildSubnav() {
  var nav = makeEl("nav", "beyond-subnav");
  nav.setAttribute("aria-label", "Beyond the Archive");
  [["Moon investigation", "#beyond-moon"], ["Mars investigation", "#beyond-mars"],
   ["Two worlds", "#beyond-compare"], ["Open questions", "#beyond-wall"], ["Ask a scientist", "#beyond-ask"],
   ["My discovery journal", "#beyond-journal"], ["Explorer charter", "#beyond-charter"]].forEach(function (l) {
    var a = makeEl("a", "", l[0]);
    a.href = l[1];
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (l[1] === "#beyond-moon" || l[1] === "#beyond-mars") selectWorld(l[1].slice(8), true);
      else scrollToElement(document.querySelector(l[1]));
      if (history.replaceState) history.replaceState(null, "", l[1]);
    });
    nav.appendChild(a);
  });
  return nav;
}

// ---------- Two-world selector (tabs) ----------
function buildWorldTabs(data) {
  var wrap = makeEl("div", "world-tabs");
  wrap.id = "beyond-worlds";
  wrap.setAttribute("role", "tablist");
  wrap.setAttribute("aria-label", "Choose a world to investigate");
  ["moon", "mars"].forEach(function (w) {
    var d = data.worlds[w];
    var tab = makeEl("button", "world-tab is-" + w);
    tab.type = "button";
    tab.id = "tab-" + w;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "beyond-" + w);
    var img = localImagePath(d.image) || d.image; // local copy (offline) first
    if (img) tab.style.backgroundImage = "linear-gradient(to top, rgba(7,8,13,0.92) 20%, rgba(7,8,13,0.45)), url(\"" + img + "\")";
    tab.appendChild(makeEl("span", "world-tab-name", d.name.toUpperCase()));
    tab.appendChild(makeEl("span", "world-tab-line", d.selectLine));
    tab.appendChild(makeEl("span", "world-tab-project", d.project));
    tab.appendChild(makeEl("span", "world-tab-progress"));
    tab.addEventListener("click", function () { selectWorld(w, false); });
    tab.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var other = w === "moon" ? "mars" : "moon";
        selectWorld(other, false);
        document.getElementById("tab-" + other).focus();
      }
    });
    wrap.appendChild(tab);
  });
  return wrap;
}

function updateWorldTabs() {
  ["moon", "mars"].forEach(function (w) {
    var tab = document.getElementById("tab-" + w);
    if (!tab) return;
    var done = beyondData.journal.milestones.filter(function (m) { return m.world === w && beyond.done[m.id]; }).length;
    var total = beyondData.journal.milestones.filter(function (m) { return m.world === w; }).length;
    tab.querySelector(".world-tab-progress").textContent =
      "Stage " + (beyond.stage[w] + 1) + " of 5 · " + done + "/" + total + " milestones";
  });
}

// `quiet` = true only for the initial render: show the panel without recording a journal milestone.
function selectWorld(w, scroll, quiet) {
  if (w !== "moon" && w !== "mars") return;
  beyond.world = w;
  beyondSave();
  ["moon", "mars"].forEach(function (x) {
    var tab = document.getElementById("tab-" + x);
    var panel = document.getElementById("beyond-" + x);
    if (!tab || !panel) return;
    var on = x === w;
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
    panel.hidden = !on; // hidden, not removed: progress inside each panel is kept
  });
  showStage(w, beyond.stage[w], false, quiet);
  updateWorldTabs();
  if (scroll) scrollToElement(document.getElementById("beyond-worlds"));
}

// ---------- One world: header, stepper, five stages ----------
function buildWorldPanel(w, d) {
  var panel = makeEl("div", "world-panel is-" + w);
  panel.id = "beyond-" + w;
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-" + w);

  var head = makeEl("header", "world-head");
  head.appendChild(makeEl("p", "eyebrow", d.project));
  head.appendChild(makeEl("h3", "world-title", d.investigation));
  head.appendChild(makeEl("p", "world-opening", d.opening));
  panel.appendChild(head);

  var stepper = makeEl("ol", "stage-stepper");
  stepper.setAttribute("aria-label", d.investigation + " stages");
  d.stages.forEach(function (name, i) {
    var li = makeEl("li");
    var b = makeEl("button", "stage-step");
    b.type = "button";
    b.dataset.stage = i;
    b.appendChild(makeEl("span", "stage-no", String(i + 1)));
    b.appendChild(makeEl("span", "stage-name", name));
    b.addEventListener("click", function () { showStage(w, i, true); });
    li.appendChild(b);
    stepper.appendChild(li);
  });
  panel.appendChild(stepper);

  var builders = w === "moon"
    ? [moonEnter, moonCompare, moonInvestigate, connectStage, continueStage]
    : [marsEnter, marsShapes, marsObserve, connectStage, continueStage];
  builders.forEach(function (build, i) {
    var s = makeEl("section", "stage");
    s.dataset.stage = i;
    s.setAttribute("aria-label", "Stage " + (i + 1) + ": " + d.stages[i]);
    s.appendChild(makeEl("h4", "stage-title", "Stage " + (i + 1) + " · " + d.stages[i]));
    build(s, d, w);
    s.hidden = true;
    panel.appendChild(s);
  });

  var nav = makeEl("div", "stage-nav");
  var back = makeEl("button", "btn btn-ghost stage-back", "← Back");
  back.type = "button";
  back.addEventListener("click", function () { showStage(w, beyond.stage[w] - 1, true); });
  var next = makeEl("button", "btn btn-primary stage-next", "Next stage →");
  next.type = "button";
  next.addEventListener("click", function () { showStage(w, beyond.stage[w] + 1, true); });
  var other = makeEl("button", "btn btn-ghost stage-other", w === "moon" ? "Switch to Mars →" : "← Switch to the Moon");
  other.type = "button";
  other.addEventListener("click", function () { selectWorld(w === "moon" ? "mars" : "moon", true); });
  nav.appendChild(back);
  nav.appendChild(next);
  nav.appendChild(other);
  panel.appendChild(nav);
  return panel;
}

var STAGE_MILESTONE = { moon: ["moon-explored", null, null, "moon-connect", null], mars: ["mars-explored", null, null, "mars-connect", null] };

function showStage(w, i, focus, quiet) {
  var panel = document.getElementById("beyond-" + w);
  if (!panel) return;
  i = Math.max(0, Math.min(4, i));
  beyond.stage[w] = i;
  beyondSave();
  panel.querySelectorAll(".stage").forEach(function (s) { s.hidden = Number(s.dataset.stage) !== i; });
  panel.querySelectorAll(".stage-step").forEach(function (b) {
    if (Number(b.dataset.stage) === i) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
  panel.querySelector(".stage-back").disabled = i === 0;
  var next = panel.querySelector(".stage-next");
  next.hidden = i === 4;
  var m = STAGE_MILESTONE[w][i];
  if (m && !panel.hidden && !quiet) markDone(m);
  updateWorldTabs();
  if (focus) {
    var t = panel.querySelector('.stage[data-stage="' + i + '"] .stage-title');
    t.tabIndex = -1;
    t.focus({ preventScroll: true });
    scrollToElement(panel.querySelector(".stage-stepper"));
  }
}

// ---------- Small shared pieces ----------
function para(parent, text, kind, cls) {
  var p = makeEl("p", cls || "");
  if (kind) { p.appendChild(makeTag(kind)); p.appendChild(document.createTextNode(" ")); }
  p.appendChild(document.createTextNode(text));
  parent.appendChild(p);
  return p;
}

function sourceLine(prefix, sources) {
  var p = makeEl("p", "evidence-source", prefix);
  (sources || []).forEach(function (s, i) {
    if (!isWebLink(s.url)) return;
    if (i) p.appendChild(document.createTextNode(" · "));
    p.appendChild(makeLink(s.url, s.name + " ↗"));
  });
  return p;
}

function figureWithCredit(parent, url, alt, credit, page, extraClass) {
  var fig = makeEl("figure", "beyond-figure " + (extraClass || ""));
  addImageUrl(fig, url, alt, "beyond-img"); // local copy first, then NASA
  var cap = makeEl("figcaption", "tn-credit", "Image: " + credit + " ");
  if (isWebLink(page)) cap.appendChild(makeLink(page, "(source ↗)"));
  fig.appendChild(cap);
  parent.appendChild(fig);
  return fig;
}

// ---------- MOON ----------
function moonEnter(s, d) {
  var eras = makeEl("div", "eras");
  d.eras.forEach(function (e) {
    var card = makeEl("article", "era era-" + e.id);
    card.appendChild(makeEl("span", "era-label", e.label));
    card.appendChild(makeEl("h5", "era-craft", e.craft));
    var ul = makeEl("ul");
    e.points.forEach(function (p) { ul.appendChild(makeEl("li", "", p)); });
    card.appendChild(ul);
    eras.appendChild(card);
  });
  s.appendChild(eras);
  var why = makeEl("div", "beyond-callout");
  why.appendChild(makeEl("h5", "", "Why it needs people"));
  para(why, d.whyHumans, "verified");
  s.appendChild(why);
  s.appendChild(makeEl("p", "beyond-small-title", "Questions planetary scientists are still working on:"));
  var q = makeEl("ul", "open-questions");
  d.questions.forEach(function (t) { q.appendChild(makeEl("li", "", t)); });
  s.appendChild(q);
  s.appendChild(sourceLine("Sources: ", d.sources.slice(0, 1).concat(d.sources.slice(2))));
}

// Stage 2: interactive ILLUSTRATION of align / blink / fade / flag (not lunar imagery)
function moonCompare(s, d) {
  var c = d.compare;
  var label = makeEl("p", "illus-label");
  label.appendChild(makeEl("span", "demo-flag", "Illustration"));
  label.appendChild(document.createTextNode(" " + c.illustrationLabel));
  s.appendChild(label);
  if (c.limitation) {
    var lim = para(s, c.limitation, "unknown", "illus-limitation");
    if (c.video && isWebLink(c.video.url)) {
      lim.appendChild(document.createTextNode(" "));
      lim.appendChild(makeLink(c.video.url, c.video.name + " ↗"));
    }
  }

  var grid = makeEl("div", "compare-grid");
  var steps = makeEl("ol", "compare-steps");
  c.steps.forEach(function (st) {
    var li = makeEl("li", "compare-step");
    li.dataset.step = st.id;
    li.appendChild(makeEl("strong", "", st.title));
    li.appendChild(makeEl("span", "", st.text));
    steps.appendChild(li);
  });
  grid.appendChild(steps);

  var viewer = makeEl("div", "cmp");
  var stage = makeEl("div", "cmp-stage");
  stage.setAttribute("role", "img");
  stage.setAttribute("aria-label", "Illustration of two overlapping frames of the same imaginary lunar area: an old film-style frame and a new digital-style frame.");
  var oldL = makeEl("div", "cmp-layer is-old");
  var newL = makeEl("div", "cmp-layer is-new");
  oldL.innerHTML = drawLunarFrame("old");
  newL.innerHTML = drawLunarFrame("new");
  stage.appendChild(oldL);
  stage.appendChild(newL);
  var tagOld = makeEl("span", "cmp-tag is-old", "OLD · film-era frame");
  var tagNew = makeEl("span", "cmp-tag is-new", "NEW · digital-era frame");
  stage.appendChild(tagOld);
  stage.appendChild(tagNew);
  var flag = makeEl("span", "cmp-flag");
  flag.hidden = true;
  stage.appendChild(flag);
  viewer.appendChild(stage);

  // Controls
  var ctr = makeEl("div", "cmp-controls");
  var alignL = makeEl("label", "cmp-slider", "Align ");
  var align = makeEl("input");
  align.type = "range"; align.min = 0; align.max = 100; align.value = 0;
  alignL.appendChild(align);
  var fadeL = makeEl("label", "cmp-slider", "Fade ");
  var fade = makeEl("input");
  fade.type = "range"; fade.min = 0; fade.max = 100; fade.value = 50; fade.disabled = true;
  fadeL.appendChild(fade);
  var blink = makeEl("button", "btn btn-ghost", "Blink");
  blink.type = "button"; blink.disabled = true;
  blink.setAttribute("aria-pressed", "false");
  ctr.appendChild(alignL);
  ctr.appendChild(blink);
  ctr.appendChild(fadeL);
  viewer.appendChild(ctr);
  var status = makeEl("p", "cmp-status", "Step 1: drag Align to line the frames up.");
  status.setAttribute("aria-live", "polite");
  viewer.appendChild(status);

  // Keyboard alternative for flagging: three candidate spots
  var kb = makeEl("div", "cmp-kb");
  kb.setAttribute("role", "group");
  kb.setAttribute("aria-label", "Or choose a spot to flag");
  kb.hidden = true;
  [["The bright scratch on the left", "scratch"], ["The large crater at the bottom", "same"], ["The small rayed crater, top right", "new"]].forEach(function (o) {
    var b = makeEl("button", "find-region", o[0]);
    b.type = "button";
    b.addEventListener("click", function () { judge(o[1], null); });
    kb.appendChild(b);
  });
  viewer.appendChild(kb);
  grid.appendChild(viewer);
  s.appendChild(grid);

  var result = makeEl("div", "demo-result");
  result.setAttribute("aria-live", "polite");
  s.appendChild(result);
  s.appendChild(sourceLine("Technique source: ", [d.sources[2]]));

  var aligned = false, timer = null, showingNew = true;
  function setStep(id) {
    steps.querySelectorAll(".compare-step").forEach(function (li) { li.classList.toggle("is-current", li.dataset.step === id); });
  }
  setStep("align");
  function applyAlign() {
    var t = Number(align.value) / 100;
    // Before alignment the old frame is shifted, scaled and slightly rotated (as raw pairs are)
    oldL.style.transform = "translate(" + (1 - t) * 14 + "%, " + (1 - t) * -9 + "%) rotate(" + (1 - t) * 6 + "deg) scale(" + (1 + (1 - t) * 0.12) + ")";
    if (t >= 0.97 && !aligned) {
      aligned = true;
      align.value = 100;
      oldL.style.transform = "none";
      blink.disabled = false; fade.disabled = false;
      kb.hidden = false;
      setStep("blink");
      status.textContent = "Aligned. Step 2: blink or fade between the frames. Step 3: click (or choose) what changed.";
    }
  }
  align.addEventListener("input", applyAlign);
  applyAlign();
  blink.addEventListener("click", function () {
    if (timer) {
      clearInterval(timer); timer = null;
      blink.textContent = "Blink"; blink.setAttribute("aria-pressed", "false");
      newL.style.opacity = fade.value / 100;
      return;
    }
    blink.textContent = "Stop blinking"; blink.setAttribute("aria-pressed", "true");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer = setInterval(function () {
      showingNew = !showingNew;
      newL.style.opacity = showingNew ? 1 : 0;
    }, reduce ? 1200 : 650);
    setStep("blink");
  });
  fade.addEventListener("input", function () {
    if (timer) { clearInterval(timer); timer = null; blink.textContent = "Blink"; blink.setAttribute("aria-pressed", "false"); }
    newL.style.opacity = fade.value / 100;
    setStep("blink");
  });
  newL.style.opacity = 0.5;

  stage.addEventListener("click", function (e) {
    if (!aligned) { status.textContent = "Align the frames first: drag the Align slider all the way."; return; }
    var r = stage.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * 400, y = (e.clientY - r.top) / r.height * 260;
    var hit = "none";
    if (Math.hypot(x - 300, y - 70) < 26) hit = "new";
    else if (x > 50 && x < 120 && y > 120 && y < 190) hit = "scratch";
    else if (Math.hypot(x - 170, y - 190) < 40 || Math.hypot(x - 90, y - 70) < 30) hit = "same";
    judge(hit, { x: x, y: y });
  });

  function judge(hit, pt) {
    if (!aligned) return;
    setStep("flag");
    var spots = { "new": { x: 300, y: 70 }, scratch: { x: 85, y: 155 }, same: { x: 170, y: 190 } };
    var p = pt || spots[hit] || { x: 200, y: 130 };
    flag.hidden = false;
    flag.style.left = p.x / 4 + "%";
    flag.style.top = p.y / 2.6 + "%";
    result.innerHTML = "";
    if (hit === "new") {
      flag.className = "cmp-flag is-good";
      para(result, "✓ " + c.found, null, "demo-verdict is-correct");
      markDone("moon-compare");
    } else if (hit === "scratch") {
      flag.className = "cmp-flag is-warn";
      para(result, "Careful: " + c.falseAlarm, null, "demo-verdict is-incorrect");
    } else {
      flag.className = "cmp-flag is-warn";
      para(result, c.missed, null, "demo-verdict is-incorrect");
    }
  }
}

// Draws one illustrated frame as inline SVG. Shared craters appear in both; the "new" frame has one
// extra rayed crater; the "old" frame has a film scratch. Lighting comes from opposite sides.
function drawLunarFrame(kind) {
  var craters = [[90, 70, 22], [170, 190, 34], [250, 140, 14], [330, 200, 20], [60, 215, 10], [215, 60, 9], [360, 110, 12], [130, 130, 8]];
  var light = kind === "old" ? -1 : 1; // shadow on the opposite side of the light
  var out = '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
  out += '<rect width="400" height="260" fill="' + (kind === "old" ? "#8a8578" : "#7d7f86") + '"/>';
  craters.forEach(function (c) {
    out += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + (kind === "old" ? "#6f6a5e" : "#64666d") + '"/>';
    out += '<ellipse cx="' + (c[0] + light * c[2] * 0.25) + '" cy="' + c[1] + '" rx="' + c[2] * 0.75 + '" ry="' + c[2] * 0.85 + '" fill="' + (kind === "old" ? "#4c483f" : "#45474e") + '"/>';
    out += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="none" stroke="' + (kind === "old" ? "#b3ad9c" : "#a9abb3") + '" stroke-width="1.5"/>';
  });
  if (kind === "new") {
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2, r1 = 9, r2 = 22 + (i % 3) * 7;
      out += '<line x1="' + (300 + Math.cos(a) * r1) + '" y1="' + (70 + Math.sin(a) * r1) + '" x2="' + (300 + Math.cos(a) * r2) + '" y2="' + (70 + Math.sin(a) * r2) + '" stroke="#d9dbe2" stroke-width="2" opacity="0.8"/>';
    }
    out += '<circle cx="300" cy="70" r="7" fill="#3c3e45" stroke="#e6e8ee" stroke-width="2"/>';
  } else {
    out += '<path d="M58 128 L112 186" stroke="#f1ead6" stroke-width="2.5" opacity="0.85"/>';
    // faint scan-line banding typical of reassembled film strips
    for (var y = 20; y < 260; y += 52) out += '<rect x="0" y="' + y + '" width="400" height="2" fill="#a39d8d" opacity="0.35"/>';
  }
  return out + "</svg>";
}

function moonInvestigate(s, d) {
  var look = makeEl("div", "lookfor");
  d.lookFor.forEach(function (l) {
    var card = makeEl("div", "lookfor-item");
    var h = makeEl("h5", "", l.title + " ");
    h.appendChild(makeTag(l.kind));
    card.appendChild(h);
    card.appendChild(makeEl("p", "", l.text));
    look.appendChild(card);
  });
  s.appendChild(look);
  observationLab(s, d.lab, d, "moon-lab", d.sources);
}

// ---------- MARS ----------
function marsEnter(s, d) {
  var grid = makeEl("div", "eras");
  var maven = makeEl("article", "era era-maven");
  maven.appendChild(makeEl("span", "era-label", "In orbit since 2014"));
  maven.appendChild(makeEl("h5", "era-craft", "NASA's MAVEN spacecraft"));
  var ul = makeEl("ul");
  d.maven.forEach(function (t) { ul.appendChild(makeEl("li", "", t)); });
  maven.appendChild(ul);
  var clouds = makeEl("article", "era era-clouds");
  clouds.appendChild(makeEl("span", "era-label", "Why clouds matter"));
  clouds.appendChild(makeEl("h5", "era-craft", "Clues to Mars' climate"));
  var ul2 = makeEl("ul");
  d.whyClouds.forEach(function (t) { ul2.appendChild(makeEl("li", "", t)); });
  clouds.appendChild(ul2);
  grid.appendChild(maven);
  grid.appendChild(clouds);
  s.appendChild(grid);
  s.appendChild(sourceLine("Sources: ", d.sources));
}

function marsShapes(s, d) {
  var wrap = makeEl("div", "shapes-grid");
  var fig = figureWithCredit(wrap, d.image, d.alt, d.credit, d.imagePage, "is-wide");
  var cap = makeEl("p", "tn-caption");
  cap.appendChild(makeTag("verified"));
  cap.appendChild(document.createTextNode(" " + d.caption));
  fig.appendChild(cap);
  var info = makeImageInfo(d);
  if (info) fig.appendChild(info);

  var side = makeEl("div", "shapes-side");
  side.appendChild(makeEl("p", "beyond-small-title", "Cloud shapes in the project's field guide. Select each one:"));
  var chips = makeEl("div", "cloud-chips");
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Cloud shapes");
  var text = makeEl("p", "cloud-type-text");
  text.setAttribute("aria-live", "polite");
  var seen = {};
  d.shapes.forEach(function (sh, i) {
    var b = makeEl("button", "cloud-chip", sh.name);
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      chips.querySelectorAll(".cloud-chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      text.textContent = sh.text + " (Source: " + sh.source + ".)";
      seen[i] = true;
      if (Object.keys(seen).length >= 3) markDone("mars-shapes");
    });
    chips.appendChild(b);
  });
  text.textContent = "Select a shape to learn what volunteers look for.";
  side.appendChild(chips);
  side.appendChild(text);
  side.appendChild(sourceLine("Sources: ", d.sources.slice(1)));
  wrap.appendChild(side);
  s.appendChild(wrap);
}

function marsObserve(s, d) {
  observationLab(s, { image: d.image, imagePage: d.imagePage, credit: d.credit, alt: d.alt,
    instrument: d.instrument, researching: "Researchers want to map which cloud shapes appear on Mars, and where and when, to learn about water vapour, winds and daily weather.",
    questions: d.lab.questions, canCannot: d.lab.canCannot, projectLink: d.lab.projectLink }, d, "mars-lab", d.sources);
}

// ---------- Shared: Science behind the image (expandable, every row labelled) ----------
function makeImageInfo(wd) {
  if (!wd || !Array.isArray(wd.imageInfo)) return null;
  var det = makeEl("details", "image-info");
  var sum = makeEl("summary", "", "Science behind the image");
  det.appendChild(sum);
  var dl = makeEl("dl", "image-info-list");
  wd.imageInfo.forEach(function (row) {
    var dt = makeEl("dt", "", row[0] + " ");
    dt.appendChild(makeTag(row[2] || "verified"));
    dl.appendChild(dt);
    dl.appendChild(makeEl("dd", "", row[1]));
  });
  det.appendChild(dl);
  det.appendChild(sourceLine("Sources: ", wd.imageInfoSources));
  det.addEventListener("toggle", function () { if (det.open) markDone("image-info"); });
  return det;
}

// ---------- Shared: Observation Lab ----------
// Shows a real, credited image, says what collected it and what is being researched, then asks three
// questions where "Not sure" is always a valid answer, and ends with what the image can and cannot establish.
// `wd` = the world's data (for the Science behind the image panel).
function observationLab(s, lab, wd, milestone, sources) {
  var box = makeEl("div", "obs-lab");
  var head = makeEl("div", "obs-head");
  head.appendChild(makeEl("span", "demo-flag", "Observation lab"));
  head.appendChild(makeEl("span", "obs-note", " Educational practice. Nothing is submitted anywhere."));
  box.appendChild(head);

  var grid = makeEl("div", "obs-grid");
  var left = makeEl("div");
  figureWithCredit(left, lab.image, lab.alt, lab.credit, lab.imagePage);
  para(left, lab.instrument, "verified", "obs-meta");
  para(left, lab.researching, "verified", "obs-meta");
  var info = makeImageInfo(wd);
  if (info) left.appendChild(info);
  grid.appendChild(left);

  var right = makeEl("div", "obs-questions");
  var qi = 0, sure = 0, unsure = 0;
  function showQ() {
    right.innerHTML = "";
    if (qi >= lab.questions.length) {
      var end = makeEl("div", "obs-end");
      end.appendChild(makeEl("p", "demo-verdict is-correct",
        "Lab complete. You gave " + sure + " evidence-based answer" + (sure === 1 ? "" : "s") + " and chose uncertainty " + unsure + " time" + (unsure === 1 ? "" : "s") + ". Both are part of science."));
      var cc = makeEl("dl", "can-cannot");
      cc.appendChild(makeEl("dt", "", "What this image can establish"));
      cc.appendChild(makeEl("dd", "", lab.canCannot.can));
      cc.appendChild(makeEl("dt", "", "What it cannot establish on its own"));
      cc.appendChild(makeEl("dd", "", lab.canCannot.cannot));
      end.appendChild(cc);
      if (lab.projectLink) para(end, lab.projectLink, null, "obs-project-link");
      var again = makeEl("button", "btn btn-ghost", "Try the lab again");
      again.type = "button";
      again.addEventListener("click", function () { qi = 0; sure = 0; unsure = 0; showQ(); });
      end.appendChild(again);
      right.appendChild(end);
      markDone(milestone);
      return;
    }
    var q = lab.questions[qi];
    var fs = makeEl("div", "obs-q");
    fs.appendChild(makeEl("p", "obs-principle", "Observation " + (qi + 1) + " of " + lab.questions.length + " · " + q.principle));
    fs.appendChild(makeEl("p", "obs-question", q.q));
    var opts = makeEl("div", "obs-options");
    opts.setAttribute("role", "group");
    opts.setAttribute("aria-label", "Your answer");
    var fb = makeEl("p", "obs-feedback");
    fb.setAttribute("aria-live", "polite");
    q.options.forEach(function (o) {
      var b = makeEl("button", "quiz-option", o);
      b.type = "button";
      b.addEventListener("click", function () {
        opts.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
        var isBest = o === q.best, isUnsure = o === (q.unsure || "Not sure");
        b.classList.add(isBest ? "correct" : isUnsure ? "unsure" : "wrong");
        if (!isBest) opts.querySelectorAll("button").forEach(function (x) { if (x.textContent === q.best) x.classList.add("best"); });
        if (isUnsure) unsure++; else if (isBest) sure++;
        fb.textContent = q.feedback[o];
        var next = makeEl("button", "quiz-next", qi === lab.questions.length - 1 ? "Finish the lab" : "Next observation");
        next.type = "button";
        next.addEventListener("click", function () { qi++; showQ(); });
        fs.appendChild(next);
        next.focus();
      });
      opts.appendChild(b);
    });
    fs.appendChild(opts);
    fs.appendChild(fb);
    right.appendChild(fs);
  }
  showQ();
  grid.appendChild(right);
  box.appendChild(grid);
  s.appendChild(box);
}

// ---------- Shared: connect to the archive ----------
function connectStage(s, d) {
  para(s, d.connect.intro, "interpretation", "connect-intro");
  var grid = makeEl("div", "connect-grid");
  d.connect.items.forEach(function (it) {
    var o = findObject(it.objectId);
    if (!o) return;
    var card = makeEl("article", "connect-card " + planetClass(o));
    addImage(card, o, "connect-img");
    var body = makeEl("div", "connect-body");
    body.appendChild(makeEl("h5", "", o.name));
    para(body, it.text, it.kind);
    var b = makeEl("button", "btn btn-ghost", "Open its heritage passport");
    b.type = "button";
    b.addEventListener("click", function () { openStory(o, b); });
    body.appendChild(b);
    card.appendChild(body);
    grid.appendChild(card);
  });
  s.appendChild(grid);
}

// ---------- Shared: continue on the official project ----------
function continueStage(s, d, w) {
  var c = d.continue;
  var box = makeEl("div", "continue-box is-" + w);
  box.appendChild(makeEl("p", "continue-headline", c.headline));
  var a = makeEl("a", "btn btn-primary continue-btn", c.button + " ↗");
  a.href = c.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", c.button + " (official project, opens in a new tab)");
  box.appendChild(a);
  box.appendChild(makeEl("p", "continue-must", c.mustSubmit));
  // Only the visitor can say they actually visited: nothing is recorded automatically
  if (c.record) {
    var rec = makeEl("button", "btn btn-ghost record-visit", c.record);
    rec.type = "button";
    function sync() {
      var done = !!beyond.done[w + "-official"];
      rec.setAttribute("aria-pressed", done ? "true" : "false");
      rec.textContent = done ? "✓ Recorded in my journal" : c.record;
    }
    rec.addEventListener("click", function () {
      if (beyond.done[w + "-official"]) { delete beyond.done[w + "-official"]; beyondSave(); renderJournal(); updateWorldTabs(); }
      else markDone(w + "-official");
      sync();
    });
    sync();
    box.appendChild(rec);
  }
  s.appendChild(box);

  s.appendChild(makeEl("p", "beyond-small-title", "What happens after you leave Lunar Echoes:"));
  var ol = makeEl("ol", "after-steps");
  c.after.forEach(function (t) { ol.appendChild(makeEl("li", "", t)); });
  s.appendChild(ol);
  if (c.note) para(s, c.note, "verified", "continue-note");
  var fallback = makeEl("p", "evidence-source", "If the project site is unavailable, read about it on NASA's own page: ");
  fallback.appendChild(makeLink(d.sources[0].url, d.sources[0].name + " ↗"));
  s.appendChild(fallback);
  s.appendChild(sourceLine("Sources: ", d.sources));
}

// ---------- Moon vs Mars comparison ----------
function buildComparison(data) {
  var sec = makeEl("section", "beyond-compare");
  sec.id = "beyond-compare";
  sec.setAttribute("aria-labelledby", "beyond-compare-title");
  var h = makeEl("h3", "beyond-section-title", "Two worlds. Two investigations. One scientific community.");
  h.id = "beyond-compare-title";
  sec.appendChild(h);
  var table = makeEl("table", "beyond-table");
  var thead = makeEl("thead");
  var tr = makeEl("tr");
  ["", "Moon", "Mars"].forEach(function (t, i) {
    var th = makeEl("th", i === 1 ? "is-moon" : i === 2 ? "is-mars" : "", t);
    th.scope = "col";
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);
  var tb = makeEl("tbody");
  data.comparison.rows.forEach(function (r) {
    var row = makeEl("tr");
    var th = makeEl("th", "", r[0]);
    th.scope = "row";
    row.appendChild(th);
    row.appendChild(makeEl("td", "", r[1]));
    row.appendChild(makeEl("td", "", r[2]));
    tb.appendChild(row);
  });
  table.appendChild(tb);
  var scroller = makeEl("div", "table-scroll");
  scroller.appendChild(table);
  sec.appendChild(scroller);
  para(sec, data.comparison.summary, "interpretation", "beyond-compare-summary");
  return sec;
}

// ---------- My Discovery Journal ----------
// A personal learning record kept only in this browser tab (sessionStorage). Not a certificate.
// beyond.questions = Open Questions Wall items the visitor opened; beyond.notes = optional private notes;
// beyond.charter = the visitor's Future Explorer Charter (written by js/beyond-extras.js).

function journalLabel(w) {
  return w === "moon" ? "Moon · MoonDiff" : w === "mars" ? "Mars · Cloudspotting on Mars: Shapes" : "Across both worlds";
}

function renderJournal() {
  var sec = document.getElementById("beyond-journal");
  if (!sec || !beyondData) return;
  var j = beyondData.journal;
  var keepFocus = document.activeElement && sec.contains(document.activeElement) ? document.activeElement.id : null;
  sec.innerHTML = "";
  var h = makeEl("h3", "beyond-section-title", "My discovery journal");
  h.id = "journal-title";
  sec.appendChild(h);
  var doneCount = j.milestones.filter(function (m) { return beyond.done[m.id]; }).length;
  sec.appendChild(makeEl("p", "journal-progress", doneCount + " of " + j.milestones.length + " milestones reached"));

  var cols = makeEl("div", "journal-cols");
  ["moon", "mars", "both"].forEach(function (w) {
    var col = makeEl("div", "journal-col is-" + w);
    col.appendChild(makeEl("h4", "", journalLabel(w)));
    var ul = makeEl("ul", "journal-list");
    j.milestones.filter(function (m) { return m.world === w; }).forEach(function (m) {
      ul.appendChild(makeEl("li", beyond.done[m.id] ? "is-done" : "", (beyond.done[m.id] ? "✓ " : "○ ") + m.text));
    });
    col.appendChild(ul);
    cols.appendChild(col);
  });
  sec.appendChild(cols);

  // Optional private notes (kept in this tab only)
  var notesLabel = makeEl("label", "journal-notes-label", "My notes (optional, stays in this browser tab; please do not enter personal information)");
  notesLabel.htmlFor = "journal-notes";
  var notes = makeEl("textarea", "journal-notes");
  notes.id = "journal-notes";
  notes.maxLength = 600;
  notes.rows = 3;
  notes.value = beyond.notes || "";
  notes.addEventListener("input", function () { beyond.notes = notes.value; beyondSave(); });
  sec.appendChild(notesLabel);
  sec.appendChild(notes);

  // Summary: My Planetary Discovery Journal
  var sum = makeEl("div", "journey-summary");
  sum.appendChild(makeEl("p", "journey-kicker", "Learning record"));
  sum.appendChild(makeEl("h4", "journey-title", "My Planetary Discovery Journal"));
  var explored = ["moon", "mars"].filter(function (w) { return beyond.done[w + "-explored"]; });
  sum.appendChild(makeEl("p", "", explored.length
    ? "Worlds explored: " + explored.map(function (w) { return w === "moon" ? "the Moon" : "Mars"; }).join(" and ") + "."
    : "No world explored yet. Begin in Mission Control above."));
  var learned = j.milestones.filter(function (m) { return beyond.done[m.id] && !/official/.test(m.id); });
  if (learned.length) {
    sum.appendChild(makeEl("p", "beyond-small-title", "Learning activities completed"));
    var ul = makeEl("ul");
    learned.forEach(function (m) { ul.appendChild(makeEl("li", "", m.text.replace(/^I /, ""))); });
    sum.appendChild(ul);
  }
  var qs = journalQuestions();
  if (qs.length) {
    sum.appendChild(makeEl("p", "beyond-small-title", "Questions I explored"));
    var qul = makeEl("ul");
    qs.forEach(function (q) { qul.appendChild(makeEl("li", "", q)); });
    sum.appendChild(qul);
  }
  sum.appendChild(makeEl("p", "beyond-small-title", "Official opportunities to continue"));
  var links = makeEl("div", "journey-links");
  ["moon", "mars"].forEach(function (w) {
    var c = beyondData.worlds[w].continue;
    var a = makeEl("a", "btn btn-ghost", beyondData.worlds[w].project + " ↗");
    a.href = c.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    links.appendChild(a);
  });
  sum.appendChild(links);
  sum.appendChild(makeEl("p", "journey-note", j.note));

  var acts = makeEl("div", "journey-actions");
  var print = makeEl("button", "btn btn-primary", "Print or save my journal");
  print.type = "button";
  print.addEventListener("click", openJournalPrint);
  var reset = makeEl("button", "btn btn-ghost journal-reset", "Clear my journal");
  reset.type = "button";
  reset.addEventListener("click", function () {
    beyond.done = {};
    beyond.questions = [];
    beyond.notes = "";
    beyondSave();
    renderJournal();
    updateWorldTabs();
    document.querySelectorAll(".record-visit").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
  });
  acts.appendChild(print);
  acts.appendChild(reset);
  sum.appendChild(acts);
  sec.appendChild(sum);
  if (keepFocus && document.getElementById(keepFocus)) document.getElementById(keepFocus).focus();
}

// Titles of the open questions the visitor explored (filled by js/beyond-extras.js)
function journalQuestions() {
  var ids = Array.isArray(beyond.questions) ? beyond.questions : [];
  var titles = (typeof beyondQuestionTitle === "function") ? ids.map(beyondQuestionTitle).filter(Boolean) : [];
  return titles;
}

function escapeHtml(s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Opens a clean, printable summary in a new tab (or downloads it if pop-ups are blocked)
function openJournalPrint() {
  var j = beyondData.journal;
  var done = j.milestones.filter(function (m) { return beyond.done[m.id]; });
  var explored = ["moon", "mars"].filter(function (w) { return beyond.done[w + "-explored"]; })
    .map(function (w) { return w === "moon" ? "The Moon" : "Mars"; });
  var today = new Date();
  var dateText = today.getDate() + " " + MONTHS[today.getMonth()] + " " + today.getFullYear();
  var ch = beyond.charter;
  var html = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>My Planetary Discovery Journal</title><style>" +
    "body{font-family:Georgia,'Times New Roman',serif;color:#111;max-width:720px;margin:24px auto;padding:0 20px;line-height:1.5}" +
    "h1{font-size:28px;margin:4px 0 2px}h2{font-family:Arial,sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid #999;margin:20px 0 6px}" +
    ".k{font-family:Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#555}.note{border:1px solid #333;padding:8px 10px;font-size:13px}" +
    "li{margin:3px 0}.url{font-family:Arial,sans-serif;font-size:12px;color:#333;word-break:break-all}button{font-family:Arial,sans-serif;padding:8px 14px}@media print{button{display:none}}" +
    "</style></head><body><button onclick=\"window.print()\">Print or save as PDF</button>" +
    "<p class=\"k\">Lunar Echoes · Beyond the Archive · " + escapeHtml(dateText) + "</p><h1>My Planetary Discovery Journal</h1>" +
    "<h2>Worlds explored</h2><p>" + (explored.length ? escapeHtml(explored.join(" and ")) : "None yet") + "</p>" +
    "<h2>Learning activities completed</h2><ul>" + (done.length ? done.map(function (m) { return "<li>" + escapeHtml(m.text) + "</li>"; }).join("") : "<li>None yet</li>") + "</ul>" +
    "<h2>Scientific concepts</h2><ul><li>Observation: what I can actually see.</li><li>Interpretation: what it might mean.</li><li>Evidence: what supports an interpretation.</li><li>Uncertainty: what I cannot confidently conclude, which is a valid scientific answer.</li></ul>" +
    (journalQuestions().length ? "<h2>Questions I explored</h2><ul>" + journalQuestions().map(function (q) { return "<li>" + escapeHtml(q) + "</li>"; }).join("") + "</ul>" : "") +
    (beyond.notes ? "<h2>My notes</h2><p>" + escapeHtml(beyond.notes) + "</p>" : "") +
    (ch && ch.principles && ch.principles.length ? "<h2>My Future Explorer Charter</h2><ul>" + ch.principles.map(function (p) { return "<li>" + escapeHtml(p) + "</li>"; }).join("") + "</ul>" + (ch.text ? "<p><em>" + escapeHtml(ch.text) + "</em></p>" : "") : "") +
    "<h2>Continue with real citizen science</h2><ul>" + ["moon", "mars"].map(function (w) {
      var d = beyondData.worlds[w];
      return "<li>" + escapeHtml(d.project) + "<br><span class=\"url\">" + escapeHtml(d.continue.url) + "</span></li>";
    }).join("") + "</ul>" +
    "<p class=\"note\">" + escapeHtml(j.note) + "</p><p class=\"k\">" + escapeHtml(beyondData.disclaimer) + "</p></body></html>";
  openHtmlDocument(html, "my-planetary-discovery-journal.html");
}

// Shared by the journal and the charter: open generated HTML in a new tab, or download it.
function openHtmlDocument(html, filename) {
  var blob = new Blob([html], { type: "text/html" });
  var url = URL.createObjectURL(blob);
  var win = window.open(url, "_blank");
  if (!win) {
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}
