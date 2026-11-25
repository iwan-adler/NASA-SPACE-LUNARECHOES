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
js/cases.js                Planetary Detective case files (workspace, real record) and the Future Explorer scenario
js/last-signal.js          The Last Signal: each mission from launch to its last documented event
data/last-signal.json      Launch dates (NSSDCA) and last-documented-event markers for The Last Signal
css/journey.css            Homepage title, tagline, journey section, footer disclaimer
css/last-signal.css        The Last Signal styles
css/detective.css          Planetary Detective workspace styles
docs/implementation-plan.md  Audit of the master brief and the feature plan
js/heritage-map.js         The Forgotten Footprints: Moon/Mars heritage map (replaces the simple grid)
data/heritage-map.json     Basemaps, view windows and approximate positions for the map
js/footprints.js           Mission Footprints Lab: NASA images with what they can and cannot tell us
data/footprints.json       Image facts from NASA's own descriptions; one verified before/after pair
js/evidence-game.js        Evidence or Assumption? reasoning game
data/evidence-game.json    Claims, NASA evidence and explanations
js/ethics.js               The Ethics of Exploration: four dilemmas, four perspectives, no score
data/ethics.json           Dilemmas and their labelled consequences
css/heritage-map.css, css/footprints.css  Styles for the map and the image lab
css/cinematic.css          Cinematic visual layer (loaded last): space backdrop, glass UI, hero globes, chapters
js/cinematic.js            Star field, glass navigation menus, gentle reveal on scroll (presentational only)
js/perspectives.js         One Mission, Four Perspectives switcher inside every object story
js/museum.js               Virtual Planetary Museum: Moon and Mars halls, optional browser narration
js/capsule.js              Planetary Time Capsule: choose records, write a message, download or print
js/landing.js              Future Landing Site Designer: real distances to heritage sites on NASA maps
js/logbook.js              My Explorer's Logbook: site-wide journey summary kept in this browser
css/experiences.css        Styles for the five Priority 2 experiences
assets/images/maps/        NASA basemaps (SVS CGI Moon Kit; Viking MDIM 2.1 via Mars Trek)
assets/images/footprints/  Phoenix HiRISE comparison pair (PIA22223 figures 1 and 2)
rover/build.html (+ build.js, build.css, build-data.json)  Build Your Own Rover simulator
rover/rover-cinematic.css  Deep-space theme for both rover pages (shares ../js/cinematic.js with the main site)
data/cases.json            The three case files: evidence, question, explanation, significance
data/decision.json         The hypothetical Future Explorer scenario and its sourced trade-offs
js/citizen.js              Beyond the Archive: citizen-science section and practice demos
data/citizen-science.json  MoonDiff and Cloudspotting content, sources and demo data
data/objects.json          12 NASA-sourced object records
data/worlds.json           Moon/Mars facts from NASA NSSDCA fact sheets
assets/images/             Offline copies of the 18 NASA photos (credits in docs/research-sources.md)
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

**Works offline.** All 18 NASA photos are saved in `assets/images/` (3.0 MB). The page loads these
local copies first. If a copy is missing, it falls back to NASA's server (`images-assets.nasa.gov`),
and if that also fails the image is hidden. `data/objects.json` keeps the original NASA URLs as the
source record. A local file is named after the last part of its URL (e.g. `PIA25287~medium.jpg`).

## Beyond the Archive: the connected journey

The homepage is titled **LUNAR ECHOES · BEYOND THE ARCHIVE** with the tagline *"Humanity explored. History remained.
Discovery continues."* A journey section links every experience under **Explore the past → Investigate the present →
Shape the future**. The footer carries the full project disclaimer. The audit and roadmap are in
`docs/implementation-plan.md`.

- **The Last Signal** (`#last-signal`): pick a mission channel to see its launch, arrival, milestones, last documented
  event, what happened afterwards, how it ended and what remained.
  - A trace shows a pulse while the mission was active and a flat line after its last documented event.
  - Each channel links to the object's story.
  - Where our sources do not record an actual final communication, the page says so.
- **The Planetary Detective** (`#cases`): each case file adds timeline clues (Exhibit D) and an investigation workspace.
  Visitors sort claims into Confirmed evidence, Reasonable interpretation, Unconfirmed possibility or Unknown, with
  sources. After the conclusion, "The real record" answers what, which mission, purpose, what happened, current status
  and what remains uncertain.

### Round 2 (Priority 1)

- **The Forgotten Footprints** (`#map`): real NASA maps of the Moon (LRO) and Mars (Viking). Each marker is labelled
  Verified (NSSDCA coordinates), Approximate (site documented, exact spot not, with the reason) or Unknown (listed,
  never plotted). Markers open a panel with mission, arrival date, status and links to the record and The Last Signal.
- **Mission Footprints Lab** (`#footprints`): 9 NASA images. Each shows what is pictured, the mission, the instrument
  (only if NASA names it), the date, why it was taken, what scientists learn, and *what it cannot tell us*. There is one
  before/after slider, for Phoenix, the only pair NASA describes as the same area with matched geometry. The slider
  works with a keyboard.
- **Evidence or Assumption?** (`#evidence-game`): judge 6 random claims against NASA evidence as Supported,
  Contradicted or Insufficient evidence.
- **Build Your Own Rover** (`rover/build.html`): fictional missions, a 100-point budget, and Strong / Adequate / Weak
  ratings with reasons. It produces a printable design report with real-world reference notes from NASA sources.
  It is an educational simulation, not an engineering tool.
- **The Ethics of Exploration** (`#ethics`): four hypothetical dilemmas (retrieval, science vs preservation,
  documentation, rules for a busy Moon). Each consequence is shown from four perspectives and labelled Verified or
  Interpretation. There is no score.

### Round 3 (Priority 2)

