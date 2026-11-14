// Lunar Echoes - main entry point
// Loads data/objects.json and hands the records to the other modules.

// Fetches the data file and checks it has the expected shape.
async function loadObjects() {
  var response = await fetch("data/objects.json");
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

// Planet facts for the comparison. Optional: if this fails, the rest still works.
async function loadWorlds() {
  try {
    var response = await fetch("data/worlds.json");
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.warn("data/worlds.json could not be loaded:", e);
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
  ["objects-list", "timeline-list", "compare-box", "map-box", "quiz-box"].forEach(function (id, i) {
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
  var worldsPromise = loadWorlds(); // load both files at the same time
  try {
    objects = await loadObjects();
  } catch (error) {
    showLoadError(error);
    return;
  }
  var worlds = await worldsPromise;

  // Each part runs separately, so one bug does not break the others.
  [
    ["Object explorer", function () { renderObjects(objects); }],      // js/objects.js
    ["Timeline", function () { renderTimeline(objects); }],            // js/timeline.js
    ["Explore", function () { renderExplore(objects, worlds); }],      // js/explore.js
    ["Quiz", function () { startQuiz(objects); }]                      // js/quiz.js
  ].forEach(function (part) {
    try {
      part[1]();
    } catch (error) {
      console.error(part[0] + " failed:", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", startApp);
