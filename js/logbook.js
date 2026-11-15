// Lunar Echoes - Explorer's Logbook (shared discovery journal)
// Keeps a simple record of what the visitor explored across the whole site, in THIS browser only
// (localStorage, wrapped in try/catch). It is not a certificate and not proof of research participation.
// Events are captured with delegated listeners, so feature modules need no changes; Rover Rescue and the
// Beyond the Archive journal are read from their own storage.

var LOG_KEY = "lunar-echoes-logbook-v1";
var logMem = { events: [] }; // used when storage is blocked

function logLoad() {
  try {
    var s = JSON.parse(localStorage.getItem(LOG_KEY) || "null");
    if (s && Array.isArray(s.events)) return s;
  } catch (e) { /* storage blocked: fall back to memory */ }
  return logMem;
}
function logSave(s) {
  logMem = s;
  try { localStorage.setItem(LOG_KEY, JSON.stringify(s)); } catch (e) { /* memory only */ }
}

// Adds one entry; the same type + id is only recorded once.
function logbookAdd(type, id, label) {
  if (!type || !id) return;
  var s = logLoad();
  var key = type + "|" + id;
  if (s.events.some(function (e) { return e.k === key; })) return;
  s.events.push({ k: key, t: type, label: String(label || id).slice(0, 160), at: Date.now() });
  if (s.events.length > 400) s.events = s.events.slice(-400);
  logSave(s);
  renderLogbook();
}

function logReadJSON(store, key) {
  try { return JSON.parse(store.getItem(key) || "null"); } catch (e) { return null; }
}

// Rover Rescue keeps progress per mission (sessionStorage, mirrored to localStorage by rover.js)
function logRover() {
  var all = logReadJSON(window.sessionStorage, "lunar-echoes-rover-v1") || logReadJSON(window.localStorage, "lunar-echoes-rover-mirror-v1") || {};
  var r = { samples: 0, instruments: 0, answers: 0 };
  Object.keys(all).forEach(function (m) {
    var st = all[m];
    if (!st || !Array.isArray(st.samples)) return;
    r.samples += st.samples.length;
    st.samples.forEach(function (s) {
      r.instruments += Object.keys(s.inst || {}).length;
      r.answers += Object.keys(s.answers || {}).length;
    });
  });
  return r;
}

// Beyond the Archive (citizen science) keeps its own session record
function logBeyond() {
  var b = logReadJSON(window.sessionStorage, "lunar-echoes-beyond-v1");
  var done = (b && b.done) || {};
  var keys = Object.keys(done);
  return {
    official: keys.filter(function (k) { return /-official$/.test(k); }).length,
    steps: keys.length
  };
}

function logCount(types) {
  return logLoad().events.filter(function (e) { return types.indexOf(e.t) !== -1; }).length;
}

