// Lunar Echoes - Object Explorer
// Shows equipment cards, Moon/Mars filter, search, and the story (object detail) view.
//
// Loaded first, so it also holds small helpers used by timeline.js, quiz.js and explore.js.

// ---------- Shared helpers ----------

var NOT_AVAILABLE = "Not available";
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// True when a field is empty, null or missing.
function isMissing(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

// Returns the value, or "Not available" when it is missing. Never invents data.
function showValue(value) {
  return isMissing(value) ? NOT_AVAILABLE : String(value);
}

// Small helper to create an element with an optional class and text.
function makeEl(tag, className, text) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// ---------- Evidence boundary ----------
// Every statement in the archive is one of these kinds. The label is always visible.
var EVIDENCE_KINDS = {
  verified: { label: "Verified", title: "Documented in a NASA source, linked nearby" },
  interpretation: { label: "Interpretation", title: "Our reasoning based on the verified facts, not a NASA statement" },
  unknown: { label: "Unknown", title: "Not documented in our NASA sources. We do not guess." },
  hypothetical: { label: "Hypothetical", title: "An imagined educational scenario, not a real mission or NASA decision" }
};

function makeTag(kind) {
  var k = EVIDENCE_KINDS[kind] || EVIDENCE_KINDS.verified;
  var tag = makeEl("span", "ev-tag ev-" + kind, k.label);
  tag.title = k.title;
  return tag;
}

// A short legend explaining the labels (used at the top of the evidence features)
function makeBoundaryLegend() {
  var legend = makeEl("div", "ev-legend");
  legend.setAttribute("aria-label", "How to read the labels");
  ["verified", "interpretation", "unknown"].forEach(function (kind) {
    var item = makeEl("span", "ev-legend-item");
    item.appendChild(makeTag(kind));
    item.appendChild(document.createTextNode(" " + EVIDENCE_KINDS[kind].title));
    legend.appendChild(item);
  });
  return legend;
}

// Adds an <img> only when there is an image path. If it fails to load,
// the image is removed so no broken-image icon is ever shown.
function addImage(parent, item, className) {
  if (isMissing(item.image)) return null;
  return addImageUrl(parent, item.image, isMissing(item.name) ? "" : item.name, className);
}

// Offline copies: a NASA image URL like
// https://images-assets.nasa.gov/image/PIA25287/PIA25287~medium.jpg
// is saved as assets/images/PIA25287~medium.jpg. Returns null for other URLs.
// The NASA Science image used by the citizen-science section is saved the same way, by file name.
function localImagePath(url) {
  var match = /^https:\/\/images-assets\.nasa\.gov\/image\/[^/]+\/([^/]+\.jpg)$/i.exec(String(url || "")) ||
              /^https:\/\/assets\.science\.nasa\.gov\/content\/dam\/science\/[^?#]+\/([^/?#]+\.jpg)$/i.exec(String(url || ""));
  return match ? "assets/images/" + match[1] : null;
}

// Tries the local copy first (works offline), then NASA's server,
// and removes the image if both fail, so no broken-image icon is shown.
function addImageUrl(parent, url, alt, className) {
  var img = document.createElement("img");
  var local = localImagePath(url);
  img.className = className;
  img.src = local || url;
  img.alt = alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", function () {
    if (local && img.src.indexOf(local) !== -1) {
      img.src = url; // local copy missing: fall back to NASA's server
    } else {
      img.remove();
    }
  });
  parent.appendChild(img);
  return img;
}

// "1969-07-20" -> "20 Jul 1969", "1969-07" -> "Jul 1969", "2009" -> "2009"
function formatDate(value) {
  var parts = String(value || "").split("-");
  if (parts.length === 3) return Number(parts[2]) + " " + MONTHS[Number(parts[1]) - 1] + " " + parts[0];
  if (parts.length === 2) return MONTHS[Number(parts[1]) - 1] + " " + parts[0];
  return parts[0] || NOT_AVAILABLE;
}

// ---------- Explorer state ----------

var allObjects = [];
var currentPlanet = "all"; // "all", "moon" or "mars"
var currentSearch = "";

// Called from main.js with the array from data/objects.json.
function renderObjects(objects) {
  allObjects = Array.isArray(objects) ? objects : [];
  buildControls();
  buildStoryModal();
  drawCards();
}

