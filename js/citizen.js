// Lunar Echoes - "Beyond the Archive": real NASA citizen-science projects (MoonDiff, Cloudspotting on Mars)
// with two small practice demos. The demos are educational only: nothing is ever sent anywhere.
// Content comes from data/citizen-science.json; helpers (makeEl, makeLink, makeTag, addImageUrl,
// openStoryById...) come from js/objects.js.

// Called from main.js. `data` may be null if data/citizen-science.json failed to load.
function renderCitizenScience(data) {
  var box = document.getElementById("beyond-box");
  if (!box) return;
  box.innerHTML = "";
  if (!data || !Array.isArray(data.projects)) {
    box.appendChild(makeEl("p", "no-results", "This section is not available right now."));
    return;
  }

  if (!isMissing(data.intro)) box.appendChild(makeEl("p", "beyond-intro", data.intro));

  // How citizen science works
  if (Array.isArray(data.steps) && data.steps.length) {
    var how = makeEl("div", "beyond-how");
    how.appendChild(makeEl("h3", "beyond-subtitle", "How citizen science works"));
    var ol = makeEl("ol", "beyond-steps");
    data.steps.forEach(function (s) {
      var li = makeEl("li", "beyond-step");
      li.appendChild(makeEl("strong", "", s.title));
      li.appendChild(makeEl("span", "", s.text));
      ol.appendChild(li);
    });
    how.appendChild(ol);
    how.appendChild(sourcesLine("Sources: ", data.stepsSources));
    box.appendChild(how);
  }

  data.projects.forEach(function (p) {
    box.appendChild(makeProject(p));
  });

  if (!isMissing(data.disclaimer)) {
    var note = makeEl("p", "beyond-disclaimer");
    note.appendChild(makeEl("strong", "", "Independent project. "));
    note.appendChild(document.createTextNode(data.disclaimer));
    box.appendChild(note);
  }
}

function sourcesLine(prefix, sources) {
  var p = makeEl("p", "evidence-source", prefix);
  (sources || []).forEach(function (s, i) {
    if (!isWebLink(s.url)) return;
    if (i) p.appendChild(document.createTextNode(" · "));
    p.appendChild(makeLink(s.url, s.name + " ↗"));
  });
  return p;
}

// One project: introduction card + connection to our archive + practice demo + official link
function makeProject(p) {
  var world = String(p.world || "").toLowerCase();
  var art = makeEl("article", "beyond-project planet-" + world);
  art.setAttribute("aria-labelledby", "beyond-" + p.id);

  var head = makeEl("header", "beyond-head");
  head.appendChild(makeEl("span", "planet-badge", p.world));
  var h = makeEl("h3", "beyond-name", p.name);
  h.id = "beyond-" + p.id;
  head.appendChild(h);
  head.appendChild(makeEl("p", "beyond-tagline", p.tagline));
  art.appendChild(head);

  var grid = makeEl("div", "beyond-grid");

  // Left column: what it is, why it matters, connection, join
  var info = makeEl("div", "beyond-info");
  [["What you do", p.what], ["Why it matters", p.why]].forEach(function (pair) {
    var t = makeEl("h4", "", pair[0] + " ");
    t.appendChild(makeTag("verified"));
    info.appendChild(t);
    info.appendChild(makeEl("p", "", pair[1]));
  });
  info.appendChild(sourcesLine("Source: ", [{ name: p.infoName, url: p.infoUrl }]));

  if (p.connection) {
    var link = makeEl("div", "beyond-connection");
    link.appendChild(makeEl("h4", "", "Connection to our archive"));
    link.appendChild(makeEl("p", "", p.connection.text));
    if (p.connection.objectId && findObject(p.connection.objectId)) {
      var ob = makeEl("button", "btn btn-ghost", p.connection.buttonLabel);
      ob.type = "button";
      ob.addEventListener("click", function () { openStoryById(p.connection.objectId, ob); });
      link.appendChild(ob);
    }
    info.appendChild(link);
  }

  var join = makeEl("a", "btn btn-primary beyond-join", p.joinLabel + " ↗");
  join.href = p.joinUrl;
  join.target = "_blank";
  join.rel = "noopener noreferrer";
  join.setAttribute("aria-label", p.joinLabel + " (opens the official project website in a new tab)");
  info.appendChild(join);
  info.appendChild(makeEl("p", "beyond-join-note", "Participation happens on the official project website."));
  grid.appendChild(info);

  // Right column: practice demo
  var demo = makeEl("div", "beyond-demo");
  if (p.demo && p.demo.kind === "find") buildFindDemo(demo, p.demo);
  if (p.demo && p.demo.kind === "clouds") buildCloudDemo(demo, p.demo);
  grid.appendChild(demo);

  art.appendChild(grid);
  return art;
}

