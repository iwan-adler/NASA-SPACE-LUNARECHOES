// Build Your Own Rover - an educational engineering simulation for Lunar Echoes.
// Fictional missions and illustrative numbers (build-data.json). Not a real engineering tool.
// Ratings are qualitative (Strong / Adequate / Weak) with reasons, never a single "right answer".

(function () {
  "use strict";
  var D = null;
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  async function boot() {
    try {
      var r = await fetch("build-data.json", { cache: "no-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      D = await r.json();
    } catch (e) {
      $("b-status").textContent = "The builder data could not be loaded. " + (location.protocol === "file:" ? "Open this page through a local server (see the README)." : e.message);
      $("b-evaluate").disabled = true;
      return;
    }
    $("b-disclaimer").textContent = D.disclaimer;
    $("b-budget").textContent = D.budget;
    $("b-budget-total").textContent = D.budget;

    var ml = $("b-mission-list");
    D.missions.forEach(function (m, i) {
      var lab = el("label", "b-mission is-" + m.planet.toLowerCase());
      var input = el("input");
      input.type = "radio";
      input.name = "mission";
      input.value = m.id;
      if (i === 0) input.checked = true;
      lab.appendChild(input);
      var body = el("span", "b-mission-body");
      body.appendChild(el("span", "b-mission-planet", m.planet + " · fictional mission"));
      body.appendChild(el("span", "b-mission-name", m.name));
      body.appendChild(el("span", "b-mission-brief", m.brief));
      lab.appendChild(body);
      ml.appendChild(lab);
    });

    var cats = $("b-categories");
    D.categories.forEach(function (c, ci) {
      var fs = el("fieldset", "b-cat");
      fs.appendChild(el("legend", "", (ci + 2) + ". " + c.name + (c.pick === "many" ? " (choose any)" : "")));
      c.options.forEach(function (o, oi) {
        var lab = el("label", "b-opt");
        var input = el("input");
        input.type = c.pick === "many" ? "checkbox" : "radio";
        input.name = c.id;
        input.value = o.id;
        if (c.pick === "one" && oi === 0) input.checked = true;
        lab.appendChild(input);
        var body = el("span", "b-opt-body");
        var top = el("span", "b-opt-top");
        top.appendChild(el("span", "b-opt-name", o.name));
        top.appendChild(el("span", "b-opt-cost", o.cost + " pts"));
        body.appendChild(top);
        body.appendChild(el("span", "b-opt-desc", o.desc));
        var facts = [];
        if (o.mass) facts.push("mass " + o.mass);
        if (o.power) facts.push("uses " + o.power + " power");
        if (o.supply) facts.push("supplies up to " + o.supply + " power");
        if (facts.length) body.appendChild(el("span", "b-opt-facts", facts.join(" · ")));
        lab.appendChild(body);
        fs.appendChild(lab);
      });
      cats.appendChild(fs);
    });

    $("b-form").addEventListener("change", function () { update(); $("b-report").hidden = true; });
    $("b-evaluate").addEventListener("click", evaluate);
    update();
  }

  function option(catId, id) {
    var c = D.categories.filter(function (x) { return x.id === catId; })[0];
    return c.options.filter(function (o) { return o.id === id; })[0];
  }

  function selection() {
    var f = $("b-form");
    var s = { mission: D.missions.filter(function (m) { return m.id === (f.querySelector("input[name=mission]:checked") || {}).value; })[0] };
    D.categories.forEach(function (c) {
      if (c.pick === "many") {
        s[c.id] = Array.prototype.map.call(f.querySelectorAll("input[name=" + c.id + "]:checked"), function (i) { return option(c.id, i.value); });
      } else {
        var i = f.querySelector("input[name=" + c.id + "]:checked");
        s[c.id] = i ? option(c.id, i.value) : null;
      }
    });
    return s;
  }

  function parts(s) {
    return [s.wheels, s.camera, s.arm, s.power, s.comms].concat(s.instruments).filter(Boolean);
  }

  function totals(s) {
    var p = parts(s);
    var cost = 0, mass = 0, demand = 0;
    p.forEach(function (o) { cost += o.cost || 0; mass += o.mass || 0; demand += o.power || 0; });
    var supply = s.power ? Math.round(s.power.supply * (s.power.solar ? s.mission.sunlight : 1)) : 0;
    return { cost: cost, mass: mass, demand: demand, supply: supply };
  }

  function update() {
    var s = selection(), t = totals(s);
    $("b-cost").textContent = t.cost;
    $("b-mass").textContent = t.mass;
    $("b-demand").textContent = t.demand;
    $("b-supply").textContent = t.supply + (s.power && s.power.solar ? " (solar, at this site's sunlight)" : "");
    var fill = $("b-bar-fill");
    fill.style.width = Math.min(100, t.cost / D.budget * 100) + "%";
    fill.className = t.cost > D.budget ? "over" : t.cost > D.budget * 0.85 ? "near" : "";
    $("b-problems").textContent = t.cost > D.budget ? "Over budget by " + (t.cost - D.budget) + " points. Remove or downgrade something." : "";
  }

  function rate(score) { return score >= 2 ? "Strong" : score >= 1 ? "Adequate" : "Weak"; }

  function evaluate() {
    var s = selection(), t = totals(s), m = s.mission;
    if (t.cost > D.budget) { update(); $("b-problems").textContent = "Over budget by " + (t.cost - D.budget) + " points. A real mission has to fit its budget: trim the design, then evaluate again."; return; }

    var ids = s.instruments.map(function (o) { return o.id; }).concat([s.camera.id]);
    var reach = s.arm && s.arm.reach;
    var r = [];

    // Mobility
    var need = { flat: 1, mixed: 2, rough: 2 }[m.terrain] + (m.distance === "long" ? 1 : 0);
    var mob = s.wheels.mobility - (t.mass > s.wheels.capacity ? 1 : 0);
    var mobWhy = [s.wheels.name + " on " + m.terrain + " terrain" + (m.distance === "long" ? " with long drives" : m.distance === "none" ? " (the rover mostly stays put)" : "") + "."];
    if (t.mass > s.wheels.capacity) mobWhy.push("The rover (mass " + t.mass + ") is heavier than these wheels are meant to carry (" + s.wheels.capacity + "), which makes getting stuck more likely.");
    r.push({ name: "Mobility", rating: rate(2 + (mob - need)), why: mobWhy });

    // Power
    var ratio = t.demand ? t.supply / t.demand : 9;
    var pow = ratio >= 1.15 ? 2 : ratio >= 0.9 ? 1 : 0;
    var powWhy = ["Supply " + t.supply + " against demand " + t.demand + "."];
    if (s.power.solar && m.sunlight < 0.3) powWhy.push("Solar power is a poor fit where there is almost no sunlight.");
    if (s.power.solar && m.id === "weather") { pow = Math.min(pow, 1); powWhy.push("On a long stay, dust will build up on solar panels and output will fall over time."); }
    if (!s.power.solar) powWhy.push("Radioisotope power does not depend on sunlight or clean panels, but it took a large part of the budget.");
    r.push({ name: "Power", rating: rate(pow), why: powWhy });

    // Science
    var have = m.key.filter(function (k) { return ids.indexOf(k) !== -1; });
    var contactNoArm = s.instruments.filter(function (o) { return o.contact; }).filter(function () { return !reach; });
    var sci = have.length / m.key.length * 2;
    var sciWhy = ["Key instruments for this mission: " + have.length + " of " + m.key.length + " included."];
    var missing = m.key.filter(function (k) { return ids.indexOf(k) === -1; }).map(function (k) {
      var o = D.categories.reduce(function (acc, c) { return acc || c.options.filter(function (x) { return x.id === k; })[0]; }, null);
      return o ? o.name : k;
    });
    if (missing.length) sciWhy.push("Missing: " + missing.join(", ") + ".");
    if (contactNoArm.length) { sci -= 1; sciWhy.push("Without an arm, the " + contactNoArm.map(function (o) { return o.name.toLowerCase(); }).join(", ") + " cannot be placed on a rock, so they cannot do their job."); }
    if (m.needsArm && !reach) sciWhy.push("This mission depends on touching rocks, which needs an arm.");
    r.push({ name: "Scientific capability", rating: rate(Math.round(sci)), why: sciWhy });

    // Communications
    var needData = m.dataNeed === "high" ? 2 : 1;
    var com = 2 + (s.comms.data - needData);
    r.push({ name: "Communications", rating: rate(com), why: [s.comms.name + " for a mission with " + m.dataNeed + " data needs."] });

    // Overall
    var weak = r.filter(function (x) { return x.rating === "Weak"; }).length;
    var adequate = r.filter(function (x) { return x.rating === "Adequate"; }).length;
    var overall = weak ? "Not ready: fix the weak areas" : adequate ? "Ready, with risks to manage" : "Ready for launch (in this simulation)";

    // Trade-offs, in plain words
    var trade = [];
    trade.push("You spent " + t.cost + " of " + D.budget + " points" + (t.cost < D.budget * 0.7 ? ", leaving room you could use for more capability." : "."));
    if (!s.power.solar) trade.push("Steady power came at a high price, leaving less budget for instruments.");
    if (s.wheels.id === "w6l") trade.push("Heavy-duty wheels improve mobility but add mass and cost.");
    if (s.instruments.length >= 4) trade.push("Many instruments mean more science, but more power, mass and data to handle.");
    if (s.comms.id === "both") trade.push("A backup radio link protects the mission if one link fails, at extra cost.");

    // Real-world references that relate to this design
    var tags = ids.slice();
    if (s.power.solar) tags.push("solar");
    if (m.id === "weather" && s.power.solar) tags.push("dust");
    if (m.id === "ice" && s.power.solar) tags.push("dark");
    if (m.distance === "long") tags.push("mobility");
    if (reach) tags.push("arm");
    var refs = D.references.filter(function (ref) { return ref.tags.some(function (tg) { return tags.indexOf(tg) !== -1; }); });

    renderReport(s, t, r, overall, trade, refs);
  }

  function renderReport(s, t, r, overall, trade, refs) {
    var box = $("b-report");
    box.innerHTML = "";
    box.hidden = false;
    var h = el("h2", "", "Mission design report");
    h.id = "b-report-title";
    h.tabIndex = -1;
    box.appendChild(h);
    box.appendChild(el("p", "b-report-sub", s.mission.name + " (" + s.mission.planet + ", fictional) · " + t.cost + "/" + D.budget + " points · educational simulation"));
    box.appendChild(el("p", "b-overall", overall));

    var grid = el("div", "b-ratings");
    r.forEach(function (x) {
      var c = el("div", "b-rating is-" + x.rating.toLowerCase());
      var hd = el("h3");
      hd.appendChild(document.createTextNode(x.name + " "));
      hd.appendChild(el("span", "b-chip", x.rating));
      c.appendChild(hd);
      x.why.forEach(function (w) { c.appendChild(el("p", "", w)); });
      grid.appendChild(c);
    });
    box.appendChild(grid);

    box.appendChild(el("h3", "b-h", "Your choices"));
    var ul = el("ul", "b-choices");
    [["Wheels", s.wheels.name], ["Camera", s.camera.name], ["Instruments", s.instruments.length ? s.instruments.map(function (o) { return o.name; }).join(", ") : "None"],
     ["Arm", s.arm.name], ["Power", s.power.name], ["Communications", s.comms.name]].forEach(function (p) {
      var li = el("li");
      li.appendChild(el("strong", "", p[0] + ": "));
      li.appendChild(document.createTextNode(p[1]));
      ul.appendChild(li);
    });
    box.appendChild(ul);

    box.appendChild(el("h3", "b-h", "Trade-offs you made"));
    var tl = el("ul", "b-trade");
    trade.forEach(function (x) { tl.appendChild(el("li", "", x)); });
    box.appendChild(tl);

    if (refs.length) {
      box.appendChild(el("h3", "b-h", "Real-world reference (NASA sources)"));
      var rl = el("ul", "b-refs");
      refs.forEach(function (ref) {
        var li = el("li", "", ref.text + " ");
        var a = el("a", "", ref.sourceName + " ↗");
        a.href = ref.sourceUrl; a.target = "_blank"; a.rel = "noopener";
        li.appendChild(a);
        rl.appendChild(li);
      });
      box.appendChild(rl);
    }
    box.appendChild(el("p", "note", D.disclaimer));

    var acts = el("div", "b-acts");
    var pr = el("button", "btn", "Print report");
    pr.type = "button";
    pr.addEventListener("click", function () { printReport(box); });
    acts.appendChild(pr);
    var again = el("button", "btn", "Change the design");
    again.type = "button";
    again.addEventListener("click", function () { $("b-form").querySelector("input").focus(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    acts.appendChild(again);
    box.appendChild(acts);

    h.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function printReport(box) {
    var clone = box.cloneNode(true);
    clone.querySelectorAll(".b-acts").forEach(function (n) { n.remove(); });
    var html = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>Mission design report</title><style>" +
      "body{font:14px/1.5 system-ui,sans-serif;max-width:800px;margin:24px auto;padding:0 16px;color:#111}" +
      ".b-ratings{display:grid;grid-template-columns:1fr 1fr;gap:10px}.b-rating{border:1px solid #bbb;border-radius:8px;padding:8px 10px}" +
      ".b-chip{border:1px solid #333;border-radius:99px;padding:0 6px;font-size:12px}h2{margin-bottom:0}.b-overall{font-weight:700}" +
      "</style></head><body>" + clone.innerHTML + "<p><small>LUNAR ECHOES is an independent educational project developed for NASA Space Apps Challenge. It is not affiliated with, operated by or endorsed by NASA.</small></p>" +
      "<script>window.onload=function(){window.print()}<\/script></body></html>";
    var url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    var w = window.open(url, "_blank");
    if (!w) $("b-status").textContent = "Your browser blocked the print window. Allow pop-ups to print.";
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
