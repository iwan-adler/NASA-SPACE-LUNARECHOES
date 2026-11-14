// Lunar Echoes - quiz
// Placeholder: shows a simple message until quiz questions are written.
// TODO: build questions only from facts listed in docs/research-sources.md.

function startQuiz(objects) {
  const box = document.getElementById("quiz-box");
  box.textContent =
    "Quiz coming soon! (" + objects.length + " objects loaded so far)";
}
