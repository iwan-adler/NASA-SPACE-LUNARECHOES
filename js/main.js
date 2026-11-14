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

// Shows a friendly error in every section instead of a blank page.
function showLoadError(error) {
  console.error(error);
  var message = "Sorry, the equipment data could not be loaded. " + error.message;
  if (location.protocol === "file:") {
    message += " Open the site through a local server (see README).";
  }
  ["objects-list", "timeline-list", "quiz-box"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.innerHTML = "";
      var p = document.createElement("p");
      p.className = "load-error";
      p.setAttribute("role", "alert");
      p.textContent = message;
      el.appendChild(p);
    }
  });
}

async function startApp() {
  var objects;
  try {
    objects = await loadObjects();
  } catch (error) {
    showLoadError(error);
    return;
  }

  // Each part runs separately, so one bug does not break the others.
  [
    ["Object explorer", renderObjects],   // js/objects.js
    ["Timeline", renderTimeline],         // js/timeline.js
    ["Quiz", startQuiz]                   // js/quiz.js
  ].forEach(function (part) {
    try {
      part[1](objects);
    } catch (error) {
      console.error(part[0] + " failed:", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", startApp);
