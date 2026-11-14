// Lunar Echoes - Mission timeline
// Groups objects by mission year (only years that are in the data) and lists
// them oldest first. Each object name opens its story.

// Returns a whole-number year, or null if the year is missing or not a number.
function getYear(item) {
  if (isMissing(item.year)) return null;
  var year = Number(item.year);
  return Number.isInteger(year) ? year : null;
}

function renderTimeline(objects) {
  var list = document.getElementById("timeline-list");
  list.innerHTML = "";

  // Group objects by year: { 1969: [obj, obj], 1976: [obj] }
  var byYear = {};
  var skipped = 0;
  objects.forEach(function (item) {
    var year = getYear(item);
    if (year === null) {
      skipped++;
      return;
    }
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(item);
  });

  var years = Object.keys(byYear).map(Number).sort(function (a, b) {
    return a - b;
  });

  if (years.length === 0) {
    list.appendChild(makeEl("li", "timeline-empty", "No mission dates in the data yet."));
    return;
  }

  // CSS classes to style: .timeline-entry, .timeline-year, .timeline-item, .timeline-link
  years.forEach(function (year) {
    var entry = makeEl("li", "timeline-entry");
    entry.appendChild(makeEl("strong", "timeline-year", String(year)));

    var items = makeEl("ul", "timeline-items");
    byYear[year].forEach(function (item) {
      var li = makeEl("li", "timeline-item");
      var btn = makeEl("button", "timeline-link", showValue(item.name));
      btn.type = "button";
      btn.addEventListener("click", function () {
        openStory(item, btn); // from objects.js
      });
      li.appendChild(btn);
      li.appendChild(document.createTextNode(
        " — " + showValue(item.mission) + " (" + showValue(item.planet) + ")"
      ));
      items.appendChild(li);
    });

    entry.appendChild(items);
    list.appendChild(entry);
  });

  if (skipped > 0) {
    var note = makeEl("p", "timeline-note",
      skipped + " object(s) are not shown because their mission year is not available.");
    list.parentNode.insertBefore(note, list.nextSibling);
  }
}
