// Lunar Echoes - Future Landing Site Designer
// Visitors place a FICTIONAL landing site on a real NASA global map of the Moon or Mars.
// The page calculates real distances to the heritage objects in the archive (great-circle distance using
// the NSSDCA radius in data/worlds.json) and checks NASA's 2011 lunar recommendation (no overflight within
// 2.0 km of a U.S. heritage site). Terrain, resources and goals are the visitor's own assumptions, labelled
// as such: a global map at this scale cannot confirm slopes or boulders. Nothing is stored or sent.
// Uses data/heritage-map.json (basemaps, approximate positions) and helpers from js/objects.js.

var ldState = { world: "Moon", lat: null, lon: null, data: null, radius: {} };

var LD_OPTIONS = {
  goal: { label: "Main science goal", opts: ["Study ancient crust", "Study volcanic plains", "Look for signs of past water", "Look for ice", "Watch dust and weather", "Document a historic site from a distance"] },
  terrain: { label: "Terrain you expect", opts: ["Smooth plains", "Cratered ground", "Near slopes or cliffs", "I can't tell from this map"] },
  resources: { label: "Resources you hope for", opts: ["Steady sunlight for solar power", "Possible ice nearby", "Interesting rocks within driving distance", "Not sure"] },
  care: { label: "Environmental care", opts: ["Minimise blown dust and exhaust", "Avoid contaminating the site", "Leave no hardware behind", "No special measures"] }
};

function renderLanding(objects, mapData, worlds) {
  var box = document.getElementById("landing-box");
  if (!box) return;
  box.innerHTML = "";
  box.removeAttribute("aria-busy");
  if (!mapData || !mapData.basemaps) {
    box.appendChild(makeEl("p", "no-results", "The landing site designer needs the planetary maps, which could not be loaded."));
    return;
  }
  ldState.data = mapData;
  ["Moon", "Mars"].forEach(function (w) {
    var r = worlds && worlds.worlds && worlds.worlds[w] && worlds.worlds[w].facts.radius;
    ldState.radius[w] = r ? Number(String(r).replace(/[^\d.]/g, "")) : (w === "Moon" ? 1737 : 3390);
  });

  var banner = makeEl("p", "decision-disclaimer");
  banner.appendChild(makeTag("hypothetical"));
  banner.appendChild(makeEl("strong", "", " Fictional proposal. "));
  banner.appendChild(document.createTextNode("Distances to heritage sites are calculated from NASA records. Everything else is your own design assumption."));
  box.appendChild(banner);

  var tabs = makeEl("div", "hm-tabs ld-tabs");
  tabs.setAttribute("role", "group");
  tabs.setAttribute("aria-label", "Choose a world");
  ["Moon", "Mars"].forEach(function (w) {
    var b = makeEl("button", "hm-tab is-" + w.toLowerCase(), w === "Moon" ? "The Moon" : "Mars");
    b.type = "button";
    b.setAttribute("data-w", w);
    b.addEventListener("click", function () { ldState.world = w; ldState.lat = ldState.lon = null; ldDraw(); });
    tabs.appendChild(b);
  });
  box.appendChild(tabs);

  var layout = makeEl("div", "ld-layout");
  var left = makeEl("div", "ld-left");
  left.appendChild(makeEl("div", "ld-mapwrap"));
  var coords = makeEl("form", "ld-coords");
  coords.noValidate = true;
  coords.innerHTML = "";
  var latL = makeEl("label", "", "Latitude ");
  var lat = makeEl("input", "cap-input");
  lat.type = "number"; lat.min = "-90"; lat.max = "90"; lat.step = "0.1"; lat.name = "lat";
  latL.appendChild(lat);
  var lonL = makeEl("label", "", "Longitude (east +) ");
  var lon = makeEl("input", "cap-input");
  lon.type = "number"; lon.min = "-180"; lon.max = "180"; lon.step = "0.1"; lon.name = "lon";
  lonL.appendChild(lon);
  var go = makeEl("button", "btn btn-ghost", "Place site");
  go.type = "submit";
  coords.appendChild(latL);
  coords.appendChild(lonL);
  coords.appendChild(go);
  coords.addEventListener("submit", function (e) {
    e.preventDefault();
    var a = Number(lat.value), o = Number(lon.value);
    if (lat.value === "" || lon.value === "" || isNaN(a) || isNaN(o) || Math.abs(a) > 90 || Math.abs(o) > 180) {
      ldMsg("Enter a latitude between −90 and 90 and a longitude between −180 and 180.");
      return;
    }
    ldPlace(a, o);
  });
  left.appendChild(coords);
  left.appendChild(makeEl("p", "hm-credit ld-credit"));
  layout.appendChild(left);

  var right = makeEl("div", "ld-right");
  var form = makeEl("form", "ld-form");
  form.noValidate = true;
  var nameL = makeEl("label", "ld-field", "Name your site ");
  var name = makeEl("input", "cap-input");
  name.name = "site";
  name.maxLength = 50;
  name.placeholder = "e.g. Station Horizon";
  nameL.appendChild(name);
  form.appendChild(nameL);
  Object.keys(LD_OPTIONS).forEach(function (k) {
    var l = makeEl("label", "ld-field", LD_OPTIONS[k].label + " ");
    var sel = makeEl("select", "cap-input");
    sel.name = k;
    LD_OPTIONS[k].opts.forEach(function (o) { var op = makeEl("option", "", o); op.value = o; sel.appendChild(op); });
    l.appendChild(sel);
    form.appendChild(l);
  });
  var bufL = makeEl("label", "ld-field", "Your own distance buffer around heritage sites ");
  var buf = makeEl("select", "cap-input");
  buf.name = "buffer";
  [["2", "2 km"], ["10", "10 km"], ["50", "50 km"], ["0", "No buffer"]].forEach(function (b) { var op = makeEl("option", "", b[1]); op.value = b[0]; buf.appendChild(op); });
  bufL.appendChild(buf);
  form.appendChild(bufL);
  var genBtn = makeEl("button", "btn btn-primary", "Generate proposal");
  genBtn.type = "submit";
  form.appendChild(genBtn);
  form.addEventListener("submit", function (e) { e.preventDefault(); ldProposal(form); });
  right.appendChild(form);
  var msg = makeEl("p", "ld-msg");
  msg.setAttribute("aria-live", "polite");
  right.appendChild(msg);
  layout.appendChild(right);
  box.appendChild(layout);
  var out = makeEl("div", "ld-proposal");
  out.hidden = true;
  box.appendChild(out);
  ldDraw();
}

