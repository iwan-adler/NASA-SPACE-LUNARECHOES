// Lunar Echoes - Object Explorer
// Shows equipment cards, Moon/Mars filter, search, and the story modal.
//
// Loaded first, so it also holds small helpers used by timeline.js and quiz.js.

// ---------- Shared helpers ----------

var NOT_AVAILABLE = "Not available";

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
  if (isMissing(item.image)) return;
  var img = document.createElement("img");
  img.className = className;
  img.src = item.image;
  img.alt = isMissing(item.name) ? "" : item.name;
  img.loading = "lazy";
  img.style.maxWidth = "100%";
  img.addEventListener("error", function () {
    img.remove();
  });
  parent.appendChild(img);
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

// ---------- Filter + search controls ----------

// The controls are created here because index.html has no slots for them yet.
// CSS classes to style: .explorer-controls, .filter-btn, .search-input, .result-count
function buildControls() {
  if (document.getElementById("explorer-controls")) return; // only build once

  var list = document.getElementById("objects-list");
  var controls = makeEl("div", "explorer-controls");
  controls.id = "explorer-controls";

  // Filter buttons
  var filterGroup = makeEl("div", "filter-group");
  filterGroup.setAttribute("role", "group");
  filterGroup.setAttribute("aria-label", "Filter by planet");

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
    var active = btn.dataset.planet === currentPlanet;
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.style.fontWeight = active ? "bold" : "normal"; // visible even before CSS styles it
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

  if (allObjects.length === 0) {
    container.textContent = "No equipment records yet. Add some to data/objects.json.";
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

function makeCard(item) {
  var card = makeEl("article", "card " + planetClass(item));
  addImage(card, item, "card-image");

  card.appendChild(makeEl("span", "planet-badge", showValue(item.planet)));
  card.appendChild(makeEl("h3", "card-title", showValue(item.name)));
  card.appendChild(
    makeEl("p", "card-meta", showValue(item.mission) + " · " + showValue(item.year))
  );
  if (!isMissing(item.status)) {
    card.appendChild(makeEl("p", "card-status", item.status));
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
    if (event.target !== btn) openStory(item, btn);
  });

  return card;
}

// ---------- Story modal ----------

// Uses the native <dialog> element: it traps focus, closes on Escape,
// and is announced correctly by screen readers.
// CSS classes to style: .story-modal, .story-close, .story-fields
function buildStoryModal() {
  if (document.getElementById("story-modal")) return;

  var dialog = makeEl("dialog", "story-modal");
  dialog.id = "story-modal";
  dialog.setAttribute("aria-labelledby", "story-title");

  // Click on the dark backdrop (outside the box) closes the modal
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  document.body.appendChild(dialog);
}

var lastFocused = null;

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

// Friendly name for a source URL, e.g. "NASA NSSDCA catalogue (nssdc.gsfc.nasa.gov)"
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

// Opens the story for one object. `opener` gets focus back when it closes.
function openStory(item, opener) {
  var dialog = document.getElementById("story-modal");
  if (!dialog) {
    buildStoryModal();
    dialog = document.getElementById("story-modal");
  }
  lastFocused = opener || document.activeElement;
  dialog.innerHTML = "";
  dialog.className = "story-modal " + planetClass(item); // colours the planet badge

  var closeBtn = makeEl("button", "story-close", "Close ✕");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close story");
  closeBtn.addEventListener("click", function () {
    dialog.close();
  });

  var title = makeEl("h2", "story-title", showValue(item.name));
  title.id = "story-title";

  dialog.appendChild(closeBtn);
  dialog.appendChild(makeEl("span", "planet-badge", showValue(item.planet)));
  dialog.appendChild(title);
  dialog.appendChild(makeEl("p", "story-meta",
    showValue(item.mission) + " · " + showValue(item.year) + " · " + showValue(item.status)));

  // Image with its NASA credit underneath
  if (!isMissing(item.image)) {
    var figure = makeEl("figure", "story-figure");
    addImage(figure, item, "story-image");
    var caption = makeEl("figcaption", "story-credit");
    caption.appendChild(document.createTextNode("Image: " + showValue(item.imageCredit) + " "));
    if (isWebLink(item.imagePage)) {
      caption.appendChild(makeLink(item.imagePage, "(view at NASA)"));
    }
    figure.appendChild(caption);
    dialog.appendChild(figure);
  }

  // The story, told in three chapters. Missing text shows "Not available".
  [
    ["Why it was sent", item.purpose],
    ["What happened", item.story],
    ["Why it matters", item.science]
  ].forEach(function (pair) {
    var chapter = makeEl("section", "story-chapter");
    chapter.appendChild(makeEl("h3", "", pair[0]));
    chapter.appendChild(makeEl("p", "", showValue(pair[1])));
    dialog.appendChild(chapter);
  });

  // Quick facts: label + value
  var fields = makeEl("dl", "story-fields");
  [
    ["Planet", item.planet],
    ["Mission", item.mission],
    ["Mission year", item.year],
    ["Type", item.category],
    ["Location", formatLocation(item)],
    ["Image credit", item.imageCredit]
  ].forEach(function (pair) {
    fields.appendChild(makeEl("dt", "", pair[0]));
    fields.appendChild(makeEl("dd", "", showValue(pair[1])));
  });

  // Source: a real link only when it is a web address
  fields.appendChild(makeEl("dt", "", "Source"));
  var sourceDd = makeEl("dd");
  if (isWebLink(item.source)) {
    sourceDd.appendChild(makeLink(item.source, sourceName(item.source)));
  } else {
    sourceDd.textContent = showValue(item.source);
  }
  fields.appendChild(sourceDd);

  dialog.appendChild(fields);

  dialog.addEventListener("close", function restoreFocus() {
    dialog.removeEventListener("close", restoreFocus);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  });

  dialog.showModal();
  closeBtn.focus();
}
