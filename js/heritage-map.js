// Lunar Echoes - The Forgotten Footprints: interactive Moon and Mars heritage map.
// Replaces the simple location grid (js/explore.js renderMap) when data/heritage-map.json loads;
// if it fails, the old grid stays. Real NASA basemaps in equirectangular projection.
// Three levels of certainty, always labelled:
//   Verified    - coordinates in data/objects.json (NSSDCA)
//   Approximate - site documented, exact spot not; plotted at a documented nearby point
//   Unknown     - not plotted, listed with the region name only
// Uses helpers from js/objects.js (makeEl, makeLink, makeBadges, formatDate, formatLocation, openStory…).

var hmState = { planet: "Moon", objects: [], data: null, selected: null };

function renderHeritageMap(objects, data) {
  var box = document.getElementById("map-box");
  if (!box || !data || !data.basemaps) return; // keep the fallback grid from explore.js
  hmState.objects = objects;
  hmState.data = data;
  box.className = "hm";
  box.innerHTML = "";

  // Section heading upgrade (the section is shared with explore.js; only text changes)
  var title = document.getElementById("map-title");
  if (title) title.textContent = "The Forgotten Footprints";
  var intro = document.querySelector("#map .section-intro");
  if (intro) intro.textContent = "Where the hardware rests today, on real NASA maps of the Moon and Mars. Select a marker to open its record. Every position is labelled by how certain it is, and nothing is guessed.";

  var tabs = makeEl("div", "hm-tabs");
  tabs.setAttribute("role", "group");
  tabs.setAttribute("aria-label", "Choose a world");
  ["Moon", "Mars"].forEach(function (p) {
    var b = makeEl("button", "hm-tab is-" + p.toLowerCase(), p === "Moon" ? "The Moon" : "Mars");
    b.type = "button";
    b.setAttribute("data-planet", p);
    b.addEventListener("click", function () { hmState.planet = p; hmState.selected = null; drawHeritageMap(); });
    tabs.appendChild(b);
  });
  box.appendChild(tabs);

  var legend = makeEl("ul", "hm-legend");
  [["verified", "Verified location", "coordinates from NASA's NSSDCA catalogue"],
   ["approximate", "Approximate location", "site documented, exact spot not"],
   ["unknown", "Location unknown", "not plotted; region only"]].forEach(function (l) {
    var li = makeEl("li", "hm-key-" + l[0]);
    li.appendChild(makeEl("span", "hm-swatch"));
    li.appendChild(makeEl("strong", "", l[1]));
    li.appendChild(document.createTextNode(": " + l[2]));
    legend.appendChild(li);
  });
  box.appendChild(legend);

  var stage = makeEl("div", "hm-stage");
  stage.appendChild(makeEl("div", "hm-mapwrap"));
  var panel = makeEl("aside", "hm-panel");
  panel.setAttribute("aria-live", "polite");
  stage.appendChild(panel);
  box.appendChild(stage);
  box.appendChild(makeEl("div", "hm-below"));

  drawHeritageMap();
}

// Every object on the current world with a position and certainty level.
function hmPlaces(planet) {
  var approx = {};
  (hmState.data.approximate || []).forEach(function (a) { approx[a.id] = a; });
  return hmState.objects.filter(function (o) { return o.planet === planet; }).map(function (o) {
    if (hasCoordinates(o)) return { item: o, lat: Number(o.latitude), lon: Number(o.longitude), level: "verified" };
    if (approx[o.id]) return { item: o, lat: approx[o.id].latitude, lon: approx[o.id].longitude, level: "approximate", approx: approx[o.id] };
    return { item: o, level: "unknown" };
  });
}