function ldMsg(t) { var m = document.querySelector(".ld-msg"); if (m) m.textContent = t; }

// Heritage objects on this world with a position (verified, or approximate with its basis)
function ldSites() {
  var approx = {};
  (ldState.data.approximate || []).forEach(function (a) { approx[a.id] = a; });
  return allObjects.filter(function (o) { return o.planet === ldState.world; }).map(function (o) {
    if (hasCoordinates(o)) return { o: o, lat: Number(o.latitude), lon: Number(o.longitude), approx: false };
    if (approx[o.id]) return { o: o, lat: approx[o.id].latitude, lon: approx[o.id].longitude, approx: true };
    return null;
  }).filter(Boolean);
}

function ldDistance(lat1, lon1, lat2, lon2, r) {
  var toR = Math.PI / 180;
  var dLat = (lat2 - lat1) * toR, dLon = (lon2 - lon1) * toR;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}

function ldDraw() {
  var w = ldState.world, base = ldState.data.basemaps[w];
  document.querySelectorAll(".ld-tabs .hm-tab").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-w") === w ? "true" : "false"); });
  var wrap = document.querySelector(".ld-mapwrap");
  wrap.innerHTML = "";
  var map = makeEl("div", "hm-map ld-map is-" + w.toLowerCase());
  map.style.aspectRatio = "2 / 1";
  map.style.backgroundImage = "url('" + base.image + "')";
  map.style.backgroundSize = "100% 100%";
  map.setAttribute("role", "img");
  map.setAttribute("aria-label", "Global map of " + w + ". Click to place your landing site, or type coordinates below.");
  for (var lon = -150; lon <= 150; lon += 30) { var g = makeEl("span", "hm-grid hm-grid-v" + (lon === 0 ? " is-zero" : "")); g.style.left = ((lon + 180) / 360 * 100) + "%"; map.appendChild(g); }
  for (var lat = -60; lat <= 60; lat += 30) { var gh = makeEl("span", "hm-grid hm-grid-h" + (lat === 0 ? " is-zero" : "")); gh.style.top = ((90 - lat) / 180 * 100) + "%"; map.appendChild(gh); }
  ldSites().forEach(function (s) {
    var m = makeEl("span", "ld-heritage" + (s.approx ? " is-approx" : ""));
    m.style.left = ((s.lon + 180) / 360 * 100) + "%";
    m.style.top = ((90 - s.lat) / 180 * 100) + "%";
    m.title = s.o.name + (s.approx ? " (approximate)" : "");
    map.appendChild(m);
  });
  if (ldState.lat != null) {
    var pin = makeEl("span", "ld-pin");
    pin.style.left = ((ldState.lon + 180) / 360 * 100) + "%";
    pin.style.top = ((90 - ldState.lat) / 180 * 100) + "%";
    map.appendChild(pin);
  }
  map.addEventListener("click", function (e) {
    var r = map.getBoundingClientRect();
    var lonC = (e.clientX - r.left) / r.width * 360 - 180;
    var latC = 90 - (e.clientY - r.top) / r.height * 180;
    ldPlace(Math.round(latC * 10) / 10, Math.round(lonC * 10) / 10);
  });
  wrap.appendChild(map);
  var legend = makeEl("p", "ld-legend");
  legend.innerHTML = "";
  legend.appendChild(makeEl("span", "ld-key ld-key-h"));
  legend.appendChild(document.createTextNode(" Heritage objects from the archive   "));
  legend.appendChild(makeEl("span", "ld-key ld-key-p"));
  legend.appendChild(document.createTextNode(" Your proposed site"));
  wrap.appendChild(legend);
  var cred = document.querySelector(".ld-credit");
  cred.innerHTML = "";
  cred.appendChild(makeLink(base.url, base.credit + " ↗"));
  cred.appendChild(document.createTextNode(". Whole planet, equirectangular projection."));
  var form = document.querySelector(".ld-coords");
  if (form) { form.lat.value = ldState.lat == null ? "" : ldState.lat; form.lon.value = ldState.lon == null ? "" : ldState.lon; }
  ldNearest();
}

