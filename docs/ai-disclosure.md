# AI Use Disclosure

Space Apps asks teams to be open about how they used AI tools. Keep this file up to date.

| Tool | What it was used for | Reviewed by a human? |
|------|----------------------|----------------------|
| Claude Code (Anthropic) | Generated the initial project scaffold (folder structure, placeholder HTML/CSS/JS, README) | Yes |
| Claude Code (Anthropic) | Wrote the interactive JavaScript (`js/main.js`, `js/objects.js`, `js/timeline.js`, `js/quiz.js`): object explorer, Moon/Mars filter, search, story modal, timeline and quiz. Tested with clearly fake test records only; no NASA facts were written by AI. Quiz questions are generated from `data/objects.json`, not written by AI. | Yes |
| Google DeepMind / Antigravity Agent | NASA research lead & HTML frontend developer: Conducted official NASA catalog verification (NSSDCA, PDS, LROC, HiRISE) for candidate lunar and Martian objects. Authored verified `data/objects.json` with cited NASA sources. Developed semantic HTML5 structure for `index.html` with agreed interface contract IDs. | Yes |

## Notes

- No AI-generated facts, dates or coordinates are used in the app without a source in `research-sources.md`.
- All planetary coordinates, mission dates, and technical details were cross-referenced against the NASA Space Science Data Coordinated Archive (NSSDCA) and peer-reviewed LROC/HiRISE observational catalogs.
