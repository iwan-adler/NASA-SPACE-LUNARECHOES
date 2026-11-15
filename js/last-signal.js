// Lunar Echoes - The Last Signal
// Follows each mission from launch to its last documented event, and what remained.
// Events come from data/objects.json (sourced); data/last-signal.json adds launch dates (NSSDCA)
// and marks the last documented event. No final messages are invented: where our sources do not
// record an actual final communication, the page says so.
// Uses helpers from js/objects.js (makeEl, makeTag, makeLink, addImage, formatDate, findObject, openStory…).

var SIGNAL_KINDS = {
  transmission: "Last transmission documented",
  contact: "Contact lost",
  commands: "Stopped responding to commands",
  shutdown: "Shut down from Earth",
  stopped: "Stopped working",
  left: "Left behind",
  ongoing: "Still in use"
};

var signalChannels = [];
var signalIndex = 0;

function renderLastSignal(objects, data) {
  var box = document.getElementById("signal-box");
  if (!box) return;
  box.innerHTML = "";
  box.removeAttribute("aria-busy");
  signalChannels = (data && Array.isArray(data.channels) ? data.channels : []).filter(function (c) {
    return !!findObject(c.id);
  });
  if (!signalChannels.length) {
    box.appendChild(makeEl("p", "no-results", "The mission histories are not available right now. Each object's story still has its mission journey."));
    return;
  }

  var layout = makeEl("div", "signal-layout");
  var nav = makeEl("div", "signal-channels");
  nav.setAttribute("role", "group");
  nav.setAttribute("aria-label", "Choose a mission channel");
  ["Moon", "Mars"].forEach(function (planet) {
    var group = signalChannels.filter(function (c) { return findObject(c.id).planet === planet; });
    if (!group.length) return;
    nav.appendChild(makeEl("p", "signal-group " + (planet === "Moon" ? "planet-moon" : "planet-mars"), planet));
    group.forEach(function (c) {
      var item = findObject(c.id);
      var i = signalChannels.indexOf(c);
      var b = makeEl("button", "signal-channel kind-" + c.signal.kind);
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("data-channel", String(i));
      b.appendChild(makeEl("span", "signal-led"));
      var t = makeEl("span", "signal-channel-text");
      t.appendChild(makeEl("span", "signal-channel-name", item.name));
      t.appendChild(makeEl("span", "signal-channel-sub", SIGNAL_KINDS[c.signal.kind] + " · " + signalDateOf(item, c, true)));
      b.appendChild(t);
      b.addEventListener("click", function () { showSignal(i, true); });
      nav.appendChild(b);
    });
  });
  layout.appendChild(nav);

  var panel = makeEl("article", "signal-panel");
  panel.id = "signal-panel";
  panel.setAttribute("aria-live", "polite");
  layout.appendChild(panel);
  box.appendChild(layout);

  showSignal(0, false);
}

// Opens the channel for an object id and scrolls to it (used by the heritage map).
function openSignalFor(id) {
  for (var i = 0; i < signalChannels.length; i++) {
    if (signalChannels[i].id === id) {
      showSignal(i, true);
      scrollToElement(document.getElementById("signal-box"));
      return true;
    }
  }
  return false;
}

// Builds the full, ordered event list for one channel, with a phase for each event.
function signalEvents(item, ch) {
  var list = [];
  if (ch.launch) list.push({ date: ch.launch.date, label: ch.launch.label, source: ch.launch.source });
  (item.events || []).forEach(function (e) { list.push({ date: e.date, label: e.label }); });
  // Stable sort by date. A month- or year-only date counts as the end of that period, so
  // "1969-07: ascent stage lifts off" comes after "1969-07-16: launch".
  list.sort(function (a, b) { return signalTime(a.date) - signalTime(b.date); });

  var signalAt = -1;
  if (ch.signal.match) {
    list.forEach(function (e, i) { if (signalAt < 0 && e.label.indexOf(ch.signal.match) !== -1) signalAt = i; });
  }
  var arrived = false;
  list.forEach(function (e, i) {
    if (i === signalAt) e.phase = "signal";
    else if (signalAt >= 0 && i > signalAt) e.phase = "after";
    else if (/^Launched|launches from Earth/i.test(e.label)) e.phase = "launch";
    else if (!arrived && /lands|arrives|enters orbit|set up/i.test(e.label)) e.phase = "arrival";
    else e.phase = "milestone";
    if (e.phase === "arrival" && /lands|arrives|set up/i.test(e.label)) arrived = true;
  });
  return { list: list, signalAt: signalAt };
}

function signalDateOf(item, ch, short) {
  if (ch.signal.kind === "ongoing") return "in use today";
  var ev = signalEvents(item, ch);
  var e = ev.list[ev.signalAt];
  if (!e) return "date not recorded";
  return short ? String(e.date).slice(0, 4) : formatDate(e.date);
}