function ldPlace(lat, lon) {
  ldState.lat = lat;
  ldState.lon = lon;
  ldDraw();
  var p = document.querySelector(".ld-proposal");
  if (p) p.hidden = true;
}

function ldNearest() {
  if (ldState.lat == null) { ldMsg("Click the map or type coordinates to place your landing site."); return null; }
  var r = ldState.radius[ldState.world];
  var list = ldSites().map(function (s) { s.km = ldDistance(ldState.lat, ldState.lon, s.lat, s.lon, r); return s; })
    .sort(function (a, b) { return a.km - b.km; });
  var n = list[0];
  ldMsg("Site placed at " + formatLocation({ latitude: ldState.lat, longitude: ldState.lon }) + ". Nearest heritage object: " +
    (n ? n.o.name + ", about " + ldKm(n.km) + " away." : "none on this world."));
  return list;
}

function ldKm(km) { return km < 10 ? km.toFixed(1) + " km" : Math.round(km).toLocaleString("en-GB") + " km"; }

function ldProposal(form) {
  var list = ldNearest();
  if (!list) return;
  var v = {};
  ["site", "goal", "terrain", "resources", "care", "buffer"].forEach(function (k) { v[k] = form[k].value.trim(); });
  var name = v.site || "Unnamed site";
  var nearest = list[0];
  var buffer = Number(v.buffer);
  var out = document.querySelector(".ld-proposal");
  out.hidden = false;
  out.innerHTML = "";
  var h = makeEl("h3", "", "Landing site proposal: " + name);
  h.tabIndex = -1;
  out.appendChild(h);
  out.appendChild(makeEl("p", "ld-sub", ldState.world + " · " + formatLocation({ latitude: ldState.lat, longitude: ldState.lon }) + " · fictional proposal"));

  // Heritage check (calculated)
  var hc = makeEl("div", "ld-block");
  var hh = makeEl("h4", "", "Heritage check ");
  hh.appendChild(makeTag("verified"));
  hc.appendChild(hh);
  var ul = makeEl("ul", "");
  list.slice(0, 4).forEach(function (s) {
    ul.appendChild(makeEl("li", "", s.o.name + ": about " + ldKm(s.km) + (s.approx ? " (its position is approximate)" : "")));
  });
  hc.appendChild(ul);
  hc.appendChild(makeEl("p", "ld-note", "Great-circle distances calculated by this page from NSSDCA coordinates and the NSSDCA radius (" + ldState.radius[ldState.world].toLocaleString("en-GB") + " km)."));
  if (ldState.world === "Moon") {
    var rec = makeEl("p", "");
    if (nearest && nearest.km < 2) rec.appendChild(document.createTextNode("Your site is within 2.0 km of " + nearest.o.name + ". NASA's 2011 guidance recommends that landers not fly over a U.S. heritage site within 2.0 km. "));
    else rec.appendChild(document.createTextNode("Your site is more than 2.0 km from every U.S. heritage site in this archive, outside the no-overflight distance in NASA's 2011 guidance. "));
    rec.appendChild(makeLink("https://www.nasa.gov/wp-content/uploads/2017/10/617743main_nasa-usg_lunar_historic_sites_reva-508.pdf", "NASA's Recommendations (2011) ↗"));
    hc.appendChild(rec);
  } else {
    hc.appendChild(makeEl("p", "", "We found no NASA heritage guidance for Mars hardware in our sources, so the distance rule here is your own choice."));
  }
  if (nearest && buffer > 0) {
    hc.appendChild(makeEl("p", "", nearest.km < buffer
      ? "Your own " + buffer + " km buffer is NOT met: the nearest heritage object is only " + ldKm(nearest.km) + " away."
      : "Your own " + buffer + " km buffer is met."));
  }
  out.appendChild(hc);

  // Visitor's design assumptions
  var as = makeEl("div", "ld-block");
  var ah = makeEl("h4", "", "Your design assumptions ");
  ah.appendChild(makeTag("hypothetical"));
  as.appendChild(ah);
  var dl = makeEl("dl", "ld-dl");
  ["goal", "terrain", "resources", "care"].forEach(function (k) {
    dl.appendChild(makeEl("dt", "", LD_OPTIONS[k].label));
    dl.appendChild(makeEl("dd", "", v[k]));
  });
  as.appendChild(dl);
  as.appendChild(makeEl("p", "ld-note", "A global map at this scale cannot confirm terrain, slopes, boulders or resources. Real missions choose sites using high-resolution orbital images."));
  out.appendChild(as);

  // Trade-offs (interpretation)
  var tr = makeEl("div", "ld-block");
  var th = makeEl("h4", "", "Trade-offs to weigh ");
  th.appendChild(makeTag("interpretation"));
  tr.appendChild(th);
  var tl = makeEl("ul", "");
  function t(x) { tl.appendChild(makeEl("li", "", x)); }
  if (nearest && nearest.km < 50) t("Being close to " + nearest.o.name + " could let you study how hardware has aged, but landing exhaust and blown dust could also change a historic site.");
  else if (nearest) t("Landing far from heritage sites protects them, but you give up the chance to study old hardware up close.");
  if (v.goal === "Document a historic site from a distance") t("Documenting from a distance is the least intrusive option, but it shows less detail than a close look.");
  if (v.terrain === "I can't tell from this map") t("You cannot judge landing safety yet: you would need detailed orbital images before committing.");
  if (v.terrain === "Near slopes or cliffs") t("Slopes can expose interesting rock layers, but they make landing and driving riskier.");
  if (v.resources === "Steady sunlight for solar power" && Math.abs(ldState.lat) > 60) t("At high latitudes the Sun stays low, so steady solar power is harder to count on.");
  if (v.resources === "Possible ice nearby") t("Ice could be a resource and a science target, but you would need evidence that it is really there.");
  if (v.care === "No special measures") t("Without care measures, your own mission could leave dust, exhaust or debris that future explorers have to deal with.");
  if (v.care === "Leave no hardware behind") t("Leaving nothing behind is the cleanest choice, but it means bringing everything home or carrying it on, at extra cost.");
  if (ldState.world === "Mars") t("On Mars, dust settles on everything over time: solar panels and the site itself will change.");
  if (!tl.children.length) t("Every choice here trades science, safety and preservation. Try another location and compare.");
  tr.appendChild(tl);
  out.appendChild(tr);

  var acts = makeEl("div", "cap-actions");
  var pr = makeEl("button", "btn btn-ghost", "Print proposal");
  pr.type = "button";
  pr.addEventListener("click", function () { ldPrint(out); });
  acts.appendChild(pr);
  out.appendChild(acts);
  out.appendChild(makeEl("p", "cap-disclaimer", "An educational, fictional proposal. It is not NASA policy or a real mission plan."));
  h.focus();
  if (typeof logbookAdd === "function") logbookAdd("landing", ldState.world + ":" + ldState.lat + "," + ldState.lon, "Proposed a " + ldState.world + " landing site: " + name + " (" + formatLocation({ latitude: ldState.lat, longitude: ldState.lon }) + ")");
}

function ldPrint(out) {
  var clone = out.cloneNode(true);
  clone.querySelectorAll(".cap-actions").forEach(function (n) { n.remove(); });
  var html = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>Landing site proposal</title><style>body{font:14px/1.5 system-ui,sans-serif;max-width:780px;margin:24px auto;padding:0 16px;color:#111}.ev-tag{border:1px solid #333;border-radius:4px;font-size:10px;padding:0 4px;text-transform:uppercase}dt{font-weight:600}dd{margin:0 0 6px}</style></head><body>" +
    clone.innerHTML + "<p><small>LUNAR ECHOES is an independent educational project developed for NASA Space Apps Challenge. It is not affiliated with, operated by or endorsed by NASA.</small></p><script>window.onload=function(){window.print()}<\/script></body></html>";
  var url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  if (!window.open(url, "_blank")) ldMsg("Your browser blocked the print window. Allow pop-ups to print.");
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}
