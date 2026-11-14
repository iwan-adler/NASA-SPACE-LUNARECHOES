# NASA-SPACE-LUNARECHOES
Team repository for the NASA SPACE APPS CHALLENGE 2026 at VIT University-AP.

## Lunar Echoes

Lunar Echoes is a simple, interactive web page that helps people explore objects
connected to the Moon, see them on a timeline, and test what they learned with a short quiz.

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
js/quiz.js                 Quiz (placeholder)
data/objects.json          Object data (placeholder — needs real, cited data)
assets/images/             Images (credit each one in docs/research-sources.md)
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

## Team rules

- **No invented facts.** Every fact, date and coordinate needs a source in `docs/research-sources.md`.
- **Branding:** check the official Space Apps branding guidelines before using any NASA or Space Apps logos.
- **AI use:** log it in `docs/ai-disclosure.md`.
- **Don't overwrite teammates' work:** `git pull` before you start, and commit small changes often.
