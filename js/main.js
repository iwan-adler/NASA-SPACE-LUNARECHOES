// Lunar Echoes - main entry point
// Loads data/objects.json and hands the records to the other modules.

// Fetches the data file and checks it has the expected shape.
async function loadObjects() {
  var response = await fetch("data/objects.json", { cache: "no-cache" }); // always re-check for updated data
  if (!response.ok) {
    throw new Error("data/objects.json could not be loaded (HTTP " + response.status + ").");
  }

  var data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error("data/objects.json is not valid JSON. Check for a missing comma or quote.");
  }

  // Accept either { "objects": [...] } or a plain [...] array
  var objects = Array.isArray(data) ? data : data && data.objects;
  if (!Array.isArray(objects)) {
    throw new Error('data/objects.json needs an "objects" list.');
  }
  return objects;
}

// Optional data files (planet facts, case files, scenario). If one fails, the rest still works.
async function loadOptional(path) {
  try {
    var response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.warn(path + " could not be loaded:", e);
    return null;
  }
}

// Shows a friendly error in every section instead of a blank page.
function showLoadError(error) {
  console.error(error);
  var message = "Sorry, the museum archive could not be loaded. " + error.message;
  if (location.protocol === "file:") {
    message += " Open the site through a local server (see README).";
  }
  ["case-shelf", "objects-list", "decision-box", "ethics-box", "timeline-list", "signal-box", "footprints-box", "evidence-box", "compare-box", "map-box", "quiz-box", "beyond-box"].forEach(function (id, i) {
    var el = document.getElementById(id);
    if (el) {
      el.innerHTML = "";
      el.removeAttribute("aria-busy");
      var p = document.createElement(el.tagName === "OL" ? "li" : "p");
      p.className = "load-error";
      if (i === 0) p.setAttribute("role", "alert"); // announce once, not five times
      p.textContent = message;
      el.appendChild(p);
    }
  });
  var stats = document.getElementById("hero-stats");
  if (stats) stats.hidden = true;
}

async function startApp() {
  var objects;
  // Load all files at the same time
  var worldsPromise = loadOptional("data/worlds.json");
  var casesPromise = loadOptional("data/cases.json");
  var decisionPromise = loadOptional("data/decision.json");
  var citizenPromise = loadOptional("data/citizen-science.json");
  var learningPromise = loadOptional("data/beyond-learning.json");
  var signalPromise = loadOptional("data/last-signal.json");
  var mapPromise = loadOptional("data/heritage-map.json");
  var footprintsPromise = loadOptional("data/footprints.json");
  var egPromise = loadOptional("data/evidence-game.json");
  var ethicsPromise = loadOptional("data/ethics.json");
  try {
    objects = await loadObjects();
  } catch (error) {
    showLoadError(error);
    return;
  }
  var worlds = await worldsPromise;
  var cases = await casesPromise;
  var decision = await decisionPromise;
  var citizen = await citizenPromise;
  var learning = await learningPromise;
  var signal = await signalPromise;
  var mapData = await mapPromise;
  var footprints = await footprintsPromise;
  var evidenceGame = await egPromise;
  var ethics = await ethicsPromise;

  // Each part runs separately, so one bug does not break the others.
  [
    ["Object explorer", function () { renderObjects(objects); }],      // js/objects.js
    ["Evidence room", function () { renderCases(objects, cases); }],   // js/cases.js
    ["Future explorer", function () { renderDecision(objects, decision); }], // js/cases.js
    ["Ethics", function () { renderEthics(ethics); }],                 // js/ethics.js
    ["Timeline", function () { renderTimeline(objects); }],            // js/timeline.js
    ["Last signal", function () { renderLastSignal(objects, signal); }], // js/last-signal.js
    ["Explore", function () { renderExplore(objects, worlds); }],      // js/explore.js
    ["Heritage map", function () { renderHeritageMap(objects, mapData); }], // js/heritage-map.js (replaces the simple grid)
    ["Footprints lab", function () { renderFootprints(footprints); }],  // js/footprints.js
    ["Evidence game", function () { renderEvidenceGame(evidenceGame); }], // js/evidence-game.js
    ["Quiz", function () { startQuiz(objects); }],                     // js/quiz.js
    ["Citizen science", function () { renderCitizenScience(citizen); }], // js/citizen.js
    ["Beyond extras", function () { renderBeyondExtras(learning); }]     // js/beyond-extras.js (after citizen.js)
  ].forEach(function (part) {
    try {
      part[1]();
    } catch (error) {
      console.error(part[0] + " failed:", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", startApp);
