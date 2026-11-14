// Lunar Echoes - landing numbers, Moon vs Mars comparison and location explorer.
// Everything shown here is either counted from data/objects.json or copied
// from data/worlds.json (NASA NSSDCA fact sheets). Nothing is estimated.

var WORLD_ORDER = ["Moon", "Mars"];

// Map windows. The Moon objects are all on the near side, so that panel is zoomed in.
var MAP_VIEWS = {
  Moon: { lonMin: -60, lonMax: 60, latMin: -30, latMax: 30, step: 15,
          range: "Showing 60° W to 60° E, 30° S to 30° N (part of the near side)" },
  Mars: { lonMin: -180, lonMax: 180, latMin: -90, latMax: 90, step: 30,
          range: "Showing the whole planet, 180° W to 180° E" }
};

// Called from main.js. `worlds` may be null if data/worlds.json could not load.
function renderExplore(objects, worlds) {
  renderHeroStats(objects);
  wireStoryButtons();
  renderCompare(objects, worlds);
  renderMap(objects);
}

function objectsOn(objects, planet) {
  return objects.filter(function (o) { return o.planet === planet; });
}

function byYear(a, b) { return Number(a.year) - Number(b.year); }

// ---------- Landing numbers ----------

function renderHeroStats(objects) {
  var box = document.getElementById("hero-stats");
  if (!box) return;
  box.innerHTML = "";
  var years = objects.map(function (o) { return Number(o.year); }).filter(function (y) { return y > 0; });
  var inUse = objects.filter(function (o) { return o.statusType === "in-use"; }).length;
  [
    [String(objects.length), "objects in the collection", ""],
    [String(objectsOn(objects, "Moon").length), "on the Moon", "is-moon"],
    [String(objectsOn(objects, "Mars").length), "on Mars", "is-mars"],
    [years.length ? Math.min.apply(null, years) + "–" + Math.max.apply(null, years) : NOT_AVAILABLE, "years of arrivals", ""],
    [String(inUse), "still used for science", "is-live"]
  ].forEach(function (stat) {
    var wrap = makeEl("div", "hero-stat " + stat[2]);
    wrap.appendChild(makeEl("dt", "", stat[1]));
    wrap.appendChild(makeEl("dd", "", stat[0]));
    box.appendChild(wrap);
  });
}

// Any button with data-open-story="<object id>" opens that object's story.
function wireStoryButtons() {
  document.querySelectorAll("[data-open-story]").forEach(function (btn) {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "yes";
    btn.addEventListener("click", function () {
      openStoryById(btn.getAttribute("data-open-story"), btn);
    });
  });
}

// ---------- Moon vs Mars ----------

function renderCompare(objects, worlds) {
  var box = document.getElementById("compare-box");
  if (!box) return;
  box.innerHTML = "";

  WORLD_ORDER.forEach(function (planet) {
    var list = objectsOn(objects, planet).slice().sort(byYear);
    var card = makeEl("article", "world-card is-" + planet.toLowerCase());
    card.appendChild(makeEl("h3", "", planet === "Moon" ? "The Moon" : "Mars"));

    var dl = makeEl("dl", "world-facts");
    function row(label, value, groupStart) {
      var dt = makeEl("dt", groupStart ? "group-start" : "", label);
      var dd = makeEl("dd", groupStart ? "group-start" : "", showValue(value));
      dl.appendChild(dt);
      dl.appendChild(dd);
    }

    // From our collection
    var live = list.filter(function (o) { return o.statusType === "in-use"; });
    row("In this museum", list.length + " objects");
    row("First arrival", list.length ? list[0].name + " (" + list[0].year + ")" : null);
    row("Latest arrival", list.length ? list[list.length - 1].name + " (" + list[list.length - 1].year + ")" : null);
    row("Still in use", live.length ? live.length + " (" + live.map(function (o) { return o.name; }).join(", ") + ")" : "None. All are now silent.");

    // From the NASA fact sheet
    var world = worlds && worlds.worlds && worlds.worlds[planet];
    if (world && Array.isArray(worlds.rows)) {
      worlds.rows.forEach(function (r, i) {
        row(r.label, world.facts[r.key], i === 0);
      });
    }
    card.appendChild(dl);

    var src = makeEl("p", "world-source");
    if (world && isWebLink(world.source)) {
      src.appendChild(document.createTextNode("Planet facts: "));
      src.appendChild(makeLink(world.source, world.sourceName + " ↗"));
    } else {
      src.textContent = "Planet facts are not available right now.";
    }
    card.appendChild(src);
    box.appendChild(card);
  });
}

