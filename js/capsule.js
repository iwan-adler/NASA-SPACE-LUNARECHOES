// Lunar Echoes - Planetary Time Capsule
// Visitors choose mission records, what to include, write a message for future explorers and
// preservation instructions, then download (HTML file) or print their capsule.
// Facts come unchanged from data/objects.json with their source links; the visitor's own words are
// labelled as theirs. Nothing is uploaded or stored. Helpers from js/objects.js.

var CAPSULE_INCLUDE = [
  { id: "images", label: "Historical photographs", on: true },
  { id: "equipment", label: "Equipment descriptions (what it was built to do)", on: true },
  { id: "records", label: "Mission records and key dates", on: true },
  { id: "science", label: "Scientific discoveries", on: true },
  { id: "status", label: "What remains today", on: true }
];
var CAPSULE_RULES = [
  "Document a site from a distance before anyone approaches it.",
  "Leave experiments that are still in use, like the Apollo 11 laser reflector, undisturbed.",
  "Photograph each site regularly from orbit to record how it changes.",
  "Land well away from historic sites. NASA's 2011 guidance recommends that landers not fly over a U.S. lunar heritage site within 2.0 km.",
  "Take nothing and add nothing without a scientific reason that is shared openly.",
  "Keep these records public so every future explorer can learn from them."
];

function capEsc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function renderCapsule(objects) {
  var box = document.getElementById("capsule-box");
  if (!box) return;
  box.innerHTML = "";
  box.removeAttribute("aria-busy");
  var form = makeEl("form", "cap-form");
  form.noValidate = true;

  // 1. Records
  var f1 = makeEl("fieldset", "cap-step");
  f1.appendChild(makeEl("legend", "", "1. Choose the mission records to seal inside"));
  var quick = makeEl("div", "cap-quick");
  [["All", "all"], ["Moon only", "Moon"], ["Mars only", "Mars"], ["None", "none"]].forEach(function (q) {
    var b = makeEl("button", "cap-chip", q[0]);
    b.type = "button";
    b.addEventListener("click", function () {
      form.querySelectorAll("input[name=cap-obj]").forEach(function (i) {
        var o = findObject(i.value);
        i.checked = q[1] === "all" || (o && o.planet === q[1]);
      });
      capUpdate(form);
    });
    quick.appendChild(b);
  });
  f1.appendChild(quick);
  var grid = makeEl("div", "cap-grid");
  objects.forEach(function (o, i) {
    var lab = makeEl("label", "cap-obj " + planetClass(o));
    var input = makeEl("input");
    input.type = "checkbox";
    input.name = "cap-obj";
    input.value = o.id;
    input.checked = i < 3 || o.statusType === "in-use";
    lab.appendChild(input);
    var t = makeEl("span", "");
    t.appendChild(makeEl("strong", "", o.name));
    t.appendChild(makeEl("small", "", o.planet + " · " + o.year));
    lab.appendChild(t);
    grid.appendChild(lab);
  });
  f1.appendChild(grid);
  form.appendChild(f1);

  // 2. Contents
  var f2 = makeEl("fieldset", "cap-step");
  f2.appendChild(makeEl("legend", "", "2. Choose what to include for each record"));
  CAPSULE_INCLUDE.forEach(function (c) {
    var lab = makeEl("label", "cap-check");
    var input = makeEl("input");
    input.type = "checkbox";
    input.name = "cap-inc";
    input.value = c.id;
    input.checked = c.on;
    lab.appendChild(input);
    lab.appendChild(document.createTextNode(" " + c.label));
    f2.appendChild(lab);
  });
  form.appendChild(f2);

  // 3. Message
  var f3 = makeEl("fieldset", "cap-step");
  f3.appendChild(makeEl("legend", "", "3. Write a message for future explorers"));
  var msg = makeEl("textarea", "cap-text");
  msg.name = "cap-msg";
  msg.maxLength = 800;
  msg.rows = 4;
  msg.placeholder = "What do you want someone opening this in 50 years to know, or to remember?";
  msg.setAttribute("aria-label", "Message for future explorers");
  f3.appendChild(msg);
  var who = makeEl("label", "cap-who", "Signed (optional, a first name or initials) ");
  var whoIn = makeEl("input", "cap-input");
  whoIn.name = "cap-who";
  whoIn.maxLength = 40;
  who.appendChild(whoIn);
  f3.appendChild(who);
  form.appendChild(f3);

  // 4. Preservation instructions
  var f4 = makeEl("fieldset", "cap-step");
  f4.appendChild(makeEl("legend", "", "4. Add preservation instructions"));
  CAPSULE_RULES.forEach(function (r, i) {
    var lab = makeEl("label", "cap-check");
    var input = makeEl("input");
    input.type = "checkbox";
    input.name = "cap-rule";
    input.value = String(i);
    input.checked = i < 2;
    lab.appendChild(input);
    lab.appendChild(document.createTextNode(" " + r));
    f4.appendChild(lab);
  });
  var own = makeEl("textarea", "cap-text");
  own.name = "cap-own";
  own.rows = 2;
  own.maxLength = 400;
  own.placeholder = "Your own instruction (optional)";
  own.setAttribute("aria-label", "Your own preservation instruction");
  f4.appendChild(own);
  form.appendChild(f4);

  var bar = makeEl("div", "cap-bar");
  var status = makeEl("p", "cap-status");
  status.setAttribute("aria-live", "polite");
  bar.appendChild(status);
  var acts = makeEl("div", "cap-actions");
  var dl = makeEl("button", "btn btn-primary", "Seal and download capsule");
  dl.type = "button";
  dl.addEventListener("click", function () { capDownload(form); });
  var pr = makeEl("button", "btn btn-ghost", "Print capsule");
  pr.type = "button";
  pr.addEventListener("click", function () { capPrint(form); });
  acts.appendChild(dl);
  acts.appendChild(pr);
  bar.appendChild(acts);
  form.appendChild(bar);
  form.appendChild(makeEl("p", "cap-disclaimer", "Your time capsule is a personal, educational creation. It is not an official NASA record. Nothing you write leaves this page unless you download or print it."));

  form.addEventListener("change", function () { capUpdate(form); });
  box.appendChild(form);
  capUpdate(form);
}

