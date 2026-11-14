// Lunar Echoes - "Open a Case File" investigations and the Mission Control Decision Room.
// Reuses the object records from data/objects.json; case evidence and the decision scenario
// come from data/cases.json and data/decision.json. Every claim shown links to a NASA source.

var caseFiles = [];
var caseObjects = [];

// Called from main.js. `casesData` / `decisionData` may be null if their files failed to load.
function renderCases(objects, casesData) {
  caseObjects = objects;
  caseFiles = (casesData && Array.isArray(casesData.cases) ? casesData.cases : []).filter(function (c) {
    return !!findObject(c.objectId); // only cases whose object exists
  });
  var shelf = document.getElementById("case-shelf");
  if (!shelf) return;
  shelf.innerHTML = "";
  shelf.removeAttribute("aria-busy");

  // Explain the evidence labels once, above the case files
  if (!document.getElementById("cases-legend")) {
    var legend = makeBoundaryLegend();
    legend.id = "cases-legend";
    shelf.parentNode.insertBefore(legend, shelf);
  }

  if (caseFiles.length === 0) {
    shelf.appendChild(makeEl("p", "no-results", "Case files are not available right now. The collection below still works."));
    // The landing button still goes somewhere useful
    document.querySelectorAll("[data-open-case]").forEach(function (b) {
      b.addEventListener("click", function () { scrollToElement(document.getElementById("cases")); });
    });
    return;
  }

  caseFiles.forEach(function (c, index) {
    var item = findObject(c.objectId);
    var btn = makeEl("button", "case-folder " + planetClass(item));
    btn.type = "button";
    btn.setAttribute("aria-label", "Open case file " + c.caseNumber + ": " + item.name);
    addImage(btn, item, "case-folder-img");
    var label = makeEl("span", "case-folder-text");
    label.appendChild(makeEl("span", "case-no", "Case " + c.caseNumber));
    label.appendChild(makeEl("span", "case-codename", c.codename));
    label.appendChild(makeEl("span", "case-object", item.name + " · " + item.planet));
    label.appendChild(makeEl("span", "case-open", "Open case file →"));
    btn.appendChild(label);
    btn.addEventListener("click", function () { openCase(index); });
    shelf.appendChild(btn);
  });

  // Any button with data-open-case="<number>" (e.g. on the landing page) opens that case
  document.querySelectorAll("[data-open-case]").forEach(function (b) {
    if (b.dataset.wired) return;
    b.dataset.wired = "yes";
    b.addEventListener("click", function () { openCase(Number(b.getAttribute("data-open-case")) || 0); });
  });
}

