# AI Use Disclosure

Space Apps asks teams to be open about how they used AI tools. Keep this file up to date.

| Tool | What it was used for | Reviewed by a human? |
|------|----------------------|----------------------|
| Claude Code (Anthropic) | Generated the initial project scaffold (folder structure, placeholder HTML/CSS/JS, README) | Yes |
| Claude Code (Anthropic) | Wrote the interactive JavaScript (`js/main.js`, `js/objects.js`, `js/timeline.js`, `js/quiz.js`): object explorer, Moon/Mars filter, search, story modal, timeline and quiz. Tested with clearly fake test records only; no NASA facts were written by AI. Quiz questions are generated from `data/objects.json`, not written by AI. | Yes |

| Claude Code (Anthropic) | Collected facts for the 11 records in `data/objects.json` by reading NASA NSSDCA catalogue pages and nasa.gov articles, then rewrote them in simple language. Looked up and checked NASA image IDs through the NASA Image Library API. Wrote the intro text, story layout and CSS styling. Every fact is linked to its NASA page in `research-sources.md`. | Needs team check: please spot-check facts against the linked sources |

## Notes

- No AI-generated facts, dates or coordinates are used in the app without a source in `research-sources.md`.
- Add a row above whenever an AI tool is used for code, text, images or research.