function findObject(id) {
  for (var i = 0; i < allObjects.length; i++) {
    if (allObjects[i].id === id) return allObjects[i];
  }
  return null;
}

// Opens a story by id (used by the landing button, the map and the quiz).
function openStoryById(id, opener) {
  var item = findObject(id);
  if (item) openStory(item, opener);
}

// ---------- Filter + search controls ----------

// The controls are created here because index.html has no slots for them.
function buildControls() {
  if (document.getElementById("explorer-controls")) return; // only build once

  var list = document.getElementById("objects-list");
  var controls = makeEl("div", "explorer-controls");
  controls.id = "explorer-controls";

  // Filter buttons
  var filterGroup = makeEl("div", "filter-group");
  filterGroup.setAttribute("role", "group");
  filterGroup.setAttribute("aria-label", "Filter by world");

  [
    { value: "all", label: "All" },
    { value: "moon", label: "Moon" },
    { value: "mars", label: "Mars" }
  ].forEach(function (option) {
    var btn = makeEl("button", "filter-btn", option.label);
    btn.type = "button";
    btn.dataset.planet = option.value;
    btn.setAttribute("aria-pressed", option.value === currentPlanet ? "true" : "false");
    btn.addEventListener("click", function () {
      currentPlanet = option.value;
      updateFilterButtons();
      drawCards();
    });
    filterGroup.appendChild(btn);
  });

  // Search box (with a real label for screen readers)
  var searchLabel = makeEl("label", "search-label", "Search by object or mission ");
  var searchInput = makeEl("input", "search-input");
  searchInput.type = "search";
  searchInput.id = "object-search";
  searchInput.placeholder = "e.g. rover, Apollo";
  searchInput.addEventListener("input", function () {
    currentSearch = searchInput.value.trim().toLowerCase();
    drawCards();
  });
  searchLabel.appendChild(searchInput);

  // Result count, read out by screen readers when it changes
  var count = makeEl("p", "result-count");
  count.id = "result-count";
  count.setAttribute("aria-live", "polite");

  controls.appendChild(filterGroup);
  controls.appendChild(searchLabel);
  controls.appendChild(count);
  list.parentNode.insertBefore(controls, list);
  updateFilterButtons();
}

function updateFilterButtons() {
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.setAttribute("aria-pressed", btn.dataset.planet === currentPlanet ? "true" : "false");
  });
}

// Returns the objects that match the current filter and search text.
function getVisibleObjects() {
  return allObjects.filter(function (item) {
    var planet = String(item.planet || "").toLowerCase();
    var planetOk = currentPlanet === "all" || planet === currentPlanet;

    var haystack = (String(item.name || "") + " " + String(item.mission || "")).toLowerCase();
    var searchOk = currentSearch === "" || haystack.indexOf(currentSearch) !== -1;

    return planetOk && searchOk;
  });
}

// ---------- Cards ----------

function drawCards() {
  var container = document.getElementById("objects-list");
  var count = document.getElementById("result-count");
  var visible = getVisibleObjects();
  container.innerHTML = "";
  container.removeAttribute("aria-busy");

  if (allObjects.length === 0) {
    container.appendChild(makeEl("p", "no-results", "No equipment records yet. Add some to data/objects.json."));
    if (count) count.textContent = "";
    return;
  }

  if (count) {
    count.textContent = "Showing " + visible.length + " of " + allObjects.length + " objects";
  }

  if (visible.length === 0) {
    container.appendChild(makeEl("p", "no-results", "No objects match your search. Try another word or filter."));
    return;
  }

  visible.forEach(function (item) {
    container.appendChild(makeCard(item));
  });
}

// Lowercase planet name for CSS hooks, e.g. "planet-moon" / "planet-mars".
function planetClass(item) {
  return "planet-" + String(item.planet || "unknown").toLowerCase().replace(/[^a-z]/g, "");
}

// Planet badge + "Still in use" / "Inactive" badge
function makeBadges(item) {
  var badges = makeEl("div", "card-badges");
  badges.appendChild(makeEl("span", "planet-badge", showValue(item.planet)));
  var statusBadge = makeStatusBadge(item);
  if (statusBadge) badges.appendChild(statusBadge);
  return badges;
}