function drawHeritageMap() {
  var planet = hmState.planet;
  var base = hmState.data.basemaps[planet];
  var v = base.view;
  var vw = v.lonMax - v.lonMin, vh = v.latMax - v.latMin;

  document.querySelectorAll(".hm-tab").forEach(function (b) {
    b.setAttribute("aria-pressed", b.getAttribute("data-planet") === planet ? "true" : "false");
  });

  var wrap = document.querySelector(".hm-mapwrap");
  wrap.innerHTML = "";
  var map = makeEl("div", "hm-map is-" + planet.toLowerCase());
  map.style.aspectRatio = vw + " / " + vh;
  // Crop the global plate carrée image to the view window
  map.style.backgroundImage = "url('" + base.image + "')";
  map.style.backgroundSize = (36000 / vw) + "% " + (18000 / vh) + "%";
  map.style.backgroundPosition = (vw >= 360 ? 0 : (v.lonMin + 180) / (360 - vw) * 100) + "% " +
                                 (vh >= 180 ? 0 : (90 - v.latMax) / (180 - vh) * 100) + "%";
  map.setAttribute("role", "group");
  map.setAttribute("aria-label", "Map of " + planet + ". " + base.viewNote);

  // graticule every 30°
  for (var lon = Math.ceil(v.lonMin / 30) * 30; lon <= v.lonMax; lon += 30) {
    var gl = makeEl("span", "hm-grid hm-grid-v" + (lon === 0 ? " is-zero" : ""));
    gl.style.left = ((lon - v.lonMin) / vw * 100) + "%";
    map.appendChild(gl);
  }
  for (var lat = Math.ceil(v.latMin / 30) * 30; lat <= v.latMax; lat += 30) {
    var gh = makeEl("span", "hm-grid hm-grid-h" + (lat === 0 ? " is-zero" : ""));
    gh.style.top = ((v.latMax - lat) / vh * 100) + "%";
    map.appendChild(gh);
  }

  // Group places within 1° (e.g. the three Apollo 11 objects, metres apart)
  var places = hmPlaces(planet);
  var groups = [];
  places.filter(function (p) { return p.level !== "unknown"; }).forEach(function (p) {
    var g = groups.filter(function (x) { return Math.abs(x.lat - p.lat) < 1 && Math.abs(x.lon - p.lon) < 1; })[0];
    if (!g) { g = { lat: p.lat, lon: p.lon, places: [] }; groups.push(g); }
    g.places.push(p);
  });

  groups.forEach(function (g, gi) {
    var x = (g.lon - v.lonMin) / vw * 100, y = (v.latMax - g.lat) / vh * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    var allApprox = g.places.every(function (p) { return p.level === "approximate"; });
    var m = makeEl("button", "hm-marker " + (allApprox ? "is-approximate" : "is-verified"));
    m.type = "button";
    m.style.left = x + "%";
    m.style.top = y + "%";
    m.setAttribute("data-group", String(gi));
    var names = g.places.map(function (p) { return p.item.name; });
    m.setAttribute("aria-label", names.join(", ") + ". " + (allApprox ? "Approximate location." : "Verified location.") + " Show details.");
    if (g.places.length > 1) m.appendChild(makeEl("span", "hm-count", String(g.places.length)));
    var label = makeEl("span", "hm-label", hmSiteLabel(g.places[0].item) + (g.places.length > 1 ? " · " + g.places.length + " objects" : ""));
    label.setAttribute("aria-hidden", "true");
    m.appendChild(label);
    m.addEventListener("click", function () {
      hmState.selected = gi;
      document.querySelectorAll(".hm-marker").forEach(function (x) { x.classList.toggle("is-selected", x === m); });
      showHeritagePanel(g);
    });
    map.appendChild(m);
  });
  wrap.appendChild(map);

  var cap = makeEl("p", "hm-credit");
  cap.appendChild(document.createTextNode(base.viewNote + " "));
  cap.appendChild(makeLink(base.url, base.credit + " ↗"));
  cap.appendChild(document.createTextNode(". Equirectangular projection; markers are placed by latitude and longitude."));
  wrap.appendChild(cap);

  // Default panel: a prompt, or the first group
  var panel = document.querySelector(".hm-panel");
  panel.innerHTML = "";
  panel.className = "hm-panel is-" + planet.toLowerCase();
  panel.appendChild(makeEl("p", "hm-panel-hint", "Select a marker to see what rests there, when it arrived and how certain its position is."));

  // Below the map: accessible list of every object, including unknown locations
  var below = document.querySelector(".hm-below");
  below.innerHTML = "";
  below.appendChild(makeEl("h3", "hm-list-title", "All " + planet + " objects in the archive"));
  var ul = makeEl("ul", "hm-list");
  places.slice().sort(function (a, b) { return Number(a.item.year) - Number(b.item.year); }).forEach(function (p) {
    var li = makeEl("li", "hm-key-" + p.level);
    li.appendChild(makeEl("span", "hm-swatch"));
    var b = makeEl("button", "hm-list-name", p.item.name);
    b.type = "button";
    b.addEventListener("click", function () { openStory(p.item, b); });
    li.appendChild(b);
    var where = p.level === "unknown"
      ? showValue(p.item.site) + ". Region only: no verified coordinates in our sources."
      : formatLocation({ latitude: p.lat, longitude: p.lon }) + (p.level === "approximate" ? " (approximate)" : "");
    li.appendChild(makeEl("span", "hm-list-where", " · " + showValue(p.item.mission) + ", " + hmArrival(p.item) + " · " + where));
    ul.appendChild(li);
  });
  below.appendChild(ul);
}

