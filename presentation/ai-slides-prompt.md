# Prompt for an AI slide maker

Copy everything inside the box below into an AI presentation tool (for example a PowerPoint/Slides AI or a chat
assistant that can make .pptx files). If the tool accepts image uploads, also upload the photos listed in
"Images to use" from `assets/images/`.

Before using the slides: fill in the team names, and have a teammate check every number against
`docs/research-sources.md`.

---

```text
Create a 16:9 presentation of 12 slides for our NASA Space Apps Challenge 2026 project "Lunar Echoes".
It is a 3–4 minute judging pitch. Give every slide short on-slide text (max ~25 words, no paragraphs)
and full speaker notes (60–90 words each).

STRICT ACCURACY RULES
- Use ONLY the facts, numbers and dates written in this prompt. Do not add any other facts, statistics,
  dates, quotes or claims about NASA missions, even if you believe they are true.
- If a slide needs a fact that is not here, leave a placeholder like [FACT NEEDED] instead of guessing.
- Do not use NASA logos (the round "meatball" logo or the "worm" wordmark), the Space Apps logo, or any
  agency branding. Do not imply NASA endorses the project.
- Every photo must carry its credit line exactly as given below, in small text on the slide.
- Do not generate AI images of spacecraft, astronauts or planets. Use only the NASA photos listed below,
  or plain shapes and typography.

DESIGN DIRECTION
- Feel: a premium digital museum or a scientific archive, like a calm space documentary. Not a corporate dashboard.
- Background near-black #07080D; text warm white #ECEBE6; muted text #A3A8B8.
- One accent colour, archival gold #E8C27A, used for small labels and key numbers.
- Moon colour: silver #CDD5E6. Mars colour: rust #E07A4F. Use them to tag Moon vs Mars content consistently.
- Headings in a serif (Georgia, Palatino or similar), body text in a clean sans-serif.
- Large photos, lots of empty space, one idea per slide, big numbers for key facts.
- No clip art, no heavy gradients, no busy animations (simple fades only).

PROJECT IN ONE SENTENCE
Lunar Echoes is a free interactive website, a digital museum, where school-age explorers (about ages 9–15) discover
the machines NASA left on the Moon and Mars, why each was sent, what it did, what it taught us, and what happened to it.

CHALLENGE
NASA Space Apps Challenge 2026: "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the
Moon and Mars". The challenge asks teams to tell the story of hardware left on the Moon, Mars and elsewhere for
school-age space enthusiasts, who often hear only about active missions.

THE COLLECTION (verified numbers)
- 12 objects: 6 on the Moon, 6 on Mars. They arrived between 1967 and 2018.
- Exactly 1 is still used for science; the other 11 are inactive.
- Moon: Surveyor 3 (1967); Apollo 11 Lunar Module Eagle descent stage (1969); Apollo 11 Laser Ranging
  Retroreflector (1969); Apollo 11 Passive Seismometer (1969); Apollo 15 Lunar Roving Vehicle (1971);
  Apollo 17 Lunar Surface Experiments Package (1972).
- Mars: Viking 1 Lander (1976); Sojourner Rover (1997); Spirit Rover (2004); Opportunity Rover (2004);
  Phoenix Mars Lander (2008); InSight Lander (2018).

HOW EACH STORY IS TOLD (five chapters)
Designed (why it was built) → Mission (what it did) → Discovery (what it helped us learn) →
Left behind (what happened to it) → Legacy (where it stands today).
Each story also has a dated mission journey, an archive record with its resting place, coordinates and a link
to its NASA catalogue record, and for 4 objects a "Then vs Now" pair of photos.

STORY SPOTLIGHT 1: Apollo 11 Laser Ranging Retroreflector (the one still in use)
- A 46 cm square panel of 100 corner-cube mirrors that reflect laser light straight back to where it came from.
- Set up by Neil Armstrong and Buzz Aldrin in July 1969. It needs no power, so it was never switched off.
- Laser ranging measures the Earth–Moon distance to within a few millimetres.
- It showed the Moon is moving away from Earth by about 3.8 cm per year.
- Lunar laser ranging has provided data continuously for more than 57 years.
- Contrast: the Apollo 11 seismometer set up beside it stopped accepting commands on 27 August 1969.

STORY SPOTLIGHT 2: InSight Lander (Then vs Now)
- Landed in western Elysium Planitia, Mars, on 26 November 2018.
- Its seismometer recorded 1,319 marsquakes.
- Scientists found the crust under InSight is about 25–40 km thick, and that Mars has a molten core about
  1,800 km in radius, bigger than expected.
- Dust slowly covered its solar panels. Last contact 15 December 2022; NASA declared the mission over on
  21 December 2022.
- Then: its final selfie, April 2022. Now: an orbital photo from 23 October 2024 shows it taking on the same
  reddish-brown colour as the rest of Mars.

MOON VS MARS (from NASA NSSDCA fact sheets)
- Surface gravity: Moon 1.62 m/s² (about 1/6 of Earth's) | Mars 3.73 m/s² (about 2/5 of Earth's)
- Length of a day: Moon 29.5 Earth days (sunrise to sunrise) | Mars 24 hours 40 minutes
- Distance from Earth: Moon about 378,000 km | Mars 54.6 to 401.4 million km
- Air: Moon almost none | Mars thin carbon-dioxide air, under 1% of Earth's surface pressure
- Temperature: Moon −178 °C to +117 °C at the equator | Mars about −59 °C on average

NASA DATA WE USED
- NASA Space Science Data Coordinated Archive (NSSDCA) Master Catalog, the dataset listed by the challenge.
  Each object links to its NSSDCA record; landing dates, resting places, coordinates and final status come from it.
- NASA Science mission pages and nasa.gov articles to cross-check facts.
- NASA Image and Video Library for all photos, each credited and linked.
- Where no verified value exists (e.g. exact coordinates for 3 objects), the site shows "Not available"
  instead of guessing.

WHAT THE WEBSITE DOES
Landing page with live counts · Collection with Moon/Mars filter and search · Five-chapter object stories ·
Mission journeys · Then vs Now photos · Moon vs Mars comparison · Location explorer (only verified coordinates) ·
Teaching quiz that explains the story behind every answer · Works offline, on phones, and with a keyboard.
Built with plain HTML, CSS and JavaScript; no backend, no paid services.

AI USE (be honest on the slide)
AI tools helped write code and gather facts from NASA pages; every fact is linked to its NASA source,
and the team checks them. [TEAM: say what you checked.]

WHAT'S NEXT
More objects listed in the challenge (for example Viking 2 and the Ingenuity helicopter), a richer landing-site map
using the stored coordinates, and classroom use.

SLIDE PLAN
1. Title: "Lunar Echoes", subtitle "A digital museum of the machines we left behind", challenge name,
   team name [TEAM NAME]. Split background: Moon photo left (black and white), Mars photo right.
2. The problem: we know the famous missions, not what was left behind or what it taught us.
3. Our idea: a digital museum; "every machine is an echo of a mission"; the five chapters as a simple row.
4. The collection: big numbers 12 · 6 Moon · 6 Mars · 1967–2018 · 1 still in use; small list of names.
5. Spotlight: the laser reflector (photo AS11-37-5551). Big number "3.8 cm per year".
6. Spotlight: InSight Then vs Now (two photos side by side). Big number "1,319 marsquakes".
7. Moon vs Mars: two columns (silver vs rust), five rows from the comparison above.
8. Real NASA data: NSSDCA + NASA Science pages + NASA Image Library; "no fact without a source".
9. What the website does: feature icons/labels in a clean grid, plus a phone mock-up placeholder [SCREENSHOT].
10. Live demo: one line "Let's visit the museum" with a placeholder [SCREENSHOT OF LANDING PAGE].
11. AI use and what's next.
12. Thank you: team names and roles [TEAM], project link [REPO OR SITE LINK].

IMAGES TO USE (file name, then credit line to print on the slide)
- as15-86-11603~medium.jpg — NASA/JSC, Apollo 15 photo AS15-86-11603 (James Irwin at the Lunar Roving Vehicle)
- PIA17759~medium.jpg — NASA/JPL, PIA17759 (Opportunity self-portrait, January 2014)
- as11-37-5551~medium.jpg — NASA/JSC, Apollo 11 photo AS11-37-5551 (laser reflector in front, seismometer behind)
- as11-40-5903~medium.jpg — NASA/JSC, Apollo 11 photo AS11-40-5903 (Buzz Aldrin beside a leg of Eagle)
- PIA25287~medium.jpg — NASA/JPL, PIA25287 (InSight's final selfie, April 2022)
- PIA26515~orig.jpg — NASA/JPL, PIA26515 ("HiRISE Studies the Dust on InSight", image taken 23 October 2024)
- PIA00381~orig.jpg — NASA/JPL, PIA00381 (first photograph taken on the surface of Mars, Viking 1)
- AS12-48-7134~medium.jpg — NASA/JSC, Apollo 12 photo AS12-48-7134 (Alan Bean at Surveyor 3)

Also add a final small-print line on the last slide: "Photos: NASA Image and Video Library. Facts: NASA NSSDCA and
nasa.gov. This project is not affiliated with or endorsed by NASA."
```
