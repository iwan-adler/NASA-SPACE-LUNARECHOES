# LUNAR ECHOES: BEYOND THE ARCHIVE · implementation plan

Audit of `main` at commit 535afa9 (15 Nov 2026), checked against the master project brief. The repository is the source of truth.

**Story:** *Explore the past. Investigate the present. Shape the future.*

## Audit: what exists today

| Brief item | Priority | Status in the repo | Where |
|---|---|---|---|
| Homepage and connected navigation | P0 | **Partial.** The Moon/Mars hero, intro and stats exist. Missing: the "Beyond the Archive" title and tagline, the three-part journey, and the full disclaimer. The nav is a flat list. | `index.html`, `js/explore.js` |
| Planetary heritage archive (cards, search, filters, stories, sources, credits) | P0 | **Done.** 12 NSSDCA-sourced objects. | `js/objects.js`, `data/objects.json` |
| Equipment Explorer ("What remains?") | P0 | **Done** through the Digital Heritage Passports: purpose, mission, fate, status, science, heritage, location and sources. Statuses: in use or inactive. Missing coordinates show as "Not available". | `js/objects.js` |
| Planetary Detective | P0 | **Partial.** The Evidence Room has 3 case files with a mystery, photo, records, NASA evidence and a conclusion. Missing: timeline clues, a workspace for classifying evidence (Confirmed / Reasonable interpretation / Unconfirmed possibility / Unknown), and a final "real record" with what remains uncertain. | `js/cases.js`, `data/cases.json` |
| Rover Rescue | P0 | **Done** (PR #6). | `rover/` |
| The Last Signal | P0 | **Missing.** | (new) |
| MoonDiff and Cloudspotting on Mars: Shapes | P0 | **Done.** | `js/citizen.js`, `js/beyond-extras.js` |
| Sources and image credits | P0 | **Done.** | `docs/research-sources.md`, on every story |
| Interactive heritage map | P1 | **Partial.** The location explorer shows verified NSSDCA coordinates only, with unknown positions listed. A teammate has an *untracked* 3D globe in progress (`welcome.html`, `js/welcome.js`, `css/welcome.css`); not touched. | `js/explore.js` |
| Mission Footprints and Science Lab | P1 | **Partial.** Then vs Now orbital photos (4 objects), the Observation Lab and Science-behind-the-image. No slider yet. | `js/objects.js`, `js/citizen.js` |
| Evidence or Assumption? | P1 | **Partial.** Reasoning appears in the Observation Lab and Rover Rescue. The new Detective workspace adds claim classification. | |
| Build Your Own Rover | P1 | **Missing.** | |
| Ethics of Exploration | P1 | **Partial.** One Future Explorer scenario with sourced trade-offs. | `data/decision.json` |
| Virtual Museum, Four Perspectives, Time Capsule, Landing Site Designer | P2 | **Missing.** | |
| Heritage Charter, Ask a Planetary Scientist | P2 | **Done.** | `js/beyond-extras.js` |
| Shared Discovery Journal | P2 | **Partial.** There is a Beyond journal (session) and a rover journal (session), but they are separate. | |

## This round (Priority 0 gaps)

1. **Homepage:**
   - Title "LUNAR ECHOES · BEYOND THE ARCHIVE" and the tagline "Humanity explored. History remained. Discovery continues."
   - A three-part journey section (Explore the past → Investigate the present → Shape the future) that links every experience.
   - A grouped nav and the full disclaimer in the footer.
   - Edits stay in `index.html` and one new CSS file.
2. **The Last Signal** (new `js/last-signal.js`, `css/last-signal.css`, `data/last-signal.json`):
   - One channel per object, showing launch → landing → milestones → last documented event → what remained → afterwards.
   - Each channel links to the object's story.
   - Launch dates come from the NSSDCA records. All other events reuse the sourced `events` in `objects.json`.
   - No final transmissions are invented. Where an exact final communication is not documented in our sources, the page says so and shows the last documented event instead.
3. **Planetary Detective** (upgrade `js/cases.js` and `data/cases.json`, without removing anything):
   - Timeline clues from the object's events.
   - An investigation workspace where visitors classify claims as Confirmed, Reasonable interpretation, Unconfirmed possibility or Unknown, with explanations and sources.
   - Then the existing conclusion, followed by a "real record" reveal: object, mission, purpose, what happened, status and what remains uncertain.

## Next rounds (proposed)

- **P1:**
  - A heritage map, coordinated with the teammate's globe work.
  - A Then vs Now slider for the 4 verified pairs.
  - A standalone Evidence or Assumption game.
  - Build Your Own Rover.
  - More ethics scenarios.
- **P2:**
  - Four Perspectives tabs in the passports.
  - A Virtual Museum mode.
  - A Time Capsule and a Landing Site Designer.
  - A shared journal that combines the Beyond journal and the rover journal.

## Ground rules

- Modular files per feature. Shared files (`index.html`, `js/main.js`) get only the minimal hooks.
- No invented facts, coordinates, dates, final communications or measurements. Every claim is sourced in `docs/research-sources.md`.
- Feature branch only. No push to `main`, and no merge without approval.
