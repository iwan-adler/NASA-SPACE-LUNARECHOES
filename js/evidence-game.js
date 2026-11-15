// Lunar Echoes - Evidence or Assumption?
// A short reasoning game: read a piece of NASA evidence, then decide whether it supports a claim,
// contradicts it, or is not enough to decide. Rewards careful reasoning, not memory:
// the evidence is always on screen. Data: data/evidence-game.json. Helpers from js/objects.js.

var egState = { data: null, deck: [], i: 0, score: 0, careful: 0, log: [] };

function renderEvidenceGame(data) {
  var box = document.getElementById("evidence-box");
  if (!box) return;
  box.removeAttribute("aria-busy");
  if (!data || !Array.isArray(data.claims) || !data.claims.length) {
    box.innerHTML = "";
    box.appendChild(makeEl("p", "no-results", "The reasoning game is not available right now."));
    return;
  }
  egState.data = data;
  egStart();
}

function egShuffle(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function egStart() {
  var n = Math.min(egState.data.rounds || 6, egState.data.claims.length);
  egState.deck = egShuffle(egState.data.claims).slice(0, n);
  egState.i = 0;
  egState.score = 0;
  egState.careful = 0;
  egState.log = [];
  egRound(false);
}

function egRound(focus) {
  var box = document.getElementById("evidence-box");
  box.innerHTML = "";
  var c = egState.deck[egState.i];
  var card = makeEl("div", "eg-card");
  card.appendChild(makeEl("p", "eg-progress", "Claim " + (egState.i + 1) + " of " + egState.deck.length + " · careful calls so far: " + egState.score));

  var ev = makeEl("blockquote", "eg-evidence");
  ev.appendChild(makeEl("span", "eg-label", "The evidence"));
  var evp = makeEl("p", "");
  evp.appendChild(makeTag("verified"));
  evp.appendChild(document.createTextNode(" " + c.evidence));
  ev.appendChild(evp);
  var src = makeEl("p", "evidence-source", "Source: ");
  src.appendChild(makeLink(c.sourceUrl, c.sourceName + " ↗"));
  ev.appendChild(src);
  card.appendChild(ev);

  var claim = makeEl("p", "eg-claim");
  claim.appendChild(makeEl("span", "eg-label", "The claim"));
  var q = makeEl("span", "eg-claim-text", "“" + c.claim + "”");
  q.tabIndex = -1;
  claim.appendChild(q);
  card.appendChild(claim);

  var group = makeEl("div", "eg-choices");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Is the claim supported?");
  var fb = makeEl("div", "eg-feedback");
  fb.setAttribute("aria-live", "polite");
  egState.data.answers.forEach(function (a) {
    var b = makeEl("button", "eg-choice eg-" + a.id, a.label);
    b.type = "button";
    b.addEventListener("click", function () {
      var right = a.id === c.answer;
      group.querySelectorAll("button").forEach(function (x) {
        x.disabled = true;
        if (x.classList.contains("eg-" + c.answer)) x.classList.add("is-answer");
      });
      if (!right) b.classList.add("is-wrong");
      if (right) egState.score++;
      if (right && c.answer === "insufficient") egState.careful++;
      egState.log.push({ claim: c.claim, chosen: a.label, right: right, answer: c.answer });
      var answerLabel = egState.data.answers.filter(function (x) { return x.id === c.answer; })[0].label;
      fb.appendChild(makeEl("p", "eg-verdict " + (right ? "is-right" : "is-off"),
        (right ? "✓ Careful reasoning. " : "✗ Look again: ") + answerLabel + "."));
      var ex = makeEl("p", "");
      ex.appendChild(makeTag("interpretation"));
      ex.appendChild(document.createTextNode(" " + c.explain));
      fb.appendChild(ex);
      var next = makeEl("button", "btn btn-primary", egState.i + 1 < egState.deck.length ? "Next claim →" : "See how you reasoned");
      next.type = "button";
      next.addEventListener("click", function () {
        egState.i++;
        if (egState.i < egState.deck.length) egRound(true); else egSummary();
      });
      fb.appendChild(next);
      next.focus({ preventScroll: true });
    });
    group.appendChild(b);
  });
  card.appendChild(group);
  card.appendChild(fb);
  box.appendChild(card);
  if (focus) q.focus({ preventScroll: true });
}

function egSummary() {
  var box = document.getElementById("evidence-box");
  box.innerHTML = "";
  var card = makeEl("div", "eg-card eg-summary");
  var h = makeEl("h3", "", "You made " + egState.score + " careful calls out of " + egState.deck.length);
  h.tabIndex = -1;
  card.appendChild(h);
  var insuff = egState.deck.filter(function (c) { return c.answer === "insufficient"; }).length;
  if (insuff) {
    card.appendChild(makeEl("p", "", "You spotted " + egState.careful + " of " + insuff + " claims where the honest answer was \"insufficient evidence\". Knowing when not to conclude is one of a scientist's most important skills."));
  }
  var ul = makeEl("ul", "eg-log");
  egState.log.forEach(function (l) {
    ul.appendChild(makeEl("li", l.right ? "is-right" : "is-off", (l.right ? "✓ " : "✗ ") + l.claim + " → you said: " + l.chosen));
  });
  card.appendChild(ul);
  var again = makeEl("button", "btn btn-primary", "Play a new set of claims");
  again.type = "button";
  again.addEventListener("click", function () { egStart(); });
  card.appendChild(again);
  box.appendChild(card);
  h.focus({ preventScroll: true });
}
