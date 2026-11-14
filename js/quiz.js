// Lunar Echoes - Quiz
// Builds five multiple-choice questions ONLY from facts in data/objects.json,
// so the quiz never invents information. Wrong answers come from other records.

var QUIZ_LENGTH = 5;
var quizObjects = [];
var quizQuestions = [];
var quizIndex = 0;
var quizScore = 0;

// Fisher-Yates shuffle (returns a new array)
function shuffle(array) {
  var copy = array.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

// Unique, non-missing values of one field, excluding the right answer.
function wrongAnswers(field, answer, objects) {
  var seen = {};
  var result = [];
  objects.forEach(function (item) {
    if (isMissing(item[field])) return;
    var value = String(item[field]).trim();
    if (value.toLowerCase() === String(answer).toLowerCase() || seen[value]) return;
    seen[value] = true;
    result.push(value);
  });
  return shuffle(result).slice(0, 3);
}

// Question types. Each uses only fields that exist on the record.
// `ask` = the question, `field` = where the answer and wrong answers come from.
var QUESTION_TYPES = [
  { needs: ["name", "mission"], field: "mission",
    ask: function (o) { return "Which mission left behind the " + o.name + "?"; } },
  { needs: ["name", "planet"], field: "planet",
    ask: function (o) { return "Where can you find the " + o.name + " today?"; } },
  { needs: ["mission", "year"], field: "year",
    ask: function (o) { return "In which year did " + o.mission + " take place?"; } },
  { needs: ["name", "purpose"], field: "purpose",
    ask: function (o) { return "What was the original purpose of the " + o.name + "?"; } },
  { needs: ["mission", "name"], field: "name",
    ask: function (o) { return "Which of these objects was part of " + o.mission + "?"; },
    // Wrong answers must come from OTHER missions, or they could also be correct
    pool: function (o, all) {
      return all.filter(function (x) { return String(x.mission) !== String(o.mission); });
    } }
];

// Makes every possible question, then picks up to five, preferring different objects.
function buildQuestions(objects) {
  var candidates = [];
  objects.forEach(function (item) {
    QUESTION_TYPES.forEach(function (type) {
      var hasFields = type.needs.every(function (f) { return !isMissing(item[f]); });
      if (!hasFields) return;
      var answer = String(item[type.field]).trim();
      var pool = type.pool ? type.pool(item, objects) : objects;
      var wrong = wrongAnswers(type.field, answer, pool);
      if (wrong.length === 0) return; // need at least one wrong option
      candidates.push({
        objectId: item.id,
        typeIndex: QUESTION_TYPES.indexOf(type),
        text: type.ask(item),
        answer: answer,
        options: shuffle(wrong.concat([answer]))
      });
    });
  });

  // Prefer a mix: new object AND new question type first, then fill up.
  var chosen = [];
  var usedObjects = {};
  var usedTypes = {};
  shuffle(candidates).forEach(function (q) {
    if (chosen.length < QUIZ_LENGTH && !usedObjects[q.objectId] && !usedTypes[q.typeIndex]) {
      chosen.push(q);
      usedObjects[q.objectId] = true;
      usedTypes[q.typeIndex] = true;
    }
  });
  shuffle(candidates).forEach(function (q) {
    if (chosen.length < QUIZ_LENGTH && chosen.indexOf(q) === -1) chosen.push(q);
  });
  return chosen;
}

// Called from main.js
function startQuiz(objects) {
  quizObjects = objects;
  quizQuestions = buildQuestions(objects);
  quizIndex = 0;
  quizScore = 0;

  var box = document.getElementById("quiz-box");
  box.innerHTML = "";

  if (quizQuestions.length === 0) {
    box.appendChild(makeEl("p", "quiz-empty",
      "The quiz needs at least two complete equipment records. Add more to data/objects.json."));
    return;
  }
  showQuestion();
}

// CSS classes to style: .quiz-progress, .quiz-question, .quiz-options, .quiz-option,
// .quiz-option.correct, .quiz-option.wrong, .quiz-feedback, .quiz-next, .quiz-score
function showQuestion() {
  var box = document.getElementById("quiz-box");
  var q = quizQuestions[quizIndex];
  box.innerHTML = "";

  box.appendChild(makeEl("p", "quiz-progress",
    "Question " + (quizIndex + 1) + " of " + quizQuestions.length));
  var heading = makeEl("h3", "quiz-question", q.text);
  heading.tabIndex = -1; // lets us move focus here for keyboard users
  box.appendChild(heading);

  var optionsWrap = makeEl("div", "quiz-options");
  optionsWrap.setAttribute("role", "group");
  optionsWrap.setAttribute("aria-label", "Answer options");

  var feedback = makeEl("p", "quiz-feedback");
  feedback.setAttribute("aria-live", "polite");

  q.options.forEach(function (option) {
    var btn = makeEl("button", "quiz-option", option);
    btn.type = "button";
    btn.style.display = "block";
    btn.style.margin = "0.4rem 0";
    btn.addEventListener("click", function () {
      answerQuestion(btn, option, optionsWrap, feedback);
    });
    optionsWrap.appendChild(btn);
  });

  box.appendChild(optionsWrap);
  box.appendChild(feedback);
  if (quizIndex > 0) heading.focus();
}

function answerQuestion(clicked, chosen, optionsWrap, feedback) {
  var q = quizQuestions[quizIndex];
  var correct = chosen === q.answer;
  if (correct) quizScore++;

  // Lock the options and mark right/wrong with text, not just colour
  optionsWrap.querySelectorAll(".quiz-option").forEach(function (btn) {
    btn.disabled = true;
    if (btn.textContent === q.answer) {
      btn.classList.add("correct");
      btn.textContent = "✓ " + btn.textContent;
    }
  });
  if (!correct) {
    clicked.classList.add("wrong");
    clicked.textContent = "✗ " + clicked.textContent;
  }

  feedback.textContent = correct
    ? "Correct! Great job, explorer."
    : "Not quite. The right answer is: " + q.answer;

  var isLast = quizIndex === quizQuestions.length - 1;
  var next = makeEl("button", "quiz-next", isLast ? "See my score" : "Next question");
  next.type = "button";
  next.addEventListener("click", function () {
    quizIndex++;
    if (isLast) showScore();
    else showQuestion();
  });
  feedback.parentNode.appendChild(next);
  next.focus();
}

function showScore() {
  var box = document.getElementById("quiz-box");
  box.innerHTML = "";

  var total = quizQuestions.length;
  var result = makeEl("h3", "quiz-score", "You scored " + quizScore + " out of " + total + "!");
  result.tabIndex = -1;
  box.appendChild(result);

  var message;
  if (quizScore === total) message = "Perfect score! You are a true space historian.";
  else if (quizScore >= total / 2) message = "Nice work! Explore the object stories to learn even more.";
  else message = "Good try! Read a few object stories above and try again.";
  box.appendChild(makeEl("p", "quiz-message", message));

  if (total < QUIZ_LENGTH) {
    box.appendChild(makeEl("p", "quiz-note",
      "(Only " + total + " question(s) could be made from the current data.)"));
  }

  var again = makeEl("button", "quiz-restart", "Play again");
  again.type = "button";
  again.addEventListener("click", function () {
    startQuiz(quizObjects);
  });
  box.appendChild(again);
  result.focus();
}
