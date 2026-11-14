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

// Adds an <img> only when there is an image path. If it fails to load,
// the image is removed so no broken-image icon is ever shown.
function addImage(parent, item, className) {
  if (isMissing(item.image)) return null;
  return addImageUrl(parent, item.image, isMissing(item.name) ? "" : item.name, className);
}

// Offline copies: a NASA image URL like
// https://images-assets.nasa.gov/image/PIA25287/PIA25287~medium.jpg
// is saved as assets/images/PIA25287~medium.jpg. Returns null for other URLs.
function localImagePath(url) {
  var match = /^https:\/\/images-assets\.nasa\.gov\/image\/[^/]+\/([^/]+\.jpg)$/i.exec(String(url || ""));
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

// The five story chapters, in order. Missing text shows "Not available".
function storyChapters(item) {
  return [
    ["Designed", "Why it was built", item.purpose],
    ["Mission", "What it did", item.story],
    ["Discovery", "What it helped us learn", item.science],
    ["Left behind", "What happened to it", item.fate],
    ["Legacy", "Where it stands today", item.legacy]
  ];
}

// Opens the story for one object. `opener` gets focus back when it closes.
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

  // Today: status, highlighted green when still in use
  var fate = makeEl("p", "story-fate" + (item.statusType === "in-use" ? " is-in-use" : ""));
  fate.appendChild(makeEl("strong", "", "Today: "));
  fate.appendChild(document.createTextNode(showValue(item.status)));
  body.appendChild(fate);

  // --- Five chapters ---
  var chapters = makeEl("ol", "story-chapters");
  chapters.setAttribute("aria-label", "The story in five chapters");
  storyChapters(item).forEach(function (chapter) {
    var li = makeEl("li", "story-chapter");
    var h = makeEl("h3", "", chapter[0]);
    h.setAttribute("title", chapter[1]);
    li.appendChild(h);
    li.appendChild(makeEl("p", "", showValue(chapter[2])));
    chapters.appendChild(li);
  });
  body.appendChild(chapters);

  // --- Mission journey ---
  if (Array.isArray(item.events) && item.events.length > 0) {
    body.appendChild(makeEl("h3", "story-subtitle", "Mission journey"));
    var journey = makeEl("ol", "journey");
    item.events.forEach(function (event) {
      var step = makeEl("li", "journey-step");
      step.appendChild(makeEl("span", "journey-date", formatDate(event.date)));
      step.appendChild(makeEl("span", "journey-label", showValue(event.label)));
      journey.appendChild(step);
    });
    body.appendChild(journey);
  }

  // --- Then vs Now (only where NASA has a later photo of the same hardware) ---
  if (item.thenNow && !isMissing(item.thenNow.image)) {
    body.appendChild(makeEl("h3", "story-subtitle", "Then and now"));
    var tn = makeEl("div", "then-now");

    var thenFig = makeEl("figure");
    if (!isMissing(item.image)) addImageUrl(thenFig, item.image, "Then: " + showValue(item.name), "");
    var thenCap = makeEl("figcaption");
    thenCap.appendChild(makeEl("span", "tn-label", "Then"));
    thenCap.appendChild(document.createTextNode(showValue(item.imageCredit)));
    thenFig.appendChild(thenCap);

    var nowFig = makeEl("figure");
    addImageUrl(nowFig, item.thenNow.image, "Now, seen from orbit: " + showValue(item.name), "");
    var nowCap = makeEl("figcaption");
    nowCap.appendChild(makeEl("span", "tn-label", "Now"));
    nowCap.appendChild(document.createTextNode(showValue(item.thenNow.caption) + " " + showValue(item.thenNow.credit) + " "));
    if (isWebLink(item.thenNow.imagePage)) nowCap.appendChild(makeLink(item.thenNow.imagePage, "↗"));
    nowFig.appendChild(nowCap);

    tn.appendChild(thenFig);
    tn.appendChild(nowFig);
    body.appendChild(tn);
  }

  // --- Archive record ---
  body.appendChild(makeEl("h3", "story-subtitle", "Archive record"));
  var fields = makeEl("dl", "story-fields");
  [
    ["Planet", item.planet],
    ["Mission", item.mission],
    ["Arrived", item.year],
    ["Type", item.category],
    ["Resting place", item.site],
    ["Coordinates", formatLocation(item)],
    ["Image credit", item.imageCredit]
  ].forEach(function (pair) {
    fields.appendChild(makeEl("dt", "", pair[0]));
    fields.appendChild(makeEl("dd", "", showValue(pair[1])));
  });

  // Link to the object's record in the NASA NSSDCA Master Catalog
  fields.appendChild(makeEl("dt", "", "NSSDCA record"));
  var nssdcDd = makeEl("dd");
  if (/^[A-Z0-9-]+$/i.test(String(item.nssdcId || ""))) {
    nssdcDd.appendChild(makeLink(
      "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=" + encodeURIComponent(item.nssdcId),
      item.nssdcId + " ↗"));
  } else {
    nssdcDd.textContent = NOT_AVAILABLE;
  }
  fields.appendChild(nssdcDd);

  // Source: a real link only when it is a web address
  fields.appendChild(makeEl("dt", "", "Source"));
  var sourceDd = makeEl("dd");
  if (isWebLink(item.source)) {
    sourceDd.appendChild(makeLink(item.source, sourceName(item.source)));
  } else {
    sourceDd.textContent = showValue(item.source);
  }
  fields.appendChild(sourceDd);
  body.appendChild(fields);

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
