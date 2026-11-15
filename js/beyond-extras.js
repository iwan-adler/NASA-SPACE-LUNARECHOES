// Lunar Echoes - BEYOND THE ARCHIVE, extended learning:
// Past -> Present -> Future, the Discovery Impact Chain, the Open Questions Wall,
// Ask a Planetary Scientist (local question bank, no AI), the Planetary Scientist Profile
// and the Future Explorer Charter.
//
// Content: data/beyond-learning.json. Uses helpers from js/objects.js and js/citizen.js
// (makeEl, makeTag, makeLink, findObject, openStory, selectWorld, markDone, beyond, beyondSave,
// renderJournal, openHtmlDocument, escapeHtml, scrollToElement). Nothing is sent anywhere.

var learning = null;

function renderBeyondExtras(data) {
  learning = data;
  var ids = ["beyond-ppf", "beyond-impact", "beyond-wall", "beyond-ask", "beyond-profile", "beyond-charter"];
  if (!data) {
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true; // the core investigations still work without this file
    });
    return;
  }
  [
    ["beyond-ppf", buildPPF],
    ["beyond-impact", buildImpact],
    ["beyond-wall", buildWall],
    ["beyond-ask", buildAsk],
    ["beyond-profile", buildProfile],
    ["beyond-charter", buildCharter]
  ].forEach(function (pair) {
    var el = document.getElementById(pair[0]);
    if (!el) return;
    el.innerHTML = "";
    try { pair[1](el, data); } catch (e) { console.error(pair[0] + " failed:", e); el.hidden = true; }
  });
  renderJournal(); // so "Questions I explored" can show titles
}

// ---------- shared helpers ----------
function srcList(keys) {
  var p = makeEl("p", "evidence-source", "Sources: ");
  (keys || []).forEach(function (k, i) {
    var s = learning.sources[k];
    if (!s) return;
    if (i) p.appendChild(document.createTextNode(" · "));
    p.appendChild(makeLink(s.url, s.name + " ↗"));
  });
  return p;
}

function objectChips(ids) {
  var wrap = makeEl("div", "object-chips");
  (ids || []).forEach(function (id) {
    var o = findObject(id);
    if (!o) return;
    var b = makeEl("button", "object-chip " + planetClass(o), o.name);
    b.type = "button";
    b.setAttribute("aria-label", "Open the heritage passport of " + o.name);
    b.addEventListener("click", function () { openStory(o, b); });
    wrap.appendChild(b);
  });
  return wrap;
}

function sectionHead(el, eyebrow, title, intro, id) {
  el.appendChild(makeEl("p", "eyebrow", eyebrow));
  var h = makeEl("h3", "beyond-section-title", title);
  h.id = id;
  el.setAttribute("aria-labelledby", id);
  el.appendChild(h);
  if (intro) el.appendChild(makeEl("p", "beyond-section-intro", intro));
}

// ---------- Past -> Present -> Future ----------
function buildPPF(el, data) {
  var d = data.ppf;
  el.className = "beyond-block ppf";
  sectionHead(el, "Past · Present · Future", d.title, d.intro, "ppf-title");

  var rail = makeEl("div", "ppf-rail");
  rail.setAttribute("role", "group");
  rail.setAttribute("aria-label", "Choose a time");
  var view = makeEl("div", "ppf-view");
  view.setAttribute("aria-live", "polite");

  function show(eraId) {
    rail.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.era === eraId ? "true" : "false"); });
    rail.dataset.at = eraId;
    view.innerHTML = "";
    ["moon", "mars"].forEach(function (w) {
      var e = d[w][eraId];
      var col = makeEl("article", "ppf-col is-" + w);
      col.appendChild(makeEl("h4", "", w === "moon" ? "Moon" : "Mars"));
      var p = makeEl("p");
      p.appendChild(makeTag(d.kind || "verified"));
      p.appendChild(document.createTextNode(" " + e.text));
      col.appendChild(p);
      if (e.objects && e.objects.length) col.appendChild(objectChips(e.objects));
      if (e.goto) {
        var g = makeEl("button", "btn btn-ghost", w === "moon" ? "Open the Lunar Investigation" : "Open the Martian Atmosphere Lab");
        g.type = "button";
        g.addEventListener("click", function () { selectWorld(e.goto, true); });
        col.appendChild(g);
      }
      col.appendChild(srcList(e.sources));
      view.appendChild(col);
    });
  }
  d.eras.forEach(function (era) {
    var b = makeEl("button", "ppf-step");
    b.type = "button";
    b.dataset.era = era.id;
    b.appendChild(makeEl("span", "ppf-label", era.label));
    b.appendChild(makeEl("span", "ppf-step-title", era.title));
    b.addEventListener("click", function () { show(era.id); });
    rail.appendChild(b);
  });
  el.appendChild(rail);
  el.appendChild(view);
  show("past");
}