function hmSiteLabel(item) {
  return String(item.site || item.mission).split(/[,(]/)[0].trim();
}

// Arrival date: the first landing/arrival event, else the year.
function hmArrival(item) {
  var e = (item.events || []).filter(function (x) { return /lands|arrives|set up/i.test(x.label); })[0];
  return e ? "arrived " + formatDate(e.date) : "arrived " + showValue(item.year);
}

function showHeritagePanel(g) {
  var panel = document.querySelector(".hm-panel");
  panel.innerHTML = "";
  var first = g.places[0].item;
  panel.appendChild(makeEl("p", "hm-panel-site", showValue(first.site)));
  g.places.forEach(function (p) {
    var o = p.item;
    var card = makeEl("article", "hm-obj");
    var h = makeEl("h4", "", o.name);
    card.appendChild(h);
    card.appendChild(makeBadges(o));
    card.appendChild(makeEl("p", "hm-obj-meta", showValue(o.mission) + " · " + hmArrival(o)));
    var cert = makeEl("p", "hm-cert hm-key-" + p.level);
    cert.appendChild(makeEl("span", "hm-swatch"));
    cert.appendChild(makeEl("strong", "", p.level === "verified" ? "Verified location: " : "Approximate location: "));
    cert.appendChild(document.createTextNode(formatLocation({ latitude: p.lat, longitude: p.lon })));
    card.appendChild(cert);
    if (p.level === "approximate") {
      var basis = makeEl("p", "hm-basis", p.approx.basis + " ");
      basis.appendChild(makeLink(p.approx.sourceUrl, p.approx.sourceName + " ↗"));
      card.appendChild(basis);
    } else if (isWebLink(o.source)) {
      var src = makeEl("p", "hm-basis", "Coordinates: ");
      src.appendChild(makeLink(o.source, sourceName(o.source)));
      card.appendChild(src);
    }
    card.appendChild(makeEl("p", "hm-status", showValue(o.status)));
    var acts = makeEl("div", "hm-actions");
    var story = makeEl("button", "btn btn-primary", "Open record");
    story.type = "button";
    story.addEventListener("click", function () { openStory(o, story); });
    acts.appendChild(story);
    if (typeof openSignalFor === "function") {
      var sig = makeEl("button", "btn btn-ghost", "Last signal");
      sig.type = "button";
      sig.addEventListener("click", function () { openSignalFor(o.id); });
      acts.appendChild(sig);
    }
    card.appendChild(acts);
    panel.appendChild(card);
  });
}
