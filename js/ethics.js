// Lunar Echoes - The Ethics of Exploration
// Hypothetical decision scenarios with consequences from four perspectives. No score, no "right answer".
// Every consequence is labelled Verified (NASA source linked) or Interpretation.
// Data: data/ethics.json. Reuses the Future Explorer styles (decision-*) plus css/journey.css additions.

var ethState = { data: null, index: 0, picks: {} };

function renderEthics(data) {
  var box = document.getElementById("ethics-box");
  if (!box) return;
  box.removeAttribute("aria-busy");
  box.innerHTML = "";
  if (!data || !Array.isArray(data.scenarios) || !data.scenarios.length) {
    box.appendChild(makeEl("p", "no-results", "The ethics scenarios are not available right now."));
    return;
  }
  ethState.data = data;

  var banner = makeEl("p", "decision-disclaimer");
  banner.appendChild(makeTag("hypothetical"));
  banner.appendChild(makeEl("strong", "", " Educational simulation. "));
  banner.appendChild(document.createTextNode(data.disclaimer));
  box.appendChild(banner);

  var tabs = makeEl("div", "eth-tabs");
  tabs.setAttribute("role", "group");
  tabs.setAttribute("aria-label", "Choose a dilemma");
  data.scenarios.forEach(function (sc, i) {
    var b = makeEl("button", "eth-tab");
    b.type = "button";
    b.setAttribute("data-i", String(i));
    b.appendChild(makeEl("span", "eth-tab-theme", sc.theme));
    b.appendChild(makeEl("span", "eth-tab-title", sc.title));
    b.addEventListener("click", function () { ethState.index = i; drawEthics(true); });
    tabs.appendChild(b);
  });
  box.appendChild(tabs);
  box.appendChild(makeEl("div", "eth-stage"));
  box.appendChild(makeEl("div", "eth-summary"));
  drawEthics(false);
}

function drawEthics(focus) {
  var d = ethState.data, sc = d.scenarios[ethState.index];
  document.querySelectorAll(".eth-tab").forEach(function (b) {
    var i = Number(b.getAttribute("data-i"));
    b.setAttribute("aria-pressed", i === ethState.index ? "true" : "false");
    b.classList.toggle("is-decided", ethState.picks[d.scenarios[i].id] != null);
  });

  var stage = document.querySelector(".eth-stage");
  stage.innerHTML = "";
  var brief = makeEl("div", "decision-brief eth-brief");
  var o = findObject(sc.objectId);
  if (o) {
    var t = makeEl("button", "decision-thumb");
    t.type = "button";
    t.setAttribute("aria-label", "Open the story of " + o.name);
    addImage(t, o, "");
    t.appendChild(makeEl("span", "", o.name));
    t.addEventListener("click", function () { openStory(o, t); });
    var thumbs = makeEl("div", "decision-thumbs");
    thumbs.appendChild(t);
    brief.appendChild(thumbs);
  }
  var text = makeEl("div", "decision-text");
  text.appendChild(makeEl("p", "decision-label", sc.theme));
  var h = makeEl("h3", "eth-title", sc.title);
  h.tabIndex = -1;
  text.appendChild(h);
  text.appendChild(makeEl("p", "decision-scenario", sc.setup));
  brief.appendChild(text);
  stage.appendChild(brief);

  var group = makeEl("div", "decision-choices");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Your decision");
  var result = makeEl("div", "decision-result");
  result.setAttribute("aria-live", "polite");
  result.hidden = true;
  sc.choices.forEach(function (ch, i) {
    var b = makeEl("button", "decision-choice");
    b.type = "button";
    b.setAttribute("aria-pressed", ethState.picks[sc.id] === i ? "true" : "false");
    b.appendChild(makeEl("span", "decision-letter", String.fromCharCode(65 + i)));
    b.appendChild(makeEl("span", "", ch.label));
    b.addEventListener("click", function () {
      ethState.picks[sc.id] = i;
      group.querySelectorAll(".decision-choice").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      showEthicsResult(result, sc, ch);
      drawEthicsSummary();
      document.querySelectorAll(".eth-tab")[ethState.index].classList.add("is-decided");
    });
    group.appendChild(b);
  });
  stage.appendChild(group);
  stage.appendChild(result);
  if (ethState.picks[sc.id] != null) showEthicsResult(result, sc, sc.choices[ethState.picks[sc.id]]);
  drawEthicsSummary();
  if (focus) h.focus({ preventScroll: true });
}

function ethLine(c) {
  var p = makeEl("p", "eth-line");
  p.appendChild(makeTag(c.k === "verified" ? "verified" : "interpretation"));
  p.appendChild(document.createTextNode(" " + c.t + " "));
  var src = c.s && ethState.data.sources[c.s];
  if (src) p.appendChild(makeLink(src.url, src.name + " ↗"));
  return p;
}

function showEthicsResult(result, sc, ch) {
  result.hidden = false;
  result.innerHTML = "";
  result.appendChild(makeEl("p", "decision-label", "Your decision: " + ch.label));
  var grid = makeEl("div", "eth-grid");
  ethState.data.perspectives.forEach(function (p) {
    var lines = ch.consequences[p] || [];
    var box = makeEl("div", "eth-persp");
    box.appendChild(makeEl("h4", "", p));
    lines.forEach(function (c) { box.appendChild(ethLine(c)); });
    grid.appendChild(box);
  });
  result.appendChild(grid);
  if (sc.note) {
    var n = ethLine(sc.note);
    n.classList.add("eth-note");
    result.appendChild(n);
  }
  result.appendChild(makeEl("p", "decision-hint", "No score: try the other options and compare what each one gains and costs."));
}

function drawEthicsSummary() {
  var d = ethState.data;
  var box = document.querySelector(".eth-summary");
  box.innerHTML = "";
  var done = d.scenarios.filter(function (sc) { return ethState.picks[sc.id] != null; });
  if (!done.length) return;
  box.appendChild(makeEl("h3", "", "Your stewardship choices so far"));
  var ul = makeEl("ul", "");
  done.forEach(function (sc) {
    ul.appendChild(makeEl("li", "", sc.title + " → " + sc.choices[ethState.picks[sc.id]].label));
  });
  box.appendChild(ul);
  if (done.length === d.scenarios.length) box.appendChild(makeEl("p", "eth-closing", d.closing));
  else box.appendChild(makeEl("p", "eth-closing", (d.scenarios.length - done.length) + " dilemma(s) left. Your choices are not saved or sent anywhere."));
}
