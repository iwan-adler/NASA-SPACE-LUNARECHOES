// Lunar Echoes - timeline
// Lists objects in order of their "year" field.

function renderTimeline(objects) {
  const list = document.getElementById("timeline-list");
  list.innerHTML = "";

  // Only show objects that have a year filled in
  const dated = objects.filter(function (item) {
    return item.year;
  });

  dated.sort(function (a, b) {
    return a.year - b.year;
  });

  dated.forEach(function (item) {
    const entry = document.createElement("li");
    entry.textContent = item.year + " — " + item.name;
    list.appendChild(entry);
  });
}