// ---------- Discovery Impact Chain ----------
function buildImpact(el, data) {
  var d = data.impact;
  el.className = "beyond-block impact";
  sectionHead(el, "Discovery impact chain", d.title, null, "impact-title");

  var tog = makeEl("div", "impact-toggle");
  tog.setAttribute("role", "group");
  tog.setAttribute("aria-label", "Show the chain for");
  var chain = makeEl("ol", "impact-chain");
  var world = "moon";
  function draw() {
    tog.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.w === world ? "true" : "false"); });
    chain.className = "impact-chain is-" + world;
    chain.innerHTML = "";
    d.steps.forEach(function (st, i) {
      var li = makeEl("li", "impact-step");
      li.appendChild(makeEl("span", "impact-no", String(i + 1)));
      var body = makeEl("div");
      body.appendChild(makeEl("h4", "", st.title));
      body.appendChild(makeEl("p", "", st[world]));
      li.appendChild(body);
      chain.appendChild(li);
    });
  }
  [["moon", "MoonDiff (Moon)"], ["mars", "Cloudspotting on Mars: Shapes"]].forEach(function (w) {
    var b = makeEl("button", "impact-tab", w[1]);
    b.type = "button";
    b.dataset.w = w[0];
    b.addEventListener("click", function () { world = w[0]; draw(); });
    tog.appendChild(b);
  });
  var play = makeEl("button", "btn btn-ghost impact-play", "▶ Follow one observation");
  play.type = "button";
  play.addEventListener("click", function () {
    var steps = chain.querySelectorAll(".impact-step");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    steps.forEach(function (s) { s.classList.remove("is-lit"); });
    steps.forEach(function (s, i) {
      setTimeout(function () { s.classList.add("is-lit"); }, reduce ? 0 : i * 550);
    });
  });
  tog.appendChild(play);
  el.appendChild(tog);
  el.appendChild(chain);
  draw();
  var c = makeEl("p", "impact-caution");
  c.appendChild(makeTag("verified"));
  c.appendChild(document.createTextNode(" " + d.caution));
  el.appendChild(c);
  el.appendChild(srcList(d.sources));
}

// ---------- Open Questions Wall ----------
function beyondQuestionTitle(id) {
  if (!learning) return null;
  var q = learning.wall.questions.filter(function (x) { return x.id === id; })[0];
  return q ? q.q : null;
}

function buildWall(el, data) {
  var d = data.wall;
  el.className = "beyond-block wall";
  sectionHead(el, "Open questions wall", d.title, d.intro, "wall-title");
  var grid = makeEl("div", "wall-grid");
  var detail = makeEl("div", "wall-detail");
  detail.setAttribute("aria-live", "polite");
  detail.hidden = true;

  ["Moon", "Mars", "Heritage"].forEach(function (g) {
    var col = makeEl("div", "wall-col is-" + g.toLowerCase());
    col.appendChild(makeEl("h4", "", g));
    d.questions.filter(function (q) { return q.group === g; }).forEach(function (q) {
      var b = makeEl("button", "wall-q", q.q);
      b.type = "button";
      b.setAttribute("aria-expanded", "false");
      b.setAttribute("aria-controls", "wall-detail");
      b.addEventListener("click", function () {
        el.querySelectorAll(".wall-q").forEach(function (x) { x.setAttribute("aria-expanded", "false"); });
        b.setAttribute("aria-expanded", "true");
        showDetail(q);
      });
      col.appendChild(b);
    });
    grid.appendChild(col);
  });
  detail.id = "wall-detail";
  el.appendChild(grid);
  el.appendChild(detail);

  function showDetail(q) {
    detail.hidden = false;
    detail.innerHTML = "";
    detail.className = "wall-detail is-" + q.group.toLowerCase();
    detail.appendChild(makeEl("h4", "wall-detail-title", q.q));
    var dl = makeEl("dl", "wall-dl");
    [["Why it matters", q.why, "verified"], ["What is currently known", q.known, "verified"],
     ["Relevant evidence", q.evidence, "verified"], ["What remains uncertain", q.uncertain, "unknown"]].forEach(function (r) {
      var dt = makeEl("dt", "", r[0] + " ");
      dt.appendChild(makeTag(r[2]));
      dl.appendChild(dt);
      dl.appendChild(makeEl("dd", "", r[1]));
    });
    detail.appendChild(dl);
    if (q.objects && q.objects.length) {
      detail.appendChild(makeEl("p", "beyond-small-title", "Related Lunar Echoes artifacts"));
      detail.appendChild(objectChips(q.objects));
    }
    if (q.project) {
      var b = makeEl("button", "btn btn-ghost", q.project === "moon" ? "Related project: MoonDiff, in the Lunar Investigation" : "Related project: Cloudspotting on Mars: Shapes, in the Atmosphere Lab");
      b.type = "button";
      b.addEventListener("click", function () { selectWorld(q.project, true); });
      detail.appendChild(b);
    } else {
      detail.appendChild(makeEl("p", "wall-noproject", "No citizen-science project in this experience answers this question. It is one for all of us. Try the Future Explorer scenario and the Charter."));
    }
    detail.appendChild(srcList(q.sources));
    if (!Array.isArray(beyond.questions)) beyond.questions = [];
    if (beyond.questions.indexOf(q.id) === -1) beyond.questions.push(q.id);
    beyondSave();
    markDone("wall");
    renderJournal();
  }
}

