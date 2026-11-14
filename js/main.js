// Lunar Echoes - main entry point
// Loads data/objects.json and hands it to the other modules.

async function loadObjects() {
  const response = await fetch("data/objects.json");
  if (!response.ok) {
    throw new Error("Could not load data/objects.json");
  }
  return response.json();
}

async function startApp() {
  try {
    const data = await loadObjects();
    renderObjects(data.objects);   // from js/objects.js
    renderTimeline(data.objects);  // from js/timeline.js
    startQuiz(data.objects);       // from js/quiz.js
  } catch (error) {
    console.error(error);
    document.getElementById("objects-list").textContent =
      "Could not load data. Open this site with a local server (see README).";
  }
}

document.addEventListener("DOMContentLoaded", startApp);