function demoHeader(parent, d) {
  parent.appendChild(makeEl("h4", "demo-title", d.title));
  var label = makeEl("p", "demo-label");
  label.appendChild(makeEl("span", "demo-flag", "Practice"));
  label.appendChild(document.createTextNode(" " + d.label));
  parent.appendChild(label);
}

function demoCredit(d) {
  var c = makeEl("p", "tn-credit", "Image: " + d.credit + " ");
  if (isWebLink(d.imagePage)) c.appendChild(makeLink(d.imagePage, "(source ↗)"));
  return c;
}

// ---------- MoonDiff practice: find the human-made crater ----------
function buildFindDemo(parent, d) {
  demoHeader(parent, d);
  parent.appendChild(makeEl("p", "demo-prompt", d.prompt));

  var stage = makeEl("div", "find-stage");
  var btn = makeEl("button", "find-image-btn");
  btn.type = "button";
  btn.setAttribute("aria-label", "Image to search: click where you think the crater is, or press Enter to choose a region. " + d.alt);
  addImageUrl(btn, d.image, d.alt, "find-image"); // local copy first, then NASA
  stage.appendChild(btn);
  var guess = makeEl("span", "find-marker is-guess");
  guess.hidden = true;
  guess.setAttribute("aria-hidden", "true");
  var answer = makeEl("span", "find-marker is-answer");
  answer.hidden = true;
  answer.setAttribute("aria-hidden", "true");
  answer.style.left = d.target.x + "%";
  answer.style.top = d.target.y + "%";
  stage.appendChild(guess);
  stage.appendChild(answer);
  parent.appendChild(stage);
  parent.appendChild(demoCredit(d));

  var result = makeEl("div", "demo-result");
  result.setAttribute("aria-live", "polite");

  var controls = makeEl("div", "demo-controls");
  var hintBtn = makeEl("button", "btn btn-ghost", "Hint");
  hintBtn.type = "button";
  hintBtn.addEventListener("click", function () {
    result.innerHTML = "";
    result.appendChild(makeEl("p", "", "Hint: " + d.hint));
  });
  var revealBtn = makeEl("button", "btn btn-ghost", "Show me");
  revealBtn.type = "button";
  revealBtn.addEventListener("click", function () { finish(false, true); });
  var retry = makeEl("button", "btn btn-ghost", "Try again");
  retry.type = "button";
  retry.hidden = true;
  retry.addEventListener("click", function () {
    guess.hidden = true;
    answer.hidden = true;
    result.innerHTML = "";
    retry.hidden = true;
    regions.hidden = true;
    done = false;
  });
  controls.appendChild(hintBtn);
  controls.appendChild(revealBtn);
  controls.appendChild(retry);
  parent.appendChild(controls);
  parent.appendChild(result);

  var done = false;
  function finish(found, revealed) {
    done = true;
    answer.hidden = false;
    retry.hidden = false;
    result.innerHTML = "";
    var head = makeEl("p", "demo-verdict " + (found ? "is-correct" : "is-incorrect"),
      revealed ? "Here it is: the crater with bright rays near the centre." : (found ? "✓ " + d.found : "✗ " + d.missed));
    result.appendChild(head);
    var story = makeEl("p", "");
    story.appendChild(makeTag("verified"));
    story.appendChild(document.createTextNode(" " + d.story));
    result.appendChild(story);
    result.appendChild(sourcesLine("Source: ", [{ name: d.storySourceName, url: d.storySourceUrl }]));
    if (d.storyObjectId && findObject(d.storyObjectId)) {
      var b = makeEl("button", "btn btn-ghost", d.storyButton);
      b.type = "button";
      b.addEventListener("click", function () { openStoryById(d.storyObjectId, b); });
      result.appendChild(b);
    }
  }

  // `byRegion` = chosen from the 3x3 region buttons: correct if the target lies inside that region
  function place(xPct, yPct, byRegion) {
    if (done) return;
    guess.style.left = xPct + "%";
    guess.style.top = yPct + "%";
    guess.hidden = false;
    var found;
    if (byRegion) {
      found = Math.abs(d.target.x - xPct) <= 16.67 && Math.abs(d.target.y - yPct) <= 16.67;
    } else {
      var dx = xPct - d.target.x;
      var dy = (yPct - d.target.y) * (stage.offsetHeight / stage.offsetWidth || 1);
      found = Math.sqrt(dx * dx + dy * dy) <= d.target.radius;
    }
    finish(found, false);
  }

  // Keyboard users choose one of nine regions instead of a pointer position
  var regions = makeEl("div", "find-regions");
  regions.hidden = true;
  regions.setAttribute("role", "group");
  regions.setAttribute("aria-label", "Choose the region of the image where you think the crater is");
  var rows = ["Top", "Middle", "Bottom"];
  var cols = ["left", "centre", "right"];
  rows.forEach(function (row, ri) {
    cols.forEach(function (col, ci) {
      var rb = makeEl("button", "find-region", row + " " + col);
      rb.type = "button";
      rb.addEventListener("click", function () {
        regions.hidden = true;
        place(ci * 33.33 + 16.67, ri * 33.33 + 16.67, true);
      });
      regions.appendChild(rb);
    });
  });
  parent.insertBefore(regions, controls);

  btn.addEventListener("click", function (e) {
    if (e.detail === 0) {
      // Activated with the keyboard: there is no pointer position, so offer the region buttons
      regions.hidden = false;
      regions.querySelector("button").focus();
      return;
    }
    var r = btn.getBoundingClientRect();
    place((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
  });
}

// ---------- Cloudspotting practice: learn the cloud types, then read a MAVEN image ----------
function buildCloudDemo(parent, d) {
  demoHeader(parent, d);

  var fig = makeEl("figure", "cloud-figure");
  addImageUrl(fig, d.image, d.alt, "cloud-image"); // local copy first, then NASA
  var cap = makeEl("figcaption");
  var capText = makeEl("span", "tn-caption");
  capText.appendChild(makeTag("verified"));
  capText.appendChild(document.createTextNode(" " + d.caption));
  cap.appendChild(capText);
  cap.appendChild(demoCredit(d));
  fig.appendChild(cap);
  parent.appendChild(fig);

  // Step 1: cloud types (tabs-like buttons)
  parent.appendChild(makeEl("p", "demo-step", "1. Learn the cloud shapes volunteers look for"));
  var chips = makeEl("div", "cloud-chips");
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Cloud types");
  var typeText = makeEl("p", "cloud-type-text");
  typeText.setAttribute("aria-live", "polite");
  d.types.forEach(function (t, i) {
    var c = makeEl("button", "cloud-chip", t.name);
    c.type = "button";
    c.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    c.addEventListener("click", function () {
      chips.querySelectorAll(".cloud-chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      c.setAttribute("aria-pressed", "true");
      typeText.textContent = t.text;
    });
    chips.appendChild(c);
  });
  typeText.textContent = d.types[0].text;
  parent.appendChild(chips);
  parent.appendChild(typeText);
  parent.appendChild(sourcesLine("Source: ", [{ name: d.typesSourceName, url: d.typesSourceUrl }]));

  // Step 2: read the image (questions answered from NASA's caption and the field guide)
  parent.appendChild(makeEl("p", "demo-step", "2. Read the image"));
  var qBox = makeEl("div", "cloud-quiz");
  var score = 0;
  var qi = 0;
  function showQ() {
    qBox.innerHTML = "";
    if (qi >= d.questions.length) {
      qBox.appendChild(makeEl("p", "demo-verdict is-correct",
        "Practice complete: " + score + " of " + d.questions.length + ". Ready for real MAVEN images? Join the official project."));
      var again = makeEl("button", "btn btn-ghost", "Practise again");
      again.type = "button";
      again.addEventListener("click", function () { qi = 0; score = 0; showQ(); });
      qBox.appendChild(again);
      return;
    }
    var q = d.questions[qi];
    qBox.appendChild(makeEl("p", "cloud-q", "Question " + (qi + 1) + " of " + d.questions.length + ": " + q.q));
    var opts = makeEl("div", "cloud-options");
    var fb = makeEl("p", "cloud-feedback");
    fb.setAttribute("aria-live", "polite");
    q.options.forEach(function (o) {
      var b = makeEl("button", "quiz-option", o);
      b.type = "button";
      b.addEventListener("click", function () {
        var ok = o === q.answer;
        if (ok) score++;
        opts.querySelectorAll("button").forEach(function (x) {
          x.disabled = true;
          if (x.textContent === q.answer) { x.classList.add("correct"); x.textContent = "✓ " + x.textContent; }
        });
        if (!ok) { b.classList.add("wrong"); b.textContent = "✗ " + b.textContent; }
        fb.textContent = (ok ? "Correct. " : "Not quite. ") + q.explain;
        var next = makeEl("button", "quiz-next", qi === d.questions.length - 1 ? "Finish" : "Next");
        next.type = "button";
        next.addEventListener("click", function () { qi++; showQ(); });
        qBox.appendChild(next);
        next.focus();
      });
      opts.appendChild(b);
    });
    qBox.appendChild(opts);
    qBox.appendChild(fb);
  }
  showQ();
  parent.appendChild(qBox);
}