// ---------- Location explorer ----------

function hasCoordinates(o) {
  return !isMissing(o.latitude) && !isMissing(o.longitude) &&
         !isNaN(Number(o.latitude)) && !isNaN(Number(o.longitude));
}

function renderMap(objects) {
  var box = document.getElementById("map-box");
  if (!box) return;
  box.innerHTML = "";

  WORLD_ORDER.forEach(function (planet) {
    var view = MAP_VIEWS[planet];
    var all = objectsOn(objects, planet);
    var placed = all.filter(hasCoordinates);
    var missing = all.filter(function (o) { return !hasCoordinates(o); });

    var panel = makeEl("article", "map-panel is-" + planet.toLowerCase());
    panel.appendChild(makeEl("h3", "", planet === "Moon" ? "The Moon" : "Mars"));
    panel.appendChild(makeEl("p", "map-range", view.range));

    var grid = makeEl("div", "map-grid");
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", "Positions on " + planet + ". " + view.range);
    grid.appendChild(makeEl("div", "map-equator"));

    // Corner labels so the grid can be read
    [
      [view.latMax + "° N", { left: "4px", top: "2px" }],
      [Math.abs(view.latMin) + "° S", { left: "4px", bottom: "2px" }],
      [Math.abs(view.lonMin) + "° W", { left: "4px", top: "50%" }],
      [view.lonMax + "° E", { right: "4px", top: "50%" }]
    ].forEach(function (a) {
      var label = makeEl("span", "map-axis", a[0]);
      label.setAttribute("aria-hidden", "true");
      Object.keys(a[1]).forEach(function (k) { label.style[k] = a[1][k]; });
      grid.appendChild(label);
    });

    // Objects closer than ~0.1° share one marker (e.g. Eagle and the seismometer, 17 m apart)
    var groups = [];
    placed.forEach(function (o) {
      var key = Number(o.latitude).toFixed(1) + "," + Number(o.longitude).toFixed(1);
      var g = groups.filter(function (x) { return x.key === key; })[0];
      if (!g) { g = { key: key, items: [] }; groups.push(g); }
      g.items.push(o);
    });

    var tip = makeEl("span", "map-tip");
    tip.hidden = true;
    tip.setAttribute("aria-hidden", "true");

    groups.forEach(function (g) {
      var first = g.items[0];
      var x = (Number(first.longitude) - view.lonMin) / (view.lonMax - view.lonMin) * 100;
      var y = (view.latMax - Number(first.latitude)) / (view.latMax - view.latMin) * 100;
      if (x < 0 || x > 100 || y < 0 || y > 100) return; // outside this window (none today)

      var names = g.items.map(function (o) { return o.name; }).join(" + ");
      var dot = makeEl("button", "map-dot");
      dot.type = "button";
      dot.style.left = x + "%";
      dot.style.top = y + "%";
      dot.setAttribute("aria-label", names + ", " + formatLocation(first) + ". Open story.");
      function show() {
        tip.textContent = names;
        tip.style.left = x + "%";
        tip.style.top = y + "%";
        tip.hidden = false;
      }
      function hide() { tip.hidden = true; }
      dot.addEventListener("mouseenter", show);
      dot.addEventListener("focus", show);
      dot.addEventListener("mouseleave", hide);
      dot.addEventListener("blur", hide);
      dot.addEventListener("click", function () { openStory(first, dot); });
      grid.appendChild(dot);
    });
    grid.appendChild(tip);
    panel.appendChild(grid);

    // Text list of the same positions (also the accessible version of the map)
    var ul = makeEl("ul", "map-list");
    placed.slice().sort(function (a, b) { return Number(b.latitude) - Number(a.latitude); }).forEach(function (o) {
      var li = makeEl("li");
      var b = makeEl("button", "", o.name);
      b.type = "button";
      b.addEventListener("click", function () { openStory(o, b); });
      li.appendChild(b);
      li.appendChild(document.createTextNode(" · " + formatLocation(o)));
      ul.appendChild(li);
    });
    panel.appendChild(ul);

    if (missing.length) {
      panel.appendChild(makeEl("p", "map-missing",
        "Not plotted (no verified coordinates for that exact object): " +
        missing.map(function (o) { return o.name; }).join(", ") + "."));
    }
    box.appendChild(panel);
  });
}
