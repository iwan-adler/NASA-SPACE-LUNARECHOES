// Lunar Echoes - Mission Footprints Lab
// Real NASA images of landing sites, tracks and hardware. Each one answers: what is shown, which mission,
// which instrument (only if NASA names it), when, why, what scientists can learn, and what it cannot tell us.
// One before/after slider, only for a pair NASA describes as the same area with matched geometry (PIA22223).
// Data: data/footprints.json. Helpers from js/objects.js.

var fpState = { images: [], filter: "all", index: 0 };

function renderFootprints(data) {
  var box = document.getElementById("footprints-box");
  if (!box) return;
  box.innerHTML = "";
  box.removeAttribute("aria-busy");
  fpState.images = data && Array.isArray(data.images) ? data.images : [];
  if (!fpState.images.length) {
    box.appendChild(makeEl("p", "no-results", "The image lab is not available right now. Every object's story still has its photographs."));
    return;
  }

  var filters = makeEl("div", "fp-filters");
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", "Filter images");
  [["all", "All"], ["Moon", "Moon"], ["Mars", "Mars"], ["surface", "On the surface"], ["orbit", "From orbit"]].forEach(function (f) {
    var b = makeEl("button", "fp-filter", f[1]);
    b.type = "button";
    b.setAttribute("data-filter", f[0]);
    b.addEventListener("click", function () { fpState.filter = f[0]; drawFootprintStrip(true); });
    filters.appendChild(b);
  });
  box.appendChild(filters);
  var strip = makeEl("div", "fp-strip");
  strip.setAttribute("role", "group");
  strip.setAttribute("aria-label", "Choose an image");
  box.appendChild(strip);
  var sheet = makeEl("article", "fp-sheet");
  sheet.setAttribute("aria-live", "polite");
  box.appendChild(sheet);
  drawFootprintStrip(false);
}

function fpVisible() {
  return fpState.images.filter(function (im) {
    var f = fpState.filter;
    return f === "all" || im.planet === f || im.view === f;
  });
}

function drawFootprintStrip(selectFirst) {
  document.querySelectorAll(".fp-filter").forEach(function (b) {
    b.setAttribute("aria-pressed", b.getAttribute("data-filter") === fpState.filter ? "true" : "false");
  });
  var list = fpVisible();
  var strip = document.querySelector(".fp-strip");
  strip.innerHTML = "";
  if (selectFirst || fpState.images.indexOf(list[0]) < 0) fpState.index = fpState.images.indexOf(list[0]);
  if (list.indexOf(fpState.images[fpState.index]) < 0) fpState.index = fpState.images.indexOf(list[0]);
  list.forEach(function (im) {
    var i = fpState.images.indexOf(im);
    var b = makeEl("button", "fp-thumb planet-" + im.planet.toLowerCase());
    b.type = "button";
    b.setAttribute("aria-pressed", i === fpState.index ? "true" : "false");
    b.setAttribute("aria-label", im.title + " (" + im.planet + ")");
    var img = makeEl("img");
    img.src = im.image;
    img.alt = "";
    img.loading = "lazy";
    b.appendChild(img);
    var cap = makeEl("span", "fp-thumb-text");
    cap.appendChild(makeEl("span", "fp-thumb-tag", im.planet + " · " + (im.view === "orbit" ? "from orbit" : "surface") + (im.compare ? " · compare" : "")));
    cap.appendChild(makeEl("span", "fp-thumb-title", im.title));
    b.appendChild(cap);
    b.addEventListener("click", function () { fpState.index = i; drawFootprintStrip(false); });
    strip.appendChild(b);
  });
  drawFootprintSheet();
}