// ---------- Ask a Planetary Scientist (local question bank) ----------
function buildAsk(el, data) {
  var d = data.ask;
  el.className = "beyond-block ask";
  sectionHead(el, "Question bank", d.title, d.intro, "ask-title");
  var controls = makeEl("div", "ask-controls");
  var lab = makeEl("label", "ask-search-label", "Search questions ");
  var input = makeEl("input", "ask-search");
  input.type = "search";
  input.id = "ask-search";
  input.placeholder = "e.g. MAVEN, craters, uncertainty";
  lab.appendChild(input);
  controls.appendChild(lab);
  var topics = makeEl("div", "ask-topics");
  topics.setAttribute("role", "group");
  topics.setAttribute("aria-label", "Filter by topic");
  var topic = "All";
  ["All"].concat(d.topics).forEach(function (t) {
    var b = makeEl("button", "ask-topic", t);
    b.type = "button";
    b.addEventListener("click", function () { topic = t; draw(); });
    topics.appendChild(b);
  });
  controls.appendChild(topics);
  el.appendChild(controls);
  var count = makeEl("p", "ask-count");
  count.setAttribute("aria-live", "polite");
  el.appendChild(count);
  var list = makeEl("div", "ask-list");
  el.appendChild(list);

  function draw() {
    topics.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.textContent === topic ? "true" : "false"); });
    var term = input.value.trim().toLowerCase();
    var items = d.items.filter(function (it) {
      return (topic === "All" || it.topic === topic) &&
        (!term || (it.q + " " + it.a).toLowerCase().indexOf(term) !== -1);
    });
    count.textContent = items.length + " of " + d.items.length + " questions";
    list.innerHTML = "";
    if (!items.length) {
      list.appendChild(makeEl("p", "no-results", "No question matches. Try another word, or choose All."));
      return;
    }
    items.forEach(function (it) {
      var det = makeEl("details", "ask-item");
      var sum = makeEl("summary");
      sum.appendChild(makeEl("span", "ask-topic-tag", it.topic));
      sum.appendChild(document.createTextNode(" " + it.q));
      det.appendChild(sum);
      var p = makeEl("p");
      p.appendChild(makeTag(it.kind));
      p.appendChild(document.createTextNode(" " + it.a));
      det.appendChild(p);
      if (it.sources && it.sources.length) det.appendChild(srcList(it.sources));
      else det.appendChild(makeEl("p", "evidence-source", "Our own explanation of scientific method, not a NASA statement."));
      det.addEventListener("toggle", function () { if (det.open) markDone("ask"); });
      list.appendChild(det);
    });
  }
  input.addEventListener("input", draw);
  draw();
}