function makeCard(item) {
  var card = makeEl("article", "card " + planetClass(item));
  addImage(card, item, "card-image");

  card.appendChild(makeBadges(item));
  card.appendChild(makeEl("h3", "card-title", showValue(item.name)));
  card.appendChild(
    makeEl("p", "card-meta", showValue(item.mission) + " · " + showValue(item.year))
  );
  if (!isMissing(item.site)) {
    card.appendChild(makeEl("p", "card-status", item.site));
  }

  var btn = makeEl("button", "story-btn", "Read its story");
  btn.type = "button";
  btn.setAttribute("aria-label", "Read the story of " + showValue(item.name));
  btn.addEventListener("click", function () {
    openStory(item, btn);
  });
  card.appendChild(btn);

  // Clicking anywhere on the card also opens the story
  card.style.cursor = "pointer";
  card.addEventListener("click", function (event) {
    if (event.target !== btn && !event.target.closest("a")) openStory(item, btn);
  });

  return card;
}

// ---------- Story view ----------

// Uses the native <dialog> element: it traps focus, closes on Escape,
// and is announced correctly by screen readers.
function buildStoryModal() {
  if (document.getElementById("story-modal")) return;

  var dialog = makeEl("dialog", "story-modal");
  dialog.id = "story-modal";
  dialog.setAttribute("aria-labelledby", "story-title");

  // Click on the dark backdrop (outside the box) closes the story
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  // When it closes, focus goes back to the button that opened it
  dialog.addEventListener("close", function () {
    if (lastFocused && lastFocused.focus && document.contains(lastFocused)) lastFocused.focus();
  });

  document.body.appendChild(dialog);
}

var lastFocused = null;

// "Still in use" / "Inactive" label from the statusType field (null if missing or unknown)
function makeStatusBadge(item) {
  var labels = { "in-use": "Still in use", "inactive": "Inactive" };
  var label = labels[item.statusType];
  if (!label) return null;
  return makeEl("span", "status-badge status-" + item.statusType, label);
}

function isWebLink(value) {
  return !isMissing(value) && /^https?:\/\//i.test(value);
}

