// Lunar Echoes - object cards
// Draws one card per object from data/objects.json.

function renderObjects(objects) {
  const container = document.getElementById("objects-list");
  container.innerHTML = "";

  if (!objects || objects.length === 0) {
    container.textContent = "No objects yet. Add some to data/objects.json.";
    return;
  }

  objects.forEach(function (item) {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const description = document.createElement("p");
    description.textContent = item.description;

    card.appendChild(title);
    card.appendChild(description);
    container.appendChild(card);
  });
}