function drawFootprintSheet() {
  var im = fpState.images[fpState.index];
  var sheet = document.querySelector(".fp-sheet");
  sheet.innerHTML = "";
  sheet.className = "fp-sheet planet-" + im.planet.toLowerCase();

  var media = makeEl("figure", "fp-media");
  if (im.compare) media.appendChild(makeCompareSlider(im));
  else {
    var img = makeEl("img");
    img.src = im.image;
    img.alt = im.shows.v;
    media.appendChild(img);
  }
  var cap = makeEl("figcaption", "");
  cap.appendChild(document.createTextNode("Image: " + im.credit + " · "));
  cap.appendChild(makeLink(im.page, "NASA image record ↗"));
  media.appendChild(cap);
  sheet.appendChild(media);

  var info = makeEl("div", "fp-info");
  info.appendChild(makeEl("p", "fp-kicker", im.planet + " · " + (im.view === "orbit" ? "Seen from orbit" : "On the surface")));
  info.appendChild(makeEl("h3", "fp-title", im.title));
  var dl = makeEl("dl", "fp-fields");
  [["What is shown", im.shows], ["Mission / spacecraft", im.mission], ["Instrument", im.instrument], ["When", im.date],
   ["Why it was taken", im.why], ["What scientists can learn", im.learn]].forEach(function (r) {
    if (!r[1]) return;
    var dt = makeEl("dt", "", r[0] + " ");
    dt.appendChild(makeTag(r[1].k || "verified"));
    dl.appendChild(dt);
    dl.appendChild(makeEl("dd", "", r[1].v));
  });
  info.appendChild(dl);
  if (im.cannot) {
    var lim = makeEl("div", "fp-cannot");
    lim.appendChild(makeEl("h4", "", "What this image cannot tell us"));
    lim.appendChild(makeEl("p", "", im.cannot.v));
    info.appendChild(lim);
  }
  var acts = makeEl("div", "fp-actions");
  var o = findObject(im.objectId);
  if (o) {
    var b = makeEl("button", "btn btn-ghost", "Open the " + o.name + " record");
    b.type = "button";
    b.addEventListener("click", function () { openStory(o, b); });
    acts.appendChild(b);
  }
  info.appendChild(acts);
  sheet.appendChild(info);
}

// Before/after slider: the "after" image sits on top and is clipped by a range input (keyboard-accessible).
function makeCompareSlider(im) {
  var c = im.compare;
  var wrap = makeEl("div", "fp-compare");
  var before = makeEl("img", "fp-before");
  before.src = c.before.image;
  before.alt = "HiRISE image, " + c.before.label + " (" + c.before.obs + ")";
  var after = makeEl("img", "fp-after");
  after.src = c.after.image;
  after.alt = "HiRISE image, " + c.after.label + " (" + c.after.obs + ")";
  var line = makeEl("span", "fp-line");
  line.setAttribute("aria-hidden", "true");
  var lb = makeEl("span", "fp-lab fp-lab-before", c.before.label);
  var la = makeEl("span", "fp-lab fp-lab-after", c.after.label);
  var range = makeEl("input", "fp-range");
  range.type = "range";
  range.min = "0";
  range.max = "100";
  range.value = "50";
  range.setAttribute("aria-label", "Compare: slide left to show " + c.after.label + ", right to show " + c.before.label);
  function set(v) {
    after.style.clipPath = "inset(0 0 0 " + v + "%)";
    line.style.left = v + "%";
    range.setAttribute("aria-valuetext", v + "% showing " + c.before.label);
  }
  range.addEventListener("input", function () { set(range.value); });
  wrap.appendChild(before);
  wrap.appendChild(after);
  wrap.appendChild(line);
  wrap.appendChild(lb);
  wrap.appendChild(la);
  wrap.appendChild(range);
  set(50);
  var outer = makeEl("div", "");
  outer.appendChild(wrap);
  var basis = makeEl("p", "fp-basis");
  basis.appendChild(makeTag("verified"));
  basis.appendChild(document.createTextNode(" Why this comparison is fair: " + c.basis));
  outer.appendChild(basis);
  return outer;
}