// "1971-08-02" -> ms. A partial date ("1969-07", "2026") counts as the last day of that period.
function signalTime(d) {
  var p = String(d).split("-").map(Number);
  if (p.length === 1) return Date.UTC(p[0], 11, 31);
  if (p.length === 2) return Date.UTC(p[0], p[1], 0);
  return Date.UTC(p[0], p[1] - 1, p[2]);
}

var PHASE_LABELS = {
  launch: "Launch",
  arrival: "Arrival",
  milestone: "Milestone",
  signal: "Last documented event",
  after: "Afterwards"
};

function showSignal(index, moveFocus) {
  signalIndex = (index + signalChannels.length) % signalChannels.length;
  var ch = signalChannels[signalIndex];
  var item = findObject(ch.id);
  var ev = signalEvents(item, ch);
  var panel = document.getElementById("signal-panel");
  panel.innerHTML = "";
  panel.className = "signal-panel " + planetClass(item) + " kind-" + ch.signal.kind;

  document.querySelectorAll(".signal-channel").forEach(function (b) {
    b.setAttribute("aria-pressed", b.getAttribute("data-channel") === String(signalIndex) ? "true" : "false");
  });

  // --- Header ---
  var head = makeEl("header", "signal-head");
  var img = makeEl("div", "signal-photo");
  addImage(img, item, "");
  head.appendChild(img);
  var ht = makeEl("div", "signal-head-text");
  ht.appendChild(makeEl("p", "signal-mission", showValue(item.mission) + " · " + showValue(item.planet)));
  var h = makeEl("h3", "signal-title", item.name);
  h.id = "signal-title";
  h.tabIndex = -1;
  ht.appendChild(h);
  ht.appendChild(makeBadges(item));
  head.appendChild(ht);
  panel.appendChild(head);

  // --- The last signal card ---
  var card = makeEl("div", "signal-card");
  card.appendChild(makeEl("p", "signal-kind", SIGNAL_KINDS[ch.signal.kind]));
  var title = makeEl("p", "signal-card-title", ch.signal.title);
  card.appendChild(title);
  card.appendChild(makeEl("p", "signal-card-date", ch.signal.kind === "ongoing" ? "Still in use today" : signalDateOf(item, ch, false)));
  var note = makeEl("p", "signal-card-note");
  note.appendChild(makeTag("verified"));
  note.appendChild(document.createTextNode(" " + ch.signal.note));
  card.appendChild(note);
  if (!ch.signal.documented) {
    var unk = makeEl("p", "signal-card-note");
    unk.appendChild(makeTag("unknown"));
    unk.appendChild(document.createTextNode(" The exact final communication is not recorded in our sources, so we show the last documented event instead."));
    card.appendChild(unk);
  }
  panel.appendChild(card);

  // --- Signal trace (a time axis from launch to the latest event) ---
  panel.appendChild(signalTrace(item, ch, ev));

  // --- Timeline ---
  var tl = makeEl("ol", "signal-timeline");
  ev.list.forEach(function (e) {
    var li = makeEl("li", "signal-event phase-" + e.phase);
    li.appendChild(makeEl("span", "signal-event-phase", PHASE_LABELS[e.phase]));
    li.appendChild(makeEl("time", "signal-event-date", formatDate(e.date)));
    li.lastChild.setAttribute("datetime", e.date);
    li.appendChild(makeEl("span", "signal-event-label", e.label));
    tl.appendChild(li);
  });
  panel.appendChild(tl);

  // --- How long it worked (derived from the dates above) ---
  var arrival = ev.list.filter(function (e) { return e.phase === "arrival" && /lands|arrives/i.test(e.label); })[0];
  var last = ev.list[ev.signalAt];
  if (arrival && last && /^\d{4}-\d{2}-\d{2}$/.test(arrival.date) && /^\d{4}-\d{2}-\d{2}$/.test(last.date)) {
    var days = Math.round((signalTime(last.date) - signalTime(arrival.date)) / 86400000);
    var span = makeEl("p", "signal-span");
    var txt = "From arrival to the last documented event: " + days.toLocaleString("en-GB") + " Earth days";
    if (days >= 365) txt += " (about " + (days / 365.25).toFixed(1) + " years)";
    span.appendChild(makeEl("strong", "", txt + ". "));
    span.appendChild(document.createTextNode("Calculated from the dates above."));
    panel.appendChild(span);
  }

  // --- How it ended and what remained ---
  var grid = makeEl("div", "signal-remains");
  [["How it ended", item.fate], ["What remained", item.status + (isMissing(item.site) ? "" : " Resting place: " + item.site + ".")]].forEach(function (pair) {
    var b = makeEl("div", "signal-remain");
    var hh = makeEl("h4", "", pair[0] + " ");
    hh.appendChild(makeTag("verified"));
    b.appendChild(hh);
    b.appendChild(makeEl("p", "", showValue(pair[1])));
    grid.appendChild(b);
  });
  panel.appendChild(grid);

  // --- Sources ---
  var src = makeEl("p", "evidence-source", "Sources: ");
  var urls = [];
  if (isWebLink(item.source)) urls.push(item.source);
  if (ch.launch && isWebLink(ch.launch.source) && urls.indexOf(ch.launch.source) === -1) urls.push(ch.launch.source);
  urls.forEach(function (u, i) {
    if (i) src.appendChild(document.createTextNode(" · "));
    src.appendChild(makeLink(u, sourceName(u)));
  });
  if (ch.launch && urls.length) src.appendChild(document.createTextNode(" (launch date: NSSDCA record)"));
  panel.appendChild(src);

  // --- Actions ---
  var actions = makeEl("div", "signal-actions");
  var story = makeEl("button", "btn btn-primary", "Open its full story");
  story.type = "button";
  story.addEventListener("click", function () { openStory(item, story); });
  actions.appendChild(story);
  var prev = makeEl("button", "btn btn-ghost", "← Previous channel");
  prev.type = "button";
  prev.addEventListener("click", function () { showSignal(signalIndex - 1, true); });
  var next = makeEl("button", "btn btn-ghost", "Next channel →");
  next.type = "button";
  next.addEventListener("click", function () { showSignal(signalIndex + 1, true); });
  actions.appendChild(prev);
  actions.appendChild(next);
  panel.appendChild(actions);

  if (moveFocus) h.focus({ preventScroll: true });
}

