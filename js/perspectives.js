// Lunar Echoes - One Mission, Four Perspectives
// Adds a perspective switcher to every object story (heritage passport): Engineer, Scientist,
// Historian, Future explorer. It only re-frames facts already in data/objects.json (each labelled as
// before); the guiding questions are prompts, not claims. Called from openStory() in js/objects.js.

var PERSPECTIVES = [
  {
    id: "engineer", name: "Engineer",
    question: "How was it designed and built, and how did it hold up?",
    prompt: "Look for the design choice that mattered most. What would you change for the next one?",
    parts: function (o) {
      return [
        ["What it was built to do", o.purpose, "verified"],
        ["Type of hardware", o.category, "verified"],
        ["How it performed and ended", o.fate, "verified"]
      ];
    }
  },
  {
    id: "scientist", name: "Scientist",
    question: "What did it investigate, and what did we learn?",
    prompt: "Which measurement would you most like to repeat today, and why?",
    parts: function (o) {
      return [
        ["What it investigated", o.science, "verified"],
        ["Where it worked", o.site, "verified"],
        ["Status of the experiment today", o.status, "verified"]
      ];
    }
  },
  {
    id: "historian", name: "Historian",
    question: "Why does this mission matter in the story of exploration?",
    prompt: "What would be lost from the story if this object had never flown?",
    parts: function (o) {
      return [
        ["The mission", o.story, "verified"],
        ["Its legacy", o.legacy, "verified"],
        ["Key dates", (o.events || []).map(function (e) { return formatDate(e.date) + ": " + e.label; }), "verified"]
      ];
    }
  },
  {
    id: "future", name: "Future explorer",
    question: "What should be preserved for future generations?",
    prompt: "If you landed nearby one day, what would you do, and what would you leave untouched?",
    parts: function (o) {
      var h = o.heritage || {};
      return [
        ["What is documented about its site", h.verified, "verified", h.source],
        ["Why it may matter", h.interpretation, "interpretation"],
        ["Where it rests today", o.status, "verified"]
      ];
    }
  }
];

function makePerspectives(item) {
  var box = makeEl("section", "persp");
  box.setAttribute("aria-label", "One mission, four perspectives");
  var head = makeEl("div", "persp-head");
  head.appendChild(makeEl("h3", "persp-title", "One mission, four perspectives"));
  head.appendChild(makeEl("p", "persp-intro", "See the same object through four sets of eyes."));
  box.appendChild(head);

  var tabs = makeEl("div", "persp-tabs");
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Perspectives");
  var panel = makeEl("div", "persp-panel");
  panel.setAttribute("role", "tabpanel");
  panel.tabIndex = 0;
  box.appendChild(tabs);
  box.appendChild(panel);

  var buttons = [];
  function show(i, focus) {
    var p = PERSPECTIVES[i];
    buttons.forEach(function (b, j) {
      b.setAttribute("aria-selected", j === i ? "true" : "false");
      b.tabIndex = j === i ? 0 : -1;
    });
    panel.id = "persp-panel-" + item.id;
    buttons[i].setAttribute("aria-controls", panel.id);
    panel.setAttribute("aria-labelledby", buttons[i].id);
    panel.className = "persp-panel is-" + p.id;
    panel.innerHTML = "";
    panel.appendChild(makeEl("p", "persp-question", p.question));
    var dl = makeEl("dl", "persp-facts");
    p.parts(item).forEach(function (part) {
      var val = part[1];
      if (isMissing(val) || (Array.isArray(val) && !val.length)) return;
      var dt = makeEl("dt", "", part[0] + " ");
      dt.appendChild(makeTag(part[2]));
      dl.appendChild(dt);
      var dd = makeEl("dd", "");
      if (Array.isArray(val)) {
        var ul = makeEl("ul", "");
        val.forEach(function (v) { ul.appendChild(makeEl("li", "", v)); });
        dd.appendChild(ul);
      } else {
        dd.appendChild(document.createTextNode(String(val)));
      }
      if (part[3] && isWebLink(part[3].url)) {
        dd.appendChild(document.createTextNode(" "));
        dd.appendChild(makeLink(part[3].url, part[3].name + " ↗"));
      }
      dl.appendChild(dd);
    });
    panel.appendChild(dl);
    var think = makeEl("p", "persp-prompt");
    think.appendChild(makeEl("strong", "", "Think like a " + p.name.toLowerCase() + ": "));
    think.appendChild(document.createTextNode(p.prompt));
    panel.appendChild(think);
    if (focus) buttons[i].focus();
  }

  PERSPECTIVES.forEach(function (p, i) {
    var b = makeEl("button", "persp-tab is-" + p.id);
    b.type = "button";
    b.id = "persp-tab-" + item.id + "-" + p.id;
    b.setAttribute("role", "tab");
    b.appendChild(document.createTextNode(p.name));
    b.addEventListener("click", function () { show(i, false); });
    b.addEventListener("keydown", function (e) {
      var n = PERSPECTIVES.length;
      if (e.key === "ArrowRight") { e.preventDefault(); show((i + 1) % n, true); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show((i - 1 + n) % n, true); }
      else if (e.key === "Home") { e.preventDefault(); show(0, true); }
      else if (e.key === "End") { e.preventDefault(); show(n - 1, true); }
    });
    buttons.push(b);
    tabs.appendChild(b);
  });
  show(0, false);
  return box;
}