function renderLogbook() {
  var box = document.getElementById("logbook-box");
  if (!box) return;
  box.removeAttribute("aria-busy");
  box.innerHTML = "";
  var rover = logRover(), beyond = logBeyond();
  var total = (typeof allObjects !== "undefined" && allObjects.length) || 12;
  var stats = [
    ["Objects explored", logCount(["object"]) + " / " + total],
    ["Cases investigated", logCount(["case"])],
    ["Samples collected", rover.samples],
    ["Instruments used", rover.instruments],
    ["Science questions answered", logCount(["claim", "quiz", "detective"]) + rover.answers],
    ["Citizen-science projects visited", beyond.official],
    ["Preservation decisions made", logCount(["decision"])],
    ["Mission histories followed", logCount(["signal"])]
  ];
  var grid = makeEl("div", "lb-stats");
  stats.forEach(function (s) {
    var d = makeEl("div", "lb-stat");
    d.appendChild(makeEl("b", "", String(s[1])));
    d.appendChild(makeEl("span", "", s[0]));
    grid.appendChild(d);
  });
  box.appendChild(grid);

  // A short narrative of the journey so far
  var parts = [];
  var objs = logCount(["object"]);
  if (objs) parts.push("opened " + objs + " object stor" + (objs === 1 ? "y" : "ies"));
  if (logCount(["case"])) parts.push("investigated " + logCount(["case"]) + " case file(s)");
  if (rover.samples) parts.push("collected " + rover.samples + " simulated sample(s) in Rover Rescue");
  if (logCount(["image"])) parts.push("studied " + logCount(["image"]) + " NASA image(s) in the Footprints Lab");
  if (logCount(["exhibit"])) parts.push("visited " + logCount(["exhibit"]) + " museum exhibit(s)");
  if (logCount(["decision"])) parts.push("made " + logCount(["decision"]) + " stewardship decision(s)");
  if (logCount(["capsule"])) parts.push("sealed a time capsule");
  if (logCount(["landing"])) parts.push("proposed " + logCount(["landing"]) + " landing site(s)");
  var summary = makeEl("p", "lb-summary", parts.length
    ? "So far you have " + parts.join(", ") + "."
    : "Your logbook is empty. Open an object, a case file or a mission channel, and it will start filling in.");
  box.appendChild(summary);

  var recent = logLoad().events.slice(-8).reverse();
  if (recent.length) {
    box.appendChild(makeEl("h3", "lb-h", "Latest entries"));
    var ul = makeEl("ul", "lb-list");
    recent.forEach(function (e) {
      var li = makeEl("li", "");
      li.appendChild(makeEl("span", "lb-type", LOG_TYPES[e.t] || e.t));
      li.appendChild(document.createTextNode(" " + e.label));
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  var acts = makeEl("div", "cap-actions");
  var pr = makeEl("button", "btn btn-ghost", "Print my journey summary");
  pr.type = "button";
  pr.addEventListener("click", logPrint);
  var clr = makeEl("button", "btn btn-ghost", "Clear logbook");
  clr.type = "button";
  clr.addEventListener("click", function () {
    if (!confirm("Clear your Explorer's Logbook in this browser? This cannot be undone.")) return;
    logSave({ events: [] });
    renderLogbook();
  });
  acts.appendChild(pr);
  acts.appendChild(clr);
  box.appendChild(acts);
  box.appendChild(makeEl("p", "cap-disclaimer", "Saved only in this browser on this device. Rover Rescue and citizen-science progress are read from this browser tab. This is a personal learning record, not an official NASA certificate or proof of research participation."));
}

var LOG_TYPES = {
  object: "Object", "case": "Case", detective: "Evidence sorted", claim: "Claim judged", quiz: "Quiz",
  decision: "Decision", signal: "Last Signal", image: "Image lab", map: "Map", exhibit: "Museum",
  perspective: "Perspective", capsule: "Time capsule", landing: "Landing site"
};

function logPrint() {
  var box = document.getElementById("logbook-box");
  var clone = box.cloneNode(true);
  clone.querySelectorAll(".cap-actions").forEach(function (n) { n.remove(); });
  var html = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>My Explorer's Logbook</title><style>" +
    "body{font:14px/1.5 system-ui,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#111}" +
    ".lb-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.lb-stat{border:1px solid #bbb;border-radius:8px;padding:8px}.lb-stat b{display:block;font-size:20px}" +
    ".lb-type{font-size:11px;text-transform:uppercase;letter-spacing:.08em;border:1px solid #999;border-radius:4px;padding:0 4px;margin-right:4px}" +
    "</style></head><body><h1>My Explorer's Logbook</h1><p>Lunar Echoes · " + new Date().toDateString() + "</p>" + clone.innerHTML +
    "<script>window.onload=function(){window.print()}<\/script></body></html>";
  var url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  window.open(url, "_blank");
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}

// ---------- Capture what the visitor does (delegated; no changes to feature modules) ----------
function logText(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }

document.addEventListener("click", function (e) {
  var t = e.target;
  if (!t || !t.closest) return;
  var el;
  if ((el = t.closest(".case-folder"))) logbookAdd("case", el.getAttribute("aria-label") || logText(el), (el.getAttribute("aria-label") || logText(el)).replace(/^Open case file /, "Case "));
  else if ((el = t.closest(".detective-choice"))) { var c = el.closest(".detective-claim"); if (c) logbookAdd("detective", logText(c.querySelector(".detective-claim-text")), logText(c.querySelector(".detective-claim-text"))); }
  else if ((el = t.closest(".eg-choice"))) { var q = document.querySelector(".eg-claim-text"); if (q) logbookAdd("claim", logText(q), logText(q)); }
  else if ((el = t.closest(".quiz-option"))) { var qq = document.querySelector(".quiz-question"); if (qq) logbookAdd("quiz", logText(qq), logText(qq)); }
  else if ((el = t.closest("#ethics-box .decision-choice, #decision-box .decision-choice"))) {
    var title = el.closest("#ethics-box") ? logText(document.querySelector("#ethics-box .eth-title")) : "Future explorer: Apollo 11";
    logbookAdd("decision", title, title + " → " + logText(el).replace(/^[A-D]/, ""));
  }
  else if ((el = t.closest(".signal-channel"))) logbookAdd("signal", logText(el.querySelector(".signal-channel-name")), logText(el.querySelector(".signal-channel-name")));
  else if ((el = t.closest(".fp-thumb"))) logbookAdd("image", el.getAttribute("aria-label"), el.getAttribute("aria-label"));
  else if ((el = t.closest(".hm-marker"))) logbookAdd("map", el.getAttribute("aria-label"), "Map: " + (el.getAttribute("aria-label") || "").split(".")[0]);
  else if ((el = t.closest(".persp-tab"))) { var st = document.getElementById("story-title"); logbookAdd("perspective", logText(el) + "|" + logText(st), logText(el) + " view of " + logText(st)); }
  // museum exhibits are logged after the exhibit has been drawn
  if (t.closest(".mu-door, .mu-arrow, .mu-hall-btn")) setTimeout(logMuseum, 0);
}, true);

document.addEventListener("keydown", function (e) {
  if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && document.getElementById("museum-dialog") && document.getElementById("museum-dialog").open) setTimeout(logMuseum, 0);
});

function logMuseum() {
  var h = document.getElementById("mu-title");
  if (h) logbookAdd("exhibit", logText(h), logText(h));
}

// Object stories: record each time the story dialog opens or changes object
(function watchStory() {
  var seen = "";
  var obs = new MutationObserver(function () {
    var d = document.getElementById("story-modal");
    var title = document.getElementById("story-title");
    if (d && d.open && title) {
      var name = logText(title);
      if (name && name !== seen) { seen = name; logbookAdd("object", name, name); }
    } else if (!d || !d.open) { seen = ""; }
  });
  obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open"] });
})();

// Refresh the totals when the visitor comes back from Rover Rescue in another tab
document.addEventListener("visibilitychange", function () { if (!document.hidden) renderLogbook(); });