function capSelection(form) {
  var ids = Array.prototype.map.call(form.querySelectorAll("input[name=cap-obj]:checked"), function (i) { return i.value; });
  var inc = {};
  form.querySelectorAll("input[name=cap-inc]:checked").forEach(function (i) { inc[i.value] = true; });
  var rules = Array.prototype.map.call(form.querySelectorAll("input[name=cap-rule]:checked"), function (i) { return CAPSULE_RULES[Number(i.value)]; });
  var own = form.querySelector("[name=cap-own]").value.trim();
  if (own) rules.push(own + " (my own instruction)");
  return {
    objects: ids.map(findObject).filter(Boolean),
    inc: inc,
    message: form.querySelector("[name=cap-msg]").value.trim(),
    who: form.querySelector("[name=cap-who]").value.trim(),
    rules: rules
  };
}

function capUpdate(form) {
  var s = capSelection(form);
  form.querySelector(".cap-status").textContent = s.objects.length
    ? s.objects.length + " record(s) · " + Object.keys(s.inc).length + " kinds of content · " + s.rules.length + " instruction(s)"
    : "Choose at least one mission record.";
  form.querySelectorAll(".cap-actions button").forEach(function (b) { b.disabled = !s.objects.length; });
}

function capHtml(s) {
  var date = new Date();
  var stamp = date.getDate() + " " + MONTHS[date.getMonth()] + " " + date.getFullYear();
  var h = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>Planetary Time Capsule</title><style>" +
    "body{font:15px/1.6 Georgia,serif;max-width:820px;margin:32px auto;padding:0 18px;color:#14161c;background:#fbfaf6}" +
    "h1{font-weight:400;letter-spacing:.08em;text-transform:uppercase;margin:0}h2{font-weight:400;border-top:1px solid #ccc;padding-top:18px}" +
    ".meta{color:#555;font-family:system-ui,sans-serif;font-size:13px}.k{font-family:system-ui,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7a5a1e}" +
    "img{max-width:100%;border-radius:6px}.src{font-family:system-ui,sans-serif;font-size:12px;color:#555}.msg{font-style:italic;font-size:18px;border-left:3px solid #c9a35a;padding-left:14px}" +
    ".note{font-family:system-ui,sans-serif;font-size:12px;color:#555;border:1px solid #ccc;padding:10px;border-radius:6px}ul{padding-left:20px}" +
    "</style></head><body>";
  h += "<p class='k'>Lunar Echoes · Planetary Time Capsule</p><h1>To the explorers who come after us</h1>";
  h += "<p class='meta'>Sealed " + capEsc(stamp) + (s.who ? " by " + capEsc(s.who) : "") + " · " + s.objects.length + " mission record(s)</p>";
  if (s.message) h += "<h2>Message for future explorers</h2><p class='msg'>" + capEsc(s.message).replace(/\n/g, "<br>") + "</p><p class='src'>Written by the visitor who sealed this capsule.</p>";
  if (s.rules.length) h += "<h2>Preservation instructions</h2><ul>" + s.rules.map(function (r) { return "<li>" + capEsc(r) + "</li>"; }).join("") + "</ul><p class='src'>Chosen by the visitor. These are not laws or NASA policy. NASA's 2011 lunar heritage recommendations are themselves \"technical recommendations\", not legal requirements.</p>";
  h += "<h2>Mission records</h2>";
  s.objects.forEach(function (o) {
    h += "<section><p class='k'>" + capEsc(o.planet) + " · " + capEsc(o.mission) + " · " + capEsc(o.year) + "</p><h3>" + capEsc(o.name) + "</h3>";
    if (s.inc.images && !isMissing(o.image)) h += "<img src='" + capEsc(o.image) + "' alt='" + capEsc(o.name) + "'><p class='src'>Photo: " + capEsc(o.imageCredit) + "</p>";
    if (s.inc.equipment) h += "<p><strong>Built to:</strong> " + capEsc(o.purpose) + "</p>";
    if (s.inc.records) {
      h += "<p><strong>The mission:</strong> " + capEsc(o.story) + "</p>";
      if (Array.isArray(o.events) && o.events.length) h += "<ul>" + o.events.map(function (e) { return "<li>" + capEsc(formatDate(e.date)) + ": " + capEsc(e.label) + "</li>"; }).join("") + "</ul>";
    }
    if (s.inc.science) h += "<p><strong>Science:</strong> " + capEsc(o.science) + (isMissing(o.legacy) ? "" : " " + capEsc(o.legacy)) + "</p>";
    if (s.inc.status) h += "<p><strong>What remains:</strong> " + capEsc(o.status) + (isMissing(o.site) ? "" : " Resting place: " + capEsc(o.site) + ".") + "</p>";
    h += "<p class='src'>Source: " + capEsc(o.source) + "</p></section>";
  });
  h += "<p class='note'>This time capsule was created on LUNAR ECHOES, an independent educational project developed for NASA Space Apps Challenge. It is not affiliated with, operated by or endorsed by NASA, and it is not an official record. Mission facts are quoted from the NASA sources listed with each record. Photographs: NASA Image and Video Library.</p>";
  h += "</body></html>";
  return h;
}

function capDownload(form) {
  var s = capSelection(form);
  if (!s.objects.length) return;
  var url = URL.createObjectURL(new Blob([capHtml(s)], { type: "text/html" }));
  var a = document.createElement("a");
  a.href = url;
  a.download = "planetary-time-capsule.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  form.querySelector(".cap-status").textContent = "Capsule sealed: planetary-time-capsule.html saved to your downloads.";
  if (typeof logbookAdd === "function") logbookAdd("capsule", "sealed", "Sealed a time capsule with " + s.objects.length + " record(s)");
}

function capPrint(form) {
  var s = capSelection(form);
  if (!s.objects.length) return;
  var html = capHtml(s).replace("</body>", "<script>window.onload=function(){window.print()}<\/script></body>");
  var url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  var w = window.open(url, "_blank");
  if (!w) form.querySelector(".cap-status").textContent = "Your browser blocked the print window. Allow pop-ups to print, or use Download instead.";
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}