// ---------- Planetary Scientist Profile (optional, nothing stored) ----------
function buildProfile(el, data) {
  var d = data.profile;
  el.className = "beyond-block profile";
  sectionHead(el, "Optional", d.title, d.intro, "profile-title");
  var answers = {};
  var list = makeEl("ul", "profile-qs");
  d.questions.forEach(function (q) {
    var li = makeEl("li", "profile-q");
    li.appendChild(makeEl("span", "profile-text", q.q));
    var g = makeEl("div", "profile-yn");
    g.setAttribute("role", "group");
    g.setAttribute("aria-label", q.q);
    ["Yes", "No"].forEach(function (v) {
      var b = makeEl("button", "profile-btn", v);
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        answers[q.id] = v === "Yes";
        g.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
      g.appendChild(b);
    });
    li.appendChild(g);
    list.appendChild(li);
  });
  el.appendChild(list);
  var acts = makeEl("div", "profile-actions");
  var go = makeEl("button", "btn btn-primary", "Suggest my pathways");
  go.type = "button";
  var skip = makeEl("a", "btn btn-ghost", "Skip this");
  skip.href = "#beyond-journal";
  skip.addEventListener("click", function (e) { e.preventDefault(); scrollToElement(document.getElementById("beyond-journal")); });
  acts.appendChild(go);
  acts.appendChild(skip);
  el.appendChild(acts);
  var out = makeEl("div", "profile-out");
  out.setAttribute("aria-live", "polite");
  el.appendChild(out);

  go.addEventListener("click", function () {
    out.innerHTML = "";
    var reasons = {};
    d.questions.forEach(function (q) {
      if (answers[q.id]) (reasons[q.pathway] = reasons[q.pathway] || []).push(q.q);
    });
    var keys = Object.keys(reasons);
    if (!keys.length) {
      out.appendChild(makeEl("p", "", "Answer \"Yes\" to at least one question, or start anywhere: both investigations welcome beginners."));
      return;
    }
    keys.forEach(function (k) {
      var pw = d.pathways[k];
      var card = makeEl("article", "pathway");
      card.appendChild(makeEl("h4", "", pw.name));
      card.appendChild(makeEl("p", "", pw.why + " Suggested because you said yes to: " + reasons[k].map(function (r) { return "\"" + r + "\""; }).join(", ")));
      var links = makeEl("div", "pathway-links");
      pw.links.forEach(function (l) {
        var a = makeEl("a", "btn btn-ghost", l[0]);
        a.href = l[1];
        a.addEventListener("click", function (e) {
          e.preventDefault();
          if (l[1] === "#beyond-moon" || l[1] === "#beyond-mars") selectWorld(l[1].slice(8), true);
          else scrollToElement(document.querySelector(l[1]));
        });
        links.appendChild(a);
      });
      var projects = pw.project === "both" ? ["moon", "mars"] : [pw.project];
      projects.forEach(function (w) {
        var c = beyondData.worlds[w];
        var a = makeEl("a", "btn btn-ghost", c.project + " ↗");
        a.href = c.continue.url; a.target = "_blank"; a.rel = "noopener noreferrer";
        links.appendChild(a);
      });
      card.appendChild(links);
      out.appendChild(card);
    });
  });
}