// Opens one investigation. `scroll` = bring it into view (true when opened from elsewhere).
function openCase(index, scroll) {
  var c = caseFiles[index];
  if (!c) return;
  var item = findObject(c.objectId);
  var view = document.getElementById("case-view");
  view.hidden = false;
  view.innerHTML = "";
  view.className = "case-view " + planetClass(item);

  // --- Header ---
  var header = makeEl("header", "case-header");
  var back = makeEl("button", "case-back", "← All case files");
  back.type = "button";
  back.addEventListener("click", closeCase);
  header.appendChild(back);
  header.appendChild(makeEl("p", "case-stamp-line", "Case file " + c.caseNumber + " · " + c.codename));
  var title = makeEl("h3", "case-title", item.name);
  title.id = "case-title";
  title.tabIndex = -1;
  header.appendChild(title);
  var meta = makeEl("div", "case-meta");
  meta.appendChild(makeBadges(item));
  meta.appendChild(document.createTextNode(" " + showValue(item.mission) + " · arrived " + showValue(item.year) + " · " + showValue(item.category)));
  header.appendChild(meta);
  view.appendChild(header);

  var grid = makeEl("div", "case-grid");

  // --- Left: the photograph (Then vs Now switch) ---
  var left = makeEl("div", "case-photo");
  left.appendChild(makeThenNow(item));
  grid.appendChild(left);

  // --- Right: the dossier ---
  var right = makeEl("div", "case-dossier");
  var hook = makeEl("blockquote", "case-hook");
  hook.appendChild(makeEl("span", "case-hook-label", "The mystery"));
  hook.appendChild(makeEl("p", "", c.hook));
  right.appendChild(hook);

  // Exhibits A-C reuse the object's own verified record
  var exhibits = makeEl("dl", "case-exhibits");
  [["Exhibit A · Designed to", item.purpose],
   ["Exhibit B · Mission log", item.story],
   ["Exhibit C · Documented status today", item.status]].forEach(function (e) {
    var dt = makeEl("dt", "", e[0] + " ");
    dt.appendChild(makeTag("verified"));
    exhibits.appendChild(dt);
    exhibits.appendChild(makeEl("dd", "", showValue(e[1])));
  });
  var recordNote = makeEl("p", "evidence-source", "Exhibits A–C: ");
  recordNote.appendChild(isWebLink(item.source) ? makeLink(item.source, sourceName(item.source)) : document.createTextNode(showValue(item.source)));
  right.appendChild(exhibits);
  right.appendChild(recordNote);

  // Evidence: open each file one by one
  var evHead = makeEl("div", "case-evidence-head");
  evHead.appendChild(makeEl("h4", "", "Evidence from NASA sources"));
  var counter = makeEl("span", "case-counter");
  counter.setAttribute("aria-live", "polite");
  evHead.appendChild(counter);
  right.appendChild(evHead);

  var evList = makeEl("ol", "case-evidence");
  var opened = 0;
  function updateCounter() {
    counter.textContent = "Examined " + opened + " of " + c.evidence.length;
  }
  c.evidence.forEach(function (ev, i) {
    var li = makeEl("li", "evidence");
    var toggle = makeEl("button", "evidence-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    var bodyId = "ev-" + c.caseNumber + "-" + i;
    toggle.setAttribute("aria-controls", bodyId);
    toggle.appendChild(makeEl("span", "evidence-no", "Evidence " + (i + 1)));
    toggle.appendChild(makeEl("span", "evidence-label", ev.label));
    toggle.appendChild(makeEl("span", "evidence-action", "Examine"));
    var body = makeEl("div", "evidence-body");
    body.id = bodyId;
    body.hidden = true;
    var evText = makeEl("p", "");
    evText.appendChild(makeTag("verified"));
    evText.appendChild(document.createTextNode(" " + ev.text));
    body.appendChild(evText);
    var src = makeEl("p", "evidence-source", "Source: ");
    if (isWebLink(ev.sourceUrl)) src.appendChild(makeLink(ev.sourceUrl, ev.sourceName + " ↗"));
    else src.appendChild(document.createTextNode(showValue(ev.sourceName)));
    body.appendChild(src);
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      body.hidden = open;
      if (!open && !li.classList.contains("seen")) {
        li.classList.add("seen");
        opened++;
        updateCounter();
      }
      toggle.querySelector(".evidence-action").textContent = open ? "Examine" : "Close";
    });
    li.appendChild(toggle);
    li.appendChild(body);
    evList.appendChild(li);
  });
  updateCounter();
  right.appendChild(evList);

  // The question
  var form = makeEl("form", "case-question");
  var fs = makeEl("fieldset");
  fs.appendChild(makeEl("legend", "", "Your conclusion: " + c.question));
  c.options.forEach(function (opt, i) {
    var id = "q-" + c.caseNumber + "-" + i;
    var row = makeEl("div", "case-option");
    var input = makeEl("input");
    input.type = "radio";
    input.name = "q-" + c.caseNumber;
    input.id = id;
    input.value = opt;
    var lab = makeEl("label", "", opt);
    lab.htmlFor = id;
    row.appendChild(input);
    row.appendChild(lab);
    fs.appendChild(row);
  });
  form.appendChild(fs);
  var submit = makeEl("button", "btn btn-primary case-submit", "Submit conclusion");
  submit.type = "submit";
  submit.disabled = true;
  form.appendChild(submit);
  form.addEventListener("change", function () { submit.disabled = false; });

  var verdict = makeEl("div", "case-verdict");
  verdict.hidden = true;
  verdict.setAttribute("aria-live", "polite");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var chosen = form.querySelector("input:checked");
    if (!chosen) return;
    var correct = chosen.value === c.answer;
    form.querySelectorAll("input").forEach(function (inp) {
      inp.disabled = true;
      var row = inp.parentNode;
      if (inp.value === c.answer) row.classList.add("is-answer");
      else if (inp === chosen) row.classList.add("is-wrong");
    });
    submit.hidden = true;
    showVerdict(verdict, c, item, correct, index);
  });
  right.appendChild(form);
  right.appendChild(verdict);

  grid.appendChild(right);
  view.appendChild(grid);

  document.getElementById("case-shelf").hidden = true;
  // Focus first, then scroll: focusing during a smooth scroll cancels it in Chrome.
  title.focus({ preventScroll: true });
  if (scroll !== false) scrollToElement(view);
}