// An SVG time axis: a pulsing line while the mission was active, a flat dashed line after its last signal.
function signalTrace(item, ch, ev) {
  var NS = "http://www.w3.org/2000/svg";
  var W = 1000, H = 90, L = 30, R = 970, MID = 46;
  var times = ev.list.map(function (e) { return signalTime(e.date); });
  var t0 = times[0];
  var t1 = ch.signal.kind === "ongoing" ? Math.max(Date.now(), times[times.length - 1]) : times[times.length - 1];
  if (t1 <= t0) t1 = t0 + 86400000;
  function x(t) { return L + (t - t0) / (t1 - t0) * (R - L); }
  var endActive = ev.signalAt >= 0 ? x(times[ev.signalAt]) : R;

  var wrap = makeEl("figure", "signal-trace");
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("role", "img");
  var first = ev.list[0], lastEv = ev.list[ev.signalAt];
  svg.setAttribute("aria-label", "Mission trace from " + formatDate(first.date) + (ch.signal.kind === "ongoing"
    ? " to today, still active."
    : " to the last documented event on " + (lastEv ? formatDate(lastEv.date) : "an unrecorded date") + ", then silence."));

  function path(d, cls) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    svg.appendChild(p);
  }
  // active: a heartbeat-style pulse every 46 units
  var d = "M" + L + " " + MID;
  for (var px = L; px < endActive; px += 46) {
    var a = Math.min(px + 18, endActive), b = Math.min(px + 23, endActive), c = Math.min(px + 28, endActive), e2 = Math.min(px + 46, endActive);
    d += " L" + a + " " + MID;
    if (b > a) d += " L" + b + " " + (MID - 20);
    if (c > b) d += " L" + c + " " + (MID + 12);
    d += " L" + e2 + " " + MID;
  }
  path(d, "trace-active");
  if (endActive < R) path("M" + endActive + " " + MID + " L" + R + " " + MID, "trace-silent");

  ev.list.forEach(function (e, i) {
    var cx = x(times[i]);
    var dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", MID);
    dot.setAttribute("r", e.phase === "signal" ? 7 : 4);
    dot.setAttribute("class", "trace-dot phase-" + e.phase);
    var tt = document.createElementNS(NS, "title");
    tt.textContent = formatDate(e.date) + ": " + e.label;
    dot.appendChild(tt);
    svg.appendChild(dot);
  });
  [[L, String(first.date).slice(0, 4), "start"], [R, ch.signal.kind === "ongoing" ? "Today" : String(ev.list[ev.list.length - 1].date).slice(0, 4), "end"]].forEach(function (lab) {
    var t = document.createElementNS(NS, "text");
    t.setAttribute("x", lab[0]);
    t.setAttribute("y", H - 6);
    t.setAttribute("text-anchor", lab[2]);
    t.setAttribute("class", "trace-year");
    t.textContent = lab[1];
    svg.appendChild(t);
  });
  wrap.appendChild(svg);
  wrap.appendChild(makeEl("figcaption", "", "Trace: a pulse while the mission was active, a flat line after its last documented event. Dots mark the events below, spaced by date."));
  return wrap;
}
