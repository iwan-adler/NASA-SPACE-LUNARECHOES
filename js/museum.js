// Lunar Echoes - Virtual Planetary Museum
// A museum browsing mode: the Moon Hall and the Mars Hall, one exhibit at a time, with a large NASA photo,
// a technical placard, the mission story and its scientific legacy. Optional narration uses the
// browser's built-in speech synthesis (free, offline, no external service); nothing is recorded.
// All text comes from data/objects.json. Helpers from js/objects.js.

var museumState = { hall: "Moon", index: 0, speaking: false };

function renderMuseum(objects) {
  var box = document.getElementById("museum-box");
  if (!box) return;
  box.innerHTML = "";
  box.removeAttribute("aria-busy");
  var doors = makeEl("div", "mu-doors");
  ["Moon", "Mars"].forEach(function (hall) {
    var items = objects.filter(function (o) { return o.planet === hall; });
    if (!items.length) return;
    var b = makeEl("button", "mu-door is-" + hall.toLowerCase());
    b.type = "button";
    var img = makeEl("span", "mu-door-img");
    var cover = items.filter(function (o) { return !isMissing(o.image); })[0];
    if (cover) img.style.backgroundImage = "url('" + localImagePath(cover.image) + "')";
    b.appendChild(img);
    var t = makeEl("span", "mu-door-text");
    t.appendChild(makeEl("span", "mu-door-kicker", items.length + " exhibits · " + items[0].year + "–" + items[items.length - 1].year));
    t.appendChild(makeEl("span", "mu-door-title", "The " + hall + " Hall"));
    t.appendChild(makeEl("span", "mu-door-go", "Enter the gallery →"));
    b.appendChild(t);
    b.addEventListener("click", function () { openMuseum(hall, 0, b); });
    doors.appendChild(b);
  });
  box.appendChild(doors);
  var note = makeEl("p", "mu-note", "Use ← and → to walk between exhibits. Narration is optional and is read aloud by your own browser's voice.");
  box.appendChild(note);
}

function museumItems(hall) {
  return allObjects.filter(function (o) { return o.planet === hall; })
    .sort(function (a, b) { return Number(a.year) - Number(b.year); });
}

function buildMuseumDialog() {
  var d = makeEl("dialog", "mu-dialog");
  d.id = "museum-dialog";
  d.setAttribute("aria-labelledby", "mu-title");
  d.addEventListener("close", function () {
    museumStop();
    if (museumState.opener && museumState.opener.focus) museumState.opener.focus();
  });
  d.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("a, input, textarea")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); museumGo(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); museumGo(-1); }
  });
  document.body.appendChild(d);
  return d;
}

function openMuseum(hall, index, opener) {
  museumState.hall = hall;
  museumState.index = index || 0;
  museumState.opener = opener;
  var d = document.getElementById("museum-dialog") || buildMuseumDialog();
  drawExhibit();
  if (!d.open) d.showModal();
  var t = document.getElementById("mu-title");
  if (t) t.focus();
}

function museumGo(step) {
  var n = museumItems(museumState.hall).length;
  museumState.index = (museumState.index + step + n) % n;
  museumStop();
  drawExhibit();
  var t = document.getElementById("mu-title");
  if (t) t.focus();
}