// Scrolls so the element sits just below the sticky header.
function scrollToElement(el) {
  var header = document.querySelector(".site-header");
  var offset = (header ? header.offsetHeight : 0) + 12;
  var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
  top = Math.max(0, top);
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var start = window.pageYOffset;
  window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
  // Safety net: if smooth scrolling did not run (e.g. a background tab), jump there directly.
  setTimeout(function () {
    if (Math.abs(window.pageYOffset - start) < 2 && Math.abs(top - start) > 2) {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, top);
      document.documentElement.style.scrollBehavior = "";
    }
  }, 700);
}

function showVerdict(verdict, c, item, correct, index) {
  verdict.innerHTML = "";
  verdict.hidden = false;
  verdict.className = "case-verdict " + (correct ? "is-correct" : "is-incorrect");
  verdict.appendChild(makeEl("p", "case-closed", correct ? "Case closed · Solved" : "Case closed · Here is what the evidence shows"));
  verdict.appendChild(makeEl("p", "case-answer", (correct ? "✓ Correct: " : "✗ The answer: ") + c.answer + "."));
  var expl = makeEl("p", "");
  expl.appendChild(makeTag("verified"));
  expl.appendChild(document.createTextNode(" " + c.explanation));
  verdict.appendChild(expl);
  if (Array.isArray(c.explanationSources) && c.explanationSources.length) {
    var src = makeEl("p", "evidence-source", "Sources: ");
    c.explanationSources.forEach(function (s, i) {
      if (i) src.appendChild(document.createTextNode(" · "));
      src.appendChild(makeLink(s.url, s.name + " ↗"));
    });
    verdict.appendChild(src);
  }
  // Interpretation: why it matters (clearly marked as our reasoning, not a NASA statement)
  if (!isMissing(c.significance)) {
    var sig = makeEl("div", "case-significance");
    var h = makeEl("h4", "", "Why it matters ");
    h.appendChild(makeTag("interpretation"));
    sig.appendChild(h);
    sig.appendChild(makeEl("p", "", c.significance));
    verdict.appendChild(sig);
  }
  var actions = makeEl("div", "case-actions");
  var story = makeEl("button", "btn btn-ghost", "Read the full story");
  story.type = "button";
  story.addEventListener("click", function () { openStory(item, story); });
  actions.appendChild(story);
  if (caseFiles.length > 1) {
    var next = caseFiles[(index + 1) % caseFiles.length];
    var nb = makeEl("button", "btn btn-primary", "Next case: " + next.caseNumber + " →");
    nb.type = "button";
    nb.addEventListener("click", function () { openCase((index + 1) % caseFiles.length); });
    actions.appendChild(nb);
  }
  verdict.appendChild(actions);
}

function closeCase() {
  var view = document.getElementById("case-view");
  view.hidden = true;
  view.innerHTML = "";
  var shelf = document.getElementById("case-shelf");
  shelf.hidden = false;
  var first = shelf.querySelector("button");
  if (first) first.focus({ preventScroll: true });
  scrollToElement(document.getElementById("cases"));
}

