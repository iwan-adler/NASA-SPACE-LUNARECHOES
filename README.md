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
js/quiz.js                 Teaching quiz generated from the data
js/explore.js              Landing numbers, Moon vs Mars, location explorer
js/cases.js                Evidence Room case files and the Future Explorer scenario
data/cases.json            The three case files: evidence, question, explanation, significance
data/decision.json         The hypothetical Future Explorer scenario and its sourced trade-offs
data/objects.json          12 NASA-sourced object records
data/worlds.json           Moon/Mars facts from NASA NSSDCA fact sheets
assets/images/             Offline copies of the 16 NASA photos (credits in docs/research-sources.md)
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

**Works offline.** All 16 NASA photos are saved in `assets/images/` (2.7 MB). The page loads these
local copies first. If a copy is missing, it falls back to NASA's server (`images-assets.nasa.gov`),
and if that also fails the image is hidden. `data/objects.json` keeps the original NASA URLs as the
source record. A local file is named after the last part of its URL (e.g. `PIA25287~medium.jpg`).

## Beyond the Mission

The site is built around one question: *When humanity explores another world, what responsibility do we have
for the things we leave there?*

- **Evidence Room** (`js/cases.js`, `data/cases.json`): three case files (Apollo 11 laser reflector,
  Opportunity, Apollo 11 Eagle descent stage). Visitors examine NASA evidence one item at a time, submit a
  conclusion, get the explanation, then read "Why it matters".
- **Future Explorer** (`data/decision.json`): a clearly labelled *hypothetical* mission scenario. Visitors decide
  how to document, study or preserve the Apollo 11 hardware, and see the trade-offs from NASA's 2011 heritage
  recommendations (which NASA says are not legal requirements).
- **Digital Heritage Passports:** every object's detail view is a passport with an identity card plus seven
  sections: Purpose, Mission, Scientific contribution, Documented history, Current status (Then vs Now),
  Heritage significance and Source evidence.
- **Then vs Now:** a two-state switch between the archival photo and the documented present. A later NASA orbital
  photo is shown only where one exists (4 objects). Otherwise the page says no recent photo is in our sources.
- **Evidence boundary:** every statement is labelled **Verified** (linked NASA source), **Interpretation**
  (our reasoning), **Unknown** (not documented; never guessed) or **Hypothetical**.
- **Field Note:** a printable one-page discovery report for any object, with sources and space for the visitor's
  own observations.

## Features

- **Landing:** a split Moon/Mars hero with live counts from the data, and a button that opens the
  one object still in use.
- **Collection** (`js/objects.js`): cards from `data/objects.json`, All / Moon / Mars filter,
  search by object name or mission, and "Still in use" / "Inactive" labels.
- **Object story:** each story contains:
  - a photo header and a "Today:" status line
  - five chapters: **Designed, Mission, Discovery, Left behind, Legacy**
  - a dated **mission journey**
  - **Then vs Now** orbital photos (4 objects)
  - an archive record: resting place, coordinates, NSSDCA record link, image credit, source
  - previous / next buttons to walk through the collection
- **Timeline** (`js/timeline.js`): arrivals grouped by year, colour-coded Moon/Mars.
- **Moon vs Mars** (`js/explore.js`): counts from our collection, side by side with NASA fact-sheet values.
- **Location explorer** (`js/explore.js`): objects with verified NSSDCA coordinates plotted on a
  latitude/longitude grid. The Moon panel is zoomed to the near side. Objects without verified
  coordinates are listed, not guessed.
- **Teaching quiz** (`js/quiz.js`): five questions generated from the data. After each answer it shows
  "The story behind the answer" and an "Open its full story" button, and the score screen reviews every answer.
  Questions whose wording gives the answer away are skipped.
- **Accessibility:** skip link, visible keyboard focus, native `<dialog>` (Escape closes it and focus
  returns), labelled controls, alt text, a text list alongside each map, and support for reduced motion.
- **Missing data** shows as "Not available". Missing or broken images are hidden.
- **Errors** loading the JSON file are shown on the page instead of a blank screen.

### Data fields used

`id, name, planet, mission, year, category, status, purpose, story, science,
latitude, longitude, image, imageCredit, source`

`planet` should be `"Moon"` or `"Mars"`. `year` should be a number like `1969`.
`source` should start with `https://` so it becomes a link.
Extra fields:
- `fate`, `legacy`: the "Left behind" and "Legacy" story chapters.
- `events`: the mission journey, a list of `{ "date": "YYYY[-MM[-DD]]", "label": "…" }`.
- `thenNow` (optional): a later NASA orbital photo `{ image, imagePage, credit, caption }`.
  Only add one when NASA's own description confirms what it shows.
- `nssdcId`: the NSSDCA Master Catalog record ID (e.g. `1969-059C`), shown as a link.
- `site`: the object's resting place, by name.
- `statusType`: `"in-use"` or `"inactive"`, shown as a label.
- `imagePage`: a link to the image's page on images.nasa.gov (shown as "view at NASA").

Coordinates use east-positive longitude from −180 to 180.

### Styling

All styles are in `css/style.css`, with colour tokens at the top (`--moon`, `--mars`, `--accent`, …).
Phone and tablet layouts are in `css/responsive.css`. Components created by JavaScript (story view,
journey, then-now, comparison, map, quiz) are styled in their own labelled sections of `style.css`.

## Team rules

- **No invented facts.** Every fact, date and coordinate needs a source in `docs/research-sources.md`.
- **Branding:** check the official Space Apps branding guidelines before using any NASA or Space Apps logos.
- **AI use:** log it in `docs/ai-disclosure.md`.
- **Don't overwrite teammates' work:** `git pull` before you start, and commit small changes often.