function drawExhibit() {
  var d = document.getElementById("museum-dialog");
  var items = museumItems(museumState.hall);
  var o = items[museumState.index];
  d.innerHTML = "";
  d.className = "mu-dialog is-" + museumState.hall.toLowerCase();

  var bar = makeEl("div", "mu-bar");
  var halls = makeEl("div", "mu-halls");
  halls.setAttribute("role", "group");
  halls.setAttribute("aria-label", "Choose a hall");
  ["Moon", "Mars"].forEach(function (h) {
    var b = makeEl("button", "mu-hall-btn", h + " Hall");
    b.type = "button";
    b.setAttribute("aria-pressed", h === museumState.hall ? "true" : "false");
    b.addEventListener("click", function () { museumState.hall = h; museumState.index = 0; museumStop(); drawExhibit(); });
    halls.appendChild(b);
  });
  bar.appendChild(halls);
  bar.appendChild(makeEl("p", "mu-count", "Exhibit " + (museumState.index + 1) + " of " + items.length));
  var close = makeEl("button", "mu-close", "Leave the museum ✕");
  close.type = "button";
  close.addEventListener("click", function () { d.close(); });
  bar.appendChild(close);
  d.appendChild(bar);

  var stage = makeEl("div", "mu-stage");
  var fig = makeEl("figure", "mu-figure");
  addImage(fig, o, "mu-image");
  var cap = makeEl("figcaption", "", "Photo: " + showValue(o.imageCredit) + " ");
  if (isWebLink(o.imagePage)) cap.appendChild(makeLink(o.imagePage, "(NASA record ↗)"));
  fig.appendChild(cap);
  stage.appendChild(fig);

  var placard = makeEl("article", "mu-placard");
  placard.appendChild(makeEl("p", "mu-kicker", showValue(o.mission) + " · " + showValue(o.year)));
  var h = makeEl("h2", "mu-title", o.name);
  h.id = "mu-title";
  h.tabIndex = -1;
  placard.appendChild(h);
  placard.appendChild(makeBadges(o));

  var listen = makeEl("button", "btn btn-ghost mu-listen", "▶ Listen to this exhibit");
  listen.type = "button";
  if (!("speechSynthesis" in window)) { listen.disabled = true; listen.textContent = "Narration not supported in this browser"; }
  listen.addEventListener("click", function () {
    if (museumState.speaking) { museumStop(); return; }
    museumSpeak(o, listen);
  });
  placard.appendChild(listen);

  var tech = makeEl("dl", "mu-tech");
  [["Type", o.category], ["Resting place", o.site], ["Coordinates", formatLocation(o) || "Not documented in our sources"],
   ["NSSDCA record", o.nssdcId], ["Status", o.status]].forEach(function (r) {
    tech.appendChild(makeEl("dt", "", r[0]));
    var dd = makeEl("dd", "");
    if (r[0] === "NSSDCA record" && isWebLink(o.source) && /nssdc/.test(o.source)) dd.appendChild(makeLink(o.source, showValue(r[1]) + " ↗"));
    else dd.textContent = showValue(r[1]);
    tech.appendChild(dd);
  });
  var techBox = makeEl("div", "mu-section");
  var th = makeEl("h3", "", "Technical record ");
  th.appendChild(makeTag("verified"));
  techBox.appendChild(th);
  techBox.appendChild(tech);
  placard.appendChild(techBox);

  [["The mission story", o.story], ["Scientific legacy", [o.science, o.legacy].filter(function (x) { return !isMissing(x); }).join(" ")]].forEach(function (s) {
    var sec = makeEl("div", "mu-section");
    var hh = makeEl("h3", "", s[0] + " ");
    hh.appendChild(makeTag("verified"));
    sec.appendChild(hh);
    sec.appendChild(makeEl("p", "", showValue(s[1])));
    placard.appendChild(sec);
  });

  var acts = makeEl("div", "mu-actions");
  var story = makeEl("button", "btn btn-primary", "Open the full passport");
  story.type = "button";
  story.addEventListener("click", function () { d.close(); openStory(o); });
  acts.appendChild(story);
  placard.appendChild(acts);
  stage.appendChild(placard);
  d.appendChild(stage);

  var nav = makeEl("div", "mu-nav");
  var prev = items[(museumState.index - 1 + items.length) % items.length];
  var next = items[(museumState.index + 1) % items.length];
  var pb = makeEl("button", "mu-arrow", "← " + prev.name);
  pb.type = "button";
  pb.addEventListener("click", function () { museumGo(-1); });
  var nb = makeEl("button", "mu-arrow", next.name + " →");
  nb.type = "button";
  nb.addEventListener("click", function () { museumGo(1); });
  nav.appendChild(pb);
  var dots = makeEl("div", "mu-dots");
  dots.setAttribute("aria-hidden", "true");
  items.forEach(function (x, i) { dots.appendChild(makeEl("span", i === museumState.index ? "is-on" : "")); });
  nav.appendChild(dots);
  nav.appendChild(nb);
  d.appendChild(nav);
}

function museumSpeak(o, btn) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  var text = [o.name + ".", showValue(o.mission) + ", " + showValue(o.year) + ".", o.story, o.science, o.legacy, "Today: " + o.status]
    .filter(function (x) { return !isMissing(x); }).join(" ");
  var u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.onend = u.onerror = function () { museumState.speaking = false; if (btn) btn.textContent = "▶ Listen to this exhibit"; };
  museumState.speaking = true;
  btn.textContent = "■ Stop narration";
  window.speechSynthesis.speak(u);
}

function museumStop() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  museumState.speaking = false;
  var b = document.querySelector(".mu-listen");
  if (b && !b.disabled) b.textContent = "▶ Listen to this exhibit";
}