// ---------- Mission Control Decision Room ----------

function renderDecision(objects, d) {
  var box = document.getElementById("decision-box");
  if (!box) return;
  box.innerHTML = "";
  if (!d || !Array.isArray(d.choices) || d.choices.length === 0) {
    box.appendChild(makeEl("p", "no-results", "The decision room is not available right now."));
    return;
  }

  var banner = makeEl("p", "decision-disclaimer");
  banner.appendChild(makeTag("hypothetical"));
  banner.appendChild(makeEl("strong", "", " Hypothetical scenario. "));
  banner.appendChild(document.createTextNode(d.disclaimer));
  box.appendChild(banner);

  var brief = makeEl("div", "decision-brief");
  var thumbs = makeEl("div", "decision-thumbs");
  (d.objectIds || []).forEach(function (id) {
    var o = findObject(id);
    if (!o) return;
    var t = makeEl("button", "decision-thumb");
    t.type = "button";
    t.setAttribute("aria-label", "Open the story of " + o.name);
    addImage(t, o, "");
    t.appendChild(makeEl("span", "", o.name));
    t.addEventListener("click", function () { openStory(o, t); });
    thumbs.appendChild(t);
  });
  brief.appendChild(thumbs);
  var text = makeEl("div", "decision-text");
  text.appendChild(makeEl("p", "decision-label", "Mission briefing"));
  text.appendChild(makeEl("p", "decision-scenario", d.scenario));
  brief.appendChild(text);
  box.appendChild(brief);

  var group = makeEl("div", "decision-choices");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Your decision");
  var result = makeEl("div", "decision-result");
  result.hidden = true;
  result.setAttribute("aria-live", "polite");

  d.choices.forEach(function (ch, i) {
    var b = makeEl("button", "decision-choice");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.appendChild(makeEl("span", "decision-letter", String.fromCharCode(65 + i)));
    b.appendChild(makeEl("span", "", ch.label));
    b.addEventListener("click", function () {
      group.querySelectorAll(".decision-choice").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      showDecision(result, d, ch);
    });
    group.appendChild(b);
  });
  box.appendChild(group);
  box.appendChild(result);
}

function showDecision(result, d, ch) {
  result.hidden = false;
  result.innerHTML = "";
  result.appendChild(makeEl("p", "decision-label", "Your decision: " + ch.label));
  var grid = makeEl("div", "decision-tradeoffs");
  [["What you gain", ch.gains, "is-gain"], ["What it costs", ch.costs, "is-cost"]].forEach(function (t) {
    var box = makeEl("div", "tradeoff " + t[2]);
    var h = makeEl("h4", "", t[0] + " ");
    h.appendChild(makeTag("verified"));
    box.appendChild(h);
    box.appendChild(makeEl("p", "", t[1]));
    grid.appendChild(box);
  });
  result.appendChild(grid);
  var v = makeEl("p", "decision-verdict");
  v.appendChild(makeTag("interpretation"));
  v.appendChild(document.createTextNode(" " + ch.verdict));
  result.appendChild(v);
  if (!isMissing(d.reflection)) {
    var refl = makeEl("p", "decision-closing");
    refl.appendChild(makeTag("interpretation"));
    refl.appendChild(document.createTextNode(" " + d.reflection));
    result.appendChild(refl);
  }
  var closing = makeEl("p", "decision-closing");
  closing.appendChild(makeTag("verified"));
  closing.appendChild(document.createTextNode(" " + d.closing));
  result.appendChild(closing);
  var src = makeEl("p", "evidence-source", "Sources: ");
  (d.sources || []).forEach(function (s, i) {
    if (i) src.appendChild(document.createTextNode(" · "));
    src.appendChild(makeLink(s.url, s.name + " ↗"));
  });
  result.appendChild(src);
  result.appendChild(makeEl("p", "decision-hint", "Try another option to compare the trade-offs."));
}
