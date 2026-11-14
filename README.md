# NASA-SPACE-LUNARECHOES
Team repository for the NASA SPACE APPS CHALLENGE 2026 at VIT University-AP.

## Lunar Echoes

Lunar Echoes helps school-age explorers discover the equipment NASA left on the Moon and Mars
(landers, rovers and science stations) and the science each one made possible. Explore the objects,
read their stories, follow the timeline, then test yourself with a quiz.

**Challenge:** NASA Space Apps 2026, [Abandoned but not Forgotten: Storytelling about NASA's Discarded
Equipment on the Moon and Mars](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/).

**Data:** 12 objects (6 Moon, 6 Mars). Facts come from the challenge-listed **NASA Space Science Data Coordinated
Archive (NSSDCA) Master Catalog**. Each object carries its NSSDCA record ID, and the app links to it. They are
cross-checked with nasa.gov / science.nasa.gov, and the photos come from the NASA Image and Video Library.
See `docs/research-sources.md`.

This is a **3-hour hackathon prototype**. It is kept small and beginner-friendly on purpose.

## Tech

- HTML, CSS and vanilla JavaScript only
- No frameworks, no build step, no backend, no paid APIs
- Data lives in `data/objects.json`

## Project structure

```
index.html                 Main page
css/style.css              Main styles
css/responsive.css         Mobile / tablet tweaks
js/main.js                 Loads data and starts the app
js/objects.js              Object cards
js/timeline.js             Timeline list
js/quiz.js                 Quiz generated from the data
data/objects.json          12 NASA-sourced object records
assets/images/             Local images (empty: photos load from NASA's image server)
docs/research-sources.md   Every fact and its source
docs/ai-disclosure.md      How AI tools were used
presentation/round1-outline.md  Pitch outline
```

## Run it locally

The page loads `data/objects.json` with `fetch`, which browsers block when you
double-click `index.html`. Start a tiny local server from the project folder instead:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. (The VS Code "Live Server" extension also works.)

Images load from NASA's servers (`images-assets.nasa.gov`), so you need an internet connection to see
them. Without one, the cards still work; the images are simply hidden.

## JavaScript features

- **Object Explorer** (`js/objects.js`): cards from `data/objects.json`, All / Moon / Mars filter,
  search by object name or mission, "Still in use" / "Inactive" labels, and a story popup showing
  today's status, why it was sent, what happened, why it matters, resting place, coordinates,
  NSSDCA record link, image credit and source link.
- **Timeline** (`js/timeline.js`): missions grouped by the `year` field, oldest first.
  Objects without a year are left out (with a note). Click a name to open its story.
- **Quiz** (`js/quiz.js`): five multiple-choice questions built automatically from the data
  (mission, planet, year, type of object, which object belongs to a mission), with feedback and a score.
  Questions whose wording would give away the answer are skipped.
- **Missing data** shows as "Not available". Missing or broken images are hidden.
- **Errors** loading the JSON file are shown on the page instead of a blank screen.

### Data fields used

`id, name, planet, mission, year, category, status, purpose, story, science,
latitude, longitude, image, imageCredit, source`

`planet` should be `"Moon"` or `"Mars"`. `year` should be a number like `1969`.
`source` should start with `https://` so it becomes a link.
Extra fields:
- `nssdcId`: the NSSDCA Master Catalog record ID (e.g. `1969-059C`), shown as a link.
- `site`: the object's resting place, by name.
- `statusType`: `"in-use"` or `"inactive"`, shown as a label.
- `imagePage`: a link to the image's page on images.nasa.gov (shown as "view at NASA").

Coordinates use east-positive longitude from −180 to 180.

### CSS classes created by JavaScript (for the CSS team)

The filter, search and popup are added by JavaScript, so `index.html` did not need to change.
These classes are ready to style:
`.explorer-controls .filter-group .filter-btn[aria-pressed="true"] .search-label .search-input
.result-count .no-results .card-image .card-title .card-meta .story-btn .story-modal
.story-modal::backdrop .story-close .story-title .story-image .story-fields .story-source
.timeline-entry .timeline-year .timeline-items .timeline-item .timeline-link .timeline-note
.quiz-progress .quiz-question .quiz-options .quiz-option .quiz-option.correct .quiz-option.wrong
.quiz-feedback .quiz-next .quiz-score .quiz-message .quiz-restart .load-error`

## Team rules

- **No invented facts.** Every fact, date and coordinate needs a source in `docs/research-sources.md`.
- **Branding:** check the official Space Apps branding guidelines before using any NASA or Space Apps logos.
- **AI use:** log it in `docs/ai-disclosure.md`.
- **Don't overwrite teammates' work:** `git pull` before you start, and commit small changes often.