// Link that opens in a new tab
function makeLink(url, text) {
  var link = makeEl("a", "story-source", text);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

// Friendly name for a source URL
function sourceName(url) {
  var host = url.replace(/^https?:\/\//i, "").split("/")[0];
  if (host.indexOf("nssdc.gsfc.nasa.gov") !== -1) return "NASA NSSDCA catalogue entry ↗";
  if (host.indexOf("nasa.gov") !== -1) return "NASA article (" + host + ") ↗";
  return host + " ↗";
}

// "26.13° N, 3.63° E" from latitude/longitude, or null when either is missing.
function formatLocation(item) {
  if (isMissing(item.latitude) || isMissing(item.longitude)) return null;
  var lat = Number(item.latitude);
  var lon = Number(item.longitude);
  if (isNaN(lat) || isNaN(lon)) return null;
  return Math.abs(lat).toFixed(2) + "° " + (lat >= 0 ? "N" : "S") + ", " +
         Math.abs(lon).toFixed(2) + "° " + (lon >= 0 ? "E" : "W");
}

// ---------- Then vs Now ----------
// A two-state view: THEN = archival mission photo + original purpose,
// NOW = documented present status (+ a later NASA orbital photo only where one exists).
// It also says plainly what our sources do NOT document, instead of guessing.
var thenNowCount = 0;

function makeThenNow(item) {
  var uid = "tn-" + (++thenNowCount);
  var wrap = makeEl("div", "tn " + planetClass(item));

  // The switch
  var controls = makeEl("div", "tn-switch");
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Show the object then or now");
  var thenBtn = makeEl("button", "tn-btn", "Then · " + showValue(item.year));
  var nowBtn = makeEl("button", "tn-btn", "Now · today");
  [thenBtn, nowBtn].forEach(function (b) {
    b.type = "button";
    b.setAttribute("aria-controls", uid);
  });
  controls.appendChild(thenBtn);
  controls.appendChild(nowBtn);
  wrap.appendChild(controls);

  var panel = makeEl("div", "tn-panel");
  panel.id = uid;
  panel.setAttribute("aria-live", "polite");
  wrap.appendChild(panel);

  function figure(url, alt, label, captionText, credit, page) {
    var fig = makeEl("figure", "tn-figure");
    if (!isMissing(url)) addImageUrl(fig, url, alt, "tn-image");
    var cap = makeEl("figcaption");
    cap.appendChild(makeEl("span", "tn-tag", label));
    if (!isMissing(captionText)) cap.appendChild(makeEl("span", "tn-caption", captionText));
    var c = makeEl("span", "tn-credit", "Photo: " + showValue(credit) + " ");
    if (isWebLink(page)) c.appendChild(makeLink(page, "(NASA ↗)"));
    cap.appendChild(c);
    fig.appendChild(cap);
    return fig;
  }

  function factRow(dl, label, value, cls, kind) {
    var dt = makeEl("dt", cls || "", label + " ");
    if (kind) dt.appendChild(makeTag(kind));
    dl.appendChild(dt);
    dl.appendChild(makeEl("dd", cls || "", value));
  }

  function showThen() {
    panel.innerHTML = "";
    panel.className = "tn-panel is-then";
    panel.appendChild(figure(item.image, "Archival photo: " + showValue(item.name),
      "Archival mission photograph", "", item.imageCredit, item.imagePage));
    var dl = makeEl("dl", "tn-facts");
    factRow(dl, "Arrived", showValue(item.mission) + ", " + showValue(item.year), "", "verified");
    factRow(dl, "Designed to", showValue(item.purpose), "", "verified");
    panel.appendChild(dl);
    thenBtn.setAttribute("aria-pressed", "true");
    nowBtn.setAttribute("aria-pressed", "false");
  }

  function showNow() {
    panel.innerHTML = "";
    panel.className = "tn-panel is-now";
    if (item.thenNow && !isMissing(item.thenNow.image)) {
      panel.appendChild(figure(item.thenNow.image, "Later orbital photo: " + showValue(item.name),
        "Later NASA orbital image · " + showValue(item.thenNow.date), item.thenNow.caption,
        item.thenNow.credit, item.thenNow.imagePage));
    } else {
      var none = makeEl("div", "tn-nophoto");
      none.appendChild(makeEl("strong", "", "No recent photograph in our NASA sources."));
      none.appendChild(makeEl("span", "", "We show no imagined or simulated view. The status below is what NASA has documented."));
      panel.appendChild(none);
    }
    var dl = makeEl("dl", "tn-facts");
    factRow(dl, "Documented today", showValue(item.status), "", "verified");
    if (!isMissing(item.site)) factRow(dl, "Resting place", item.site + (formatLocation(item) ? " (" + formatLocation(item) + ")" : ""), "", "verified");
    var unknown = ["its close-up physical condition today"];
    if (!formatLocation(item)) unknown.push("its exact position");
    factRow(dl, "Not documented in our sources", unknown.join("; ") + ".", "tn-unknown", "unknown");
    panel.appendChild(dl);
    thenBtn.setAttribute("aria-pressed", "false");
    nowBtn.setAttribute("aria-pressed", "true");
  }

  thenBtn.addEventListener("click", showThen);
  nowBtn.addEventListener("click", showNow);
  showThen();
  return wrap;
}

// ---------- Digital heritage passport ----------

function passportNumber(item) {
  var n = allObjects.indexOf(item) + 1;
  return "LE-P-" + (n < 10 ? "0" : "") + n;
}

function nssdcUrl(item) {
  return /^[A-Z0-9-]+$/i.test(String(item.nssdcId || ""))
    ? "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=" + encodeURIComponent(item.nssdcId)
    : null;
}

// The identity card at the top of every passport
function makePassportCard(item) {
  var card = makeEl("div", "passport-card");
  var head = makeEl("div", "passport-head");
  head.appendChild(makeEl("span", "passport-kicker", "Digital heritage passport"));
  head.appendChild(makeEl("span", "passport-no", passportNumber(item)));
  card.appendChild(head);
  var dl = makeEl("dl", "passport-id");
  function row(label, value, node) {
    dl.appendChild(makeEl("dt", "", label));
    var dd = makeEl("dd", "", node ? undefined : showValue(value));
    if (node) dd.appendChild(node);
    dl.appendChild(dd);
  }
  row("Object", item.name);
  row("Type", item.category);
  row("World", item.planet);
  row("Mission", item.mission);
  row("Arrived", item.year);
  row("Resting place", item.site);
  row("Coordinates", formatLocation(item) || NOT_AVAILABLE + " (not given in our NASA sources)");
  var url = nssdcUrl(item);
  row("NSSDCA record", null, url ? makeLink(url, item.nssdcId + " ↗") : document.createTextNode(NOT_AVAILABLE));
  row("Status", null, makeStatusBadge(item) || document.createTextNode(NOT_AVAILABLE));
  card.appendChild(dl);
  return card;
}

// Every NASA source used for this object, without duplicates
function sourceList(item) {
  var list = [];
  function add(name, url) {
    if (!isWebLink(url)) return;
    if (list.some(function (s) { return s.url === url; })) return;
    list.push({ name: name, url: url });
  }
  add("Primary source: " + sourceName(item.source).replace(" ↗", ""), item.source);
  add("NSSDCA catalogue record " + showValue(item.nssdcId), nssdcUrl(item));
  if (item.heritage && item.heritage.source) add("Heritage: " + item.heritage.source.name, item.heritage.source.url);
  add("Photo: " + showValue(item.imageCredit), item.imagePage);
  if (item.thenNow) add("Later photo: " + showValue(item.thenNow.credit), item.thenNow.imagePage);
  return list;
}

// ---------- Field note: a printable one-page discovery report ----------
// Opens a clean, printable page in a new tab built only from this object's verified record.
function openFieldNote(item) {
  function esc(s) {
    return String(s === undefined || s === null ? NOT_AVAILABLE : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var h = item.heritage || {};
  var img = localImagePath(item.image) ? new URL(localImagePath(item.image), location.href).href : item.image;
  var today = new Date();
  var dateText = today.getDate() + " " + MONTHS[today.getMonth()] + " " + today.getFullYear();
  var events = (item.events || []).map(function (e) {
    return "<li><b>" + esc(formatDate(e.date)) + "</b> " + esc(e.label) + "</li>";
  }).join("");
  var sources = sourceList(item).map(function (s) {
    return "<li>" + esc(s.name) + "<br><span class=\"url\">" + esc(s.url) + "</span></li>";
  }).join("");
  var html = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Field note: " + esc(item.name) + "</title><style>" +
    "body{font-family:Georgia,'Times New Roman',serif;color:#111;background:#fff;max-width:760px;margin:24px auto;padding:0 20px;line-height:1.45}" +
    "h1{font-size:26px;margin:4px 0}h2{font-family:Arial,sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:18px 0 4px;border-bottom:1px solid #999;padding-bottom:2px}" +
    ".k{font-family:Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#555}" +
    ".row{display:flex;gap:20px;align-items:flex-start}.row img{width:42%;border:1px solid #999}.row dl{flex:1;margin:0;font-size:14px}" +
    "dt{font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;color:#555;margin-top:6px}dd{margin:0}" +
    "p,li{font-size:14px}.tag{font-family:Arial,sans-serif;font-size:10px;font-weight:bold;border:1px solid #333;padding:0 4px;text-transform:uppercase;letter-spacing:.06em}" +
    ".url{font-family:Arial,sans-serif;font-size:11px;color:#444;word-break:break-all}.note{border:1px dashed #666;padding:8px 10px;margin-top:6px;min-height:60px}" +
    "footer{margin-top:18px;font-family:Arial,sans-serif;font-size:10px;color:#555;border-top:1px solid #999;padding-top:6px}" +
    "button{font-family:Arial,sans-serif;padding:8px 14px;margin:8px 0}@media print{button{display:none}body{margin:0}}" +
    "</style></head><body>" +
    "<button onclick=\"window.print()\">Print or save as PDF</button>" +
    "<div class=\"k\">Lunar Echoes · Field note · " + esc(passportNumber(item)) + " · " + esc(dateText) + "</div>" +
    "<h1>" + esc(item.name) + "</h1>" +
    "<div class=\"row\">" + (img ? "<img src=\"" + esc(img) + "\" alt=\"" + esc(item.name) + "\">" : "") +
    "<dl><dt>World</dt><dd>" + esc(item.planet) + "</dd><dt>Mission</dt><dd>" + esc(item.mission) + " (" + esc(item.year) + ")</dd>" +
    "<dt>Type</dt><dd>" + esc(item.category) + "</dd><dt>Resting place</dt><dd>" + esc(item.site) + "</dd>" +
    "<dt>Coordinates</dt><dd>" + esc(formatLocation(item) || NOT_AVAILABLE + " (not given in our NASA sources)") + "</dd>" +
    "<dt>NSSDCA record</dt><dd>" + esc(item.nssdcId) + "</dd><dt>Status today</dt><dd>" + esc(item.status) + "</dd></dl></div>" +
    "<h2>Purpose <span class=\"tag\">Verified</span></h2><p>" + esc(item.purpose) + "</p>" +
    "<h2>Mission <span class=\"tag\">Verified</span></h2><p>" + esc(item.story) + "</p>" +
    "<h2>Scientific contribution <span class=\"tag\">Verified</span></h2><p>" + esc(item.science) + "</p>" +
    "<h2>Documented history <span class=\"tag\">Verified</span></h2><ul>" + events + "</ul><p>" + esc(item.fate) + "</p>" +
    "<h2>Heritage significance</h2>" +
    (h.verified ? "<p><span class=\"tag\">Verified</span> " + esc(h.verified) + "</p>" : "") +
    (h.interpretation ? "<p><span class=\"tag\">Interpretation</span> " + esc(h.interpretation) + "</p>" : "") +
    (h.unknown ? "<p><span class=\"tag\">Unknown</span> " + esc(h.unknown) + "</p>" : "") +
    "<p><span class=\"tag\">Unknown</span> Its close-up physical condition today is not documented in our NASA sources.</p>" +
    "<h2>My observations</h2><div class=\"note\"></div>" +
    "<h2>Sources</h2><ol>" + sources + "</ol>" +
    "<footer>Photo: " + esc(item.imageCredit) + ". Generated by Lunar Echoes (NASA Space Apps Challenge 2026). " +
    "Facts from NASA sources listed above. This project is not affiliated with or endorsed by NASA.</footer>" +
    "</body></html>";
  var blob = new Blob([html], { type: "text/html" });
  var url = URL.createObjectURL(blob);
  var win = window.open(url, "_blank"); // our own generated page, so no "noopener" (it would hide the result)
  if (!win) {
    // Pop-up blocked: download the report instead
    var a = document.createElement("a");
    a.href = url;
    a.download = "field-note-" + item.id + ".html";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}

// Opens the heritage passport (story view) for one object. `opener` gets focus back when it closes.
function openStory(item, opener) {
  var dialog = document.getElementById("story-modal");
  if (!dialog) {
    buildStoryModal();
    dialog = document.getElementById("story-modal");
  }
  if (!dialog.open) lastFocused = opener || document.activeElement;
  dialog.innerHTML = "";
  dialog.className = "story-modal " + planetClass(item);

  var closeBtn = makeEl("button", "story-close", "Close ✕");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close story");
  closeBtn.addEventListener("click", function () {
    dialog.close();
  });
  dialog.appendChild(closeBtn);

  // --- Header: photo with title over it ---
  var hero = makeEl("header", "story-hero");
  addImage(hero, item, "story-image");
  var heroText = makeEl("div", "story-hero-text");
  heroText.appendChild(makeBadges(item));
  var title = makeEl("h2", "story-title", showValue(item.name));
  title.id = "story-title";
  heroText.appendChild(title);
  heroText.appendChild(makeEl("p", "story-meta",
    showValue(item.mission) + " · " + showValue(item.year) + " · " + showValue(item.category)));
  hero.appendChild(heroText);
  dialog.appendChild(hero);

  var body = makeEl("div", "story-body");

  // Image credit
  if (!isMissing(item.image)) {
    var credit = makeEl("p", "story-credit", "Photo: " + showValue(item.imageCredit) + " ");
    if (isWebLink(item.imagePage)) credit.appendChild(makeLink(item.imagePage, "(view at NASA ↗)"));
    body.appendChild(credit);
  }

  // --- Digital heritage passport: identity card ---
  body.appendChild(makePassportCard(item));

  // Today: status, highlighted green when still in use
  var fate = makeEl("p", "story-fate" + (item.statusType === "in-use" ? " is-in-use" : ""));
  fate.appendChild(makeEl("strong", "", "Today: "));
  fate.appendChild(document.createTextNode(showValue(item.status) + " "));
  fate.appendChild(makeTag("verified"));
  body.appendChild(fate);
  body.appendChild(makeBoundaryLegend());

  // --- Passport sections ---
  var sections = makeEl("ol", "passport-sections");
  sections.setAttribute("aria-label", "Heritage passport");
  function section(title, kind, fill) {
    var li = makeEl("li", "passport-section");
    var h = makeEl("h3", "", title + " ");
    if (kind) h.appendChild(makeTag(kind));
    li.appendChild(h);
    fill(li);
    sections.appendChild(li);
  }
  function para(parent, text, kind) {
    var p = makeEl("p", "");
    if (kind) { p.appendChild(makeTag(kind)); p.appendChild(document.createTextNode(" ")); }
    p.appendChild(document.createTextNode(showValue(text)));
    parent.appendChild(p);
  }

  section("Purpose", "verified", function (li) { para(li, item.purpose); });
  section("Mission", "verified", function (li) { para(li, item.story); });
  section("Scientific contribution", "verified", function (li) { para(li, item.science); });
  section("Documented history", "verified", function (li) {
    if (Array.isArray(item.events) && item.events.length > 0) {
      var journey = makeEl("ol", "journey");
      journey.setAttribute("aria-label", "Mission journey");
      item.events.forEach(function (event) {
        var step = makeEl("li", "journey-step");
        step.appendChild(makeEl("span", "journey-date", formatDate(event.date)));
        step.appendChild(makeEl("span", "journey-label", showValue(event.label)));
        journey.appendChild(step);
      });
      li.appendChild(journey);
    }
    para(li, item.fate);
  });
  section("Current status: then vs now", "", function (li) { li.appendChild(makeThenNow(item)); });
  section("Heritage significance", "", function (li) {
    var h = item.heritage || {};
    if (!isMissing(item.legacy)) para(li, item.legacy, "verified");
    if (!isMissing(h.verified)) {
      para(li, h.verified, "verified");
      if (h.source && isWebLink(h.source.url)) {
        var s = makeEl("p", "evidence-source", "Source: ");
        s.appendChild(makeLink(h.source.url, h.source.name + " ↗"));
        li.appendChild(s);
      }
    }
    if (!isMissing(h.interpretation)) para(li, h.interpretation, "interpretation");
    if (!isMissing(h.unknown)) para(li, h.unknown, "unknown");
  });
  section("Source evidence", "", function (li) {
    var ul = makeEl("ul", "passport-sources");
    sourceList(item).forEach(function (s) {
      var row = makeEl("li");
      row.appendChild(makeLink(s.url, s.name + " ↗"));
      ul.appendChild(row);
    });
    li.appendChild(ul);
    li.appendChild(makeEl("p", "evidence-source", "Full reference list with page numbers: docs/research-sources.md in the project."));
  });
  body.appendChild(sections);

  // --- Field note (printable one-page report) ---
  var noteBtn = makeEl("button", "btn btn-ghost field-note-btn", "Create a field note (printable report)");
  noteBtn.type = "button";
  noteBtn.addEventListener("click", function () { openFieldNote(item); });
  body.appendChild(noteBtn);


  // --- Previous / next object (follows the current filter and search) ---
  var list = getVisibleObjects();
  if (list.indexOf(item) === -1) list = allObjects;
  var index = list.indexOf(item);
  if (list.length > 1) {
    var nav = makeEl("nav", "story-nav");
    nav.setAttribute("aria-label", "Browse the collection");
    var prev = list[(index - 1 + list.length) % list.length];
    var next = list[(index + 1) % list.length];
    [["← " + prev.name, prev], [next.name + " →", next]].forEach(function (pair) {
      var b = makeEl("button", "story-nav-btn", pair[0]);
      b.type = "button";
      b.addEventListener("click", function () {
        openStory(pair[1]);
        dialog.scrollTop = 0;
      });
      nav.appendChild(b);
    });
    body.appendChild(nav);
  }

  dialog.appendChild(body);

  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  closeBtn.focus();
}