// ---------- The Future Explorer Charter ----------
function buildCharter(el, data) {
  var d = data.charter;
  el.className = "beyond-block charter";
  sectionHead(el, "Closing", d.title, null, "charter-title");
  el.appendChild(makeEl("p", "charter-opening", d.opening));

  var form = makeEl("form", "charter-form");
  var fs = makeEl("fieldset");
  fs.appendChild(makeEl("legend", "", "Choose the principles you would sign"));
  var saved = beyond.charter || { principles: [], text: "" };
  d.principles.forEach(function (p, i) {
    var row = makeEl("div", "charter-row");
    var cb = makeEl("input");
    cb.type = "checkbox";
    cb.id = "charter-" + i;
    cb.value = p;
    cb.checked = saved.principles.indexOf(p) !== -1;
    var lab = makeEl("label", "", p);
    lab.htmlFor = cb.id;
    row.appendChild(cb);
    row.appendChild(lab);
    fs.appendChild(row);
  });
  form.appendChild(fs);
  var tl = makeEl("label", "charter-text-label", "My reason");
  tl.htmlFor = "charter-text";
  var ta = makeEl("textarea", "charter-text");
  ta.id = "charter-text";
  ta.maxLength = 280;
  ta.rows = 3;
  ta.placeholder = d.placeholder;
  ta.value = saved.text || "";
  form.appendChild(tl);
  form.appendChild(ta);
  var submit = makeEl("button", "btn btn-primary", "Create my charter");
  submit.type = "submit";
  form.appendChild(submit);
  var msg = makeEl("p", "charter-msg");
  msg.setAttribute("aria-live", "polite");
  form.appendChild(msg);
  el.appendChild(form);

  var out = makeEl("div", "charter-out");
  el.appendChild(out);

  function render(ch) {
    out.innerHTML = "";
    var card = makeEl("article", "charter-card");
    card.appendChild(makeEl("p", "charter-kicker", "Lunar Echoes · Beyond the Archive"));
    card.appendChild(makeEl("h4", "charter-card-title", "My Future Explorer Charter"));
    card.appendChild(makeEl("p", "charter-card-opening", d.opening));
    var ul = makeEl("ul", "charter-list");
    ch.principles.forEach(function (p) { ul.appendChild(makeEl("li", "", p)); });
    card.appendChild(ul);
    if (ch.text) card.appendChild(makeEl("blockquote", "charter-quote", ch.text));
    card.appendChild(makeEl("p", "charter-date", ch.date));
    card.appendChild(makeEl("p", "charter-label", d.label));
    out.appendChild(card);
    var acts = makeEl("div", "charter-actions");
    var pr = makeEl("button", "btn btn-ghost", "Print or save as PDF");
    pr.type = "button";
    pr.addEventListener("click", function () { printCharter(ch, d); });
    var cp = makeEl("button", "btn btn-ghost", "Copy as text");
    cp.type = "button";
    cp.addEventListener("click", function () {
      var txt = "My Future Explorer Charter (Lunar Echoes)\n\n" + ch.principles.map(function (p) { return "- " + p; }).join("\n") +
        (ch.text ? "\n\n\"" + ch.text + "\"" : "") + "\n\n" + d.label;
      var done = function () { cp.textContent = "Copied ✓"; setTimeout(function () { cp.textContent = "Copy as text"; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { cp.textContent = "Copy failed: select the text instead"; });
      else cp.textContent = "Copy not available: select the text instead";
    });
    acts.appendChild(pr);
    acts.appendChild(cp);
    out.appendChild(acts);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var chosen = [].slice.call(form.querySelectorAll("input[type=checkbox]:checked")).map(function (c) { return c.value; });
    if (!chosen.length) { msg.textContent = "Choose at least one principle."; return; }
    msg.textContent = "";
    var t = new Date();
    var ch = { principles: chosen, text: ta.value.trim().slice(0, 280), date: t.getDate() + " " + MONTHS[t.getMonth()] + " " + t.getFullYear() };
    beyond.charter = ch;
    beyondSave();
    render(ch);
    markDone("charter");
    renderJournal();
    out.querySelector(".charter-card").scrollIntoView({ block: "nearest" });
  });
  if (saved.principles.length && saved.date) render(saved);
}

function printCharter(ch, d) {
  var html = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>My Future Explorer Charter</title><style>" +
    "body{font-family:Georgia,'Times New Roman',serif;color:#111;max-width:640px;margin:40px auto;padding:0 24px;text-align:center;line-height:1.5}" +
    ".frame{border:3px double #333;padding:28px 30px}.k{font-family:Arial,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#555}" +
    "h1{font-size:30px;margin:8px 0}ul{text-align:left;margin:18px auto;max-width:440px}li{margin:6px 0}blockquote{font-style:italic;margin:16px 0}" +
    ".label{font-family:Arial,sans-serif;font-size:11px;color:#444;margin-top:18px}button{font-family:Arial,sans-serif;padding:8px 14px;margin-bottom:14px}@media print{button{display:none}}" +
    "</style></head><body><button onclick=\"window.print()\">Print or save as PDF</button><div class=\"frame\">" +
    "<p class=\"k\">Lunar Echoes · Beyond the Archive</p><h1>My Future Explorer Charter</h1><p>" + escapeHtml(d.opening) + "</p><ul>" +
    ch.principles.map(function (p) { return "<li>" + escapeHtml(p) + "</li>"; }).join("") + "</ul>" +
    (ch.text ? "<blockquote>“" + escapeHtml(ch.text) + "”</blockquote>" : "") +
    "<p class=\"k\">" + escapeHtml(ch.date) + "</p><p class=\"label\">" + escapeHtml(d.label) + "</p></div></body></html>";
  openHtmlDocument(html, "my-future-explorer-charter.html");
}