- **One Mission, Four Perspectives:** every object story has Engineer, Scientist, Historian and Future explorer tabs.
  They re-frame the object's existing sourced facts (labels unchanged). The guiding questions are prompts, not claims.
  The tabs work with the arrow keys.
- **Virtual Planetary Museum** (`#museum`): a full-screen Moon Hall and Mars Hall, one exhibit at a time, each with a
  photo, a technical placard, the story and its legacy. Arrow keys move between exhibits. Optional narration uses the
  browser's built-in speech synthesis, with no external service.
- **Planetary Time Capsule** (`#capsule`): choose records and content, write a message and preservation instructions,
  then download an HTML file or print. Facts are quoted from the archive with sources; the visitor's text is labelled as
  theirs. It is not an official record.
- **Future Landing Site Designer** (`#landing`): place a fictional site on the NASA Moon or Mars map, by click or by
  coordinates.
  - The page calculates great-circle distances to heritage objects, using the NSSDCA radius, and checks NASA's 2011
    2.0 km no-overflight recommendation on the Moon.
  - Terrain, resources and goals are labelled as the visitor's assumptions.
  - The proposal is printable.
- **My Explorer's Logbook** (`#logbook`): counts objects explored, cases, samples, instruments, questions answered,
  citizen-science visits and preservation decisions, with a summary and the latest entries.
  - It is kept in localStorage in this browser only. Rover Rescue mirrors a small summary for it.
  - Printable and clearable. Not a certificate.

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
- **BEYOND THE ARCHIVE** (`js/citizen.js`, `js/beyond-extras.js`, `css/beyond.css`,
  `data/citizen-science.json`, `data/beyond-learning.json`): an invitation to real planetary citizen science.
  - **Planetary Mission Control:** a mission briefing with the objective, and two equal pathways (Moon / Mars).
    Switching worlds keeps progress.
  - **Past → Present → Future:** from archive hardware to today's science to participation, with artifact links.
  - **The Lunar Investigation** (MoonDiff) and **The Martian Atmosphere Lab** (Cloudspotting on Mars: Shapes),
    five stages each:
    - enter;
    - compare (Moon) or discover the shapes (Mars);
    - the **Observation Lab**: Observation → Interpretation → Evidence → Uncertainty on a real credited NASA image,
      with "Not enough evidence to decide" always valid;
    - connect to the archive;
    - continue on the official project.
  - **Science behind the image:** expandable panels showing spacecraft, instrument, target, date, purpose and credit,
    each labelled Verified / Interpretation / Unknown. Nothing is guessed.
  - The Moon comparison is a labelled **illustration** (align, blink, fade, flag), with a stated limitation and a link
    to MoonDiff's own intro video. No verified Lunar Orbiter / LRO pair was available.
  - **Two worlds table**, the **Discovery Impact Chain** (how one observation helps science), the **Open Questions
    Wall** (10 questions: Moon, Mars, Heritage) and **Ask a Planetary Scientist** (a searchable local question bank,
    no AI).
  - **Planetary Scientist Profile:** optional, rule-based, nothing stored.
  - **My Discovery Journal:** session-only, with notes and a printable "My Planetary Discovery Journal". It is not a
    certificate. Official visits are recorded only when the visitor says so.
  - **Future Explorer Charter:** visitor-chosen principles, printable and copyable, labelled as not NASA policy.
  - Nothing is sent to NASA, MoonDiff or Zooniverse, and the page says so.
  - Deep links: `#beyond-moon`, `#beyond-mars`, `#beyond-wall`, `#beyond-ask`, `#beyond-journal`, `#beyond-charter`.

## ROVER RESCUE: Mission to Discover (game)

A standalone educational rover game in its own folder. It shares no code or CSS with the main site, so it cannot
break other features. The main nav has one link to it ("Rover Rescue game").

```
rover/index.html       Game page (mission select, exploration, lab and journal dialogs)
rover/rover.css        Game styles only
rover/rover.js         Canvas exploration, HUD, collection, instruments, reports, reasoning, journal
rover/rover-data.json  Missions, sample types, instruments, questions and NASA sources
```

**Run it on its own:** start a local server in the project folder (`python -m http.server 8000`) and open
http://localhost:8000/rover/. `#moon` or `#mars` at the end of the URL starts that mission straight away.

- **Missions:** Moon (mare basalt, anorthosite, impact breccia, regolith, orange glass) or Mars (olivine basalt,
  hematite spherules, layered sandstone, red dust, gypsum vein), each with its own terrain and palette.
- **Controls:**
  - Drive with the arrow keys or W A S D, the on-screen pad (touch screens), or by clicking or tapping the map.
  - E collects, L opens the lab, J opens the journal, R recharges.
- **Lab:** four instruments: camera, spectrometer, microscope and magnetic sensor. Each one explains what it measures,
  why scientists use it and which real instrument inspired it.
- **Report:** a structured sample report that fills in as you measure. Printable.
- **Reasoning challenges:** "Insufficient evidence" is always an option. Some questions unlock only after the right
  instrument has been run, and wrong answers can be rethought.
- **Energy:** forgiving. Recharge is free and unlimited, and there is no way to lose.
- **Journal:** progress is kept for the browser session only. Nothing is sent anywhere.
- **SIMULATED:** every instrument reading is a qualitative, illustrative value that matches published NASA descriptions.
  None is a real NASA measurement. Sources: `docs/research-sources.md` → "ROVER RESCUE".
- **To add a sample:** add an entry under `samples` and a site `{ x, y, type }` under the mission in `rover-data.json`,
  and give it a swatch colour in `SWATCH` at the top of `rover.js`.

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


## Team & Contributors

- **Yaswanth Botu** ([@yaswanth-Botu](https://github.com/yaswanth-Botu)) – UI Development