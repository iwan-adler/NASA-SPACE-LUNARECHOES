# Research Sources

Every fact, date, coordinate and image used in Lunar Echoes is listed here.
If it is not listed here, it does not go in the app.

All pages were read and re-checked on **14 November 2026**. Wording in `data/objects.json` is
simplified for school-age readers, but no numbers or dates were changed.

## Challenge

**NASA Space Apps Challenge 2026: "Abandoned but not Forgotten: Storytelling about NASA's Discarded
Equipment on the Moon and Mars"**
- Details: https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/
- Resources: https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources

## Challenge-listed NASA data we use

### 1. NASA Space Science Data Coordinated Archive (NSSDCA) Master Catalog (primary dataset)

- **Listed on the challenge Resources page as:** "NASA Space Science Data Coordinated Archive (NSSDCA)", https://nssdc.gsfc.nasa.gov/
- **Catalogue used:** NSSDCA Master Catalog, spacecraft records, https://nssdc.gsfc.nasa.gov/nmc/
- **How it is used in the project:**
  - Every object in `data/objects.json` has an `nssdcId` field: the NSSDCA spacecraft record its facts come from.
  - From each record we took: **landing date** (`year`, timeline), **resting place** (`site`), **landing/deployment
    coordinates** (`latitude`, `longitude`), **final operational status and date** (`status`, `statusType`), and the
    mission events in `story`.
  - The story popup shows "Resting place", "Coordinates", "Today: …" status and an **"NSSDCA record" link** built from
    `nssdcId`. The timeline is ordered by NSSDCA landing dates, and the quiz is generated from these fields.
- **Challenge-listed NSSDCA records used directly:** `1969-059C` (Apollo 11 LM, listed as "Apollo Lunar Modules") and
  `1971-063C` (Apollo 15 LM, listed as "Lunar Roving Vehicles").
  The listed ALSEP record (`1969-099C`, Apollo 12) was checked. We use the Apollo 17 ALSEP record `1972-096C` instead.

### 2. NASA Science mission pages (listed on the Resources page)

Used to cross-check NSSDCA facts and for facts NSSDCA does not give:

| Resources-page link | Used for |
|---|---|
| [Surveyor 3](https://science.nasa.gov/mission/surveyor-3/) | Cross-check of landing date; source of photo AS12-48-7134 |
| [Mars Pathfinder](https://science.nasa.gov/mission/mars-pathfinder/) | "First-ever robotic rover" on Mars; about 15 airbag bounces |
| [Spirit & Opportunity](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/) | Opportunity's last contact during a planet-wide dust storm; 45.16 km driven; record until 2026 |
| [Viking 1](https://science.nasa.gov/mission/viking-1/) | "First truly successful landing on Mars"; first images from the surface |
| [InSight](https://science.nasa.gov/mission/insight/) | Landing site and end of mission (last contact 15 Dec 2022) |

Not used (not on the Moon or Mars, or not in our 12 objects): Dawn, NEAR Shoemaker, Pioneer 10 & 11, Kepler, Ingenuity.

### 3. NASA Image and Video Library (not on the Resources page; NASA public API)

- https://images.nasa.gov, via the public API https://images-api.nasa.gov (no key needed)
- Each `image` URL and `imageCredit` was matched to the NASA image ID and its NASA description, to confirm it shows the right object.

## Object-level references

Status key: **In use** = hardware still used for science. **Inactive** = hardware no longer working.
All 12 missions have ended.

| Object (`id`) | NSSDCA record | Status (verified) | Facts and the page they come from |
|---|---|---|---|
| `surveyor-3` | [1967-035A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A) | Inactive (worked until after sunset 3 May 1967; NASA Science lists last contact 4 May 1967 UT). Parts returned to Earth | NSSDCA: purpose, triple touchdown 20 Apr 1967, 6,326 pictures, 18 cm trenches, 200 m crater in SE Oceanus Procellarum, 3.0162 S 336.582 E, Apollo 12 landed ~180 m away 19 Nov 1969. [NASA history: Apollo 12](https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon/): Conrad used cutters to remove camera, scoop and other parts; examined for effects of 31 months |
| `apollo11-eagle-descent-stage` | [1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C) | Inactive; left on the Moon | NSSDCA: first crewed vehicle to land on the Moon; landed 20 Jul 1969 20:17:40 UT at 0.67416 N 23.47314 E; "the Eagle has landed" quote; descent stage contents; ascent stage launched from the Moon and returned crew to the CSM; plaque text. Image AS11-40-5899 description: plaque on the descent-stage ladder strut. Resources page: descent stages "left behind as launch pads" |
| `apollo11-lrrr` | [1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C) | **In use** | NSSDCA: part of EASEP, needs no power. [NASA: The Apollo Experiment That Keeps on Giving](https://www.nasa.gov/missions/apollo/apollo-11/the-apollo-experiment-that-keeps-on-giving/): still used, accuracy of a few millimetres, helps spacecraft locate themselves. [NASA GSFC](https://eclipse.gsfc.nasa.gov/SEhelp/ApolloLaser.html): 100 corner cubes, 46 cm panel. [NASA Astrobiology](https://astrobiology.nasa.gov/missions/apollo-11/): Moon receding 3.8 cm/yr. [NASA ILRS](https://ilrs.gsfc.nasa.gov/science/scienceContributions/lunar.html): over 57 years of continuous ranging data |
| `apollo11-seismometer` | [1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C) | Inactive since 27 Aug 1969 | NSSDCA: purpose, dust detector, solar power (daytime only), 17 m south of LM at 0.6735 N 23.4730 E, on 21 Jul 1969, 30 °C above planned maximum, stopped accepting commands 27 Aug 1969 |
| `apollo15-lrv` | [1971-063C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C) | Inactive; parked on the Moon | NSSDCA: landed 30 Jul 1971 at foot of Apennines; LRV used up to 5 km from LM; first use, very successful; 27.9 km and 77.31 kg; ascent stage returned crew. Resources page: LRVs "parked permanently on the Moon" |
| `apollo17-alsep` | [1972-096C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-096C) | Inactive since 30 Sep 1977 (shut down) | NSSDCA: last Apollo landing, SNAP-27 RTG, central station 20.1921 N 30.7649 E, on 12 Dec 1972, shut down 30 Sep 1977, explosive packages, first scientist-astronaut, orange soil |
| `viking1-lander` | [1975-075C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C) | Inactive since 13 Nov 1982 (contact lost) | NSSDCA: objectives; separated 20 Jul 1976 08:51 UT, touched down 11:53:06 UT; 22.27 N 312.05 E; first image 25 s after landing; seismometer failed to uncage; stuck pin 5 days; operated until 13 Nov 1982. NASA Science: "first truly successful landing on Mars"; first images from the surface |
| `sojourner` | [1996-068A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A) | Inactive since 27 Sep 1997 (contact lost) | NSSDCA (+ [rover record](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=MESURPR)): size, landed 4 Jul 1997, rover on surface 6 Jul, comms lost 27 Sep 1997, Ares Vallis 19.33 N 33.55 W, flood comparison. NASA Science: first rover on Mars, ~15 bounces |
| `spirit` | [2003-027A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A) | Inactive since 22 Mar 2010 | NSSDCA: goals, landed 4 Jan 2004 at 14.572 S 175.478 E, lost a wheel, stuck 23 Apr 2009, last transmission 22 Mar 2010, 7.73 km in 6 yr 2 mo. NASA Science: "concluded its mission in 2010" |
| `opportunity` | [2003-032A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A) | Inactive since 10 Jun 2018 | NSSDCA: arrived 25 Jan 2004, 20 m crater at 1.946 S 354.473 E, "Hematite Site", final communication 10 Jun 2018. NASA Science: dust storm, 45.16 km, record until Perseverance passed it on 11 Oct 2026 |
| `phoenix` | [2007-034A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-034A) | Inactive since 2 Nov 2008 (power ran out) | NSSDCA: objectives, landed 25 May 2008 at 68.15 N 125.9 W, 30–60 % ice, last signal 2 Nov 2008. [NASA press release, 31 Jul 2008](https://nssdc.gsfc.nasa.gov/planetary/text/phoenix_pr_20080731.txt) (linked from NSSDCA): water identified in a soil sample; "touched and tasted" |
| `insight` | [2018-042A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A) | Inactive; last contact 15 Dec 2022, declared over 21 Dec 2022 | NSSDCA: objectives, landed western Elysium Planitia 26 Nov 2018. [NASA: InSight retired](https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/): 1,319 marsquakes, last contact 15 Dec, two missed calls. [NASA Science highlights](https://science.nasa.gov/mission/insight/science-highlights/): crust 25–40 km, molten core ~1,800 km radius |

### Story chapters, journeys and Then vs Now (added in the museum upgrade)

The five story chapters reuse the facts above:
- **Designed** = `purpose`
- **Mission** = `story`
- **Discovery** = `science`
- **Left behind** = `fate`
- **Legacy** = `legacy` + `status`

The new `fate`, `legacy` and `events` text uses only facts from the pages already listed, plus the following:

| Object | New fact | Source |
|---|---|---|
| `surveyor-3` | Launched 17 Apr 1967 | [NASA Science: Surveyor 3](https://science.nasa.gov/mission/surveyor-3/) |
| `surveyor-3` | Apollo 12 "pinpoint landing … within walking distance" | [NASA history: Apollo 12](https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon/) |
| `apollo11-eagle-descent-stage` | Armstrong stepped onto the surface 02:56:15 UT, 21 Jul 1969 | NSSDCA 1969-059C |
| `apollo15-lrv` | LRV unloaded and driven on 31 Jul; 12.5 km traverse on 1 Aug; third EVA on 2 Aug 1971 | NSSDCA 1971-063C |
| `apollo17-alsep` | LM lifted off from the Moon 14 Dec 1972, 22:54:37 UT | NSSDCA 1972-096C |
| `viking1-lander` | Launched 20 Aug 1975; entered Mars orbit 19 Jun 1976. NASA's later missions continue "building on what the Vikings began" | NSSDCA 1975-075C; NASA Science: Viking 1 |
| `sojourner` | Launched 4 Dec 1996; lander imaged the rover and relayed its data; mission objective "was met" | NSSDCA 1996-068A |
| `spirit` | Drove off its platform 15 Jan 2004 | NSSDCA 2003-027A |
| `phoenix` | Launched 4 Aug 2007 | NSSDCA 2007-034A |
| `insight` | Launched 5 May 2018. The arm placed the seismometer on the ground | NASA Science: InSight; NSSDCA 2018-042A |
| `apollo11-lrrr` | Moon's recession rate from Earth 3.8 cm/yr (independent confirmation) | [NSSDCA Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html) |

**Then vs Now photos.** These were used only where NASA's own image description confirms the photo shows that hardware later on:

| Object | NASA image | What NASA's description says |
|---|---|---|
| Apollo 11 Eagle | [PIA12909](https://images.nasa.gov/details/PIA12909) (NASA/JPL, 2009) | Lunar Reconnaissance Orbiter "passed over the site again providing a new view of the historic site" |
| Opportunity | [PIA22549](https://images.nasa.gov/details/PIA22549) (NASA/JPL, 2018) | HiRISE, 20 Sep 2018, from ~268 km: "Opportunity appears as a blip" after the dust storm |
| Phoenix | [PIA22223](https://images.nasa.gov/details/PIA22223) (NASA/JPL, 2018) | HiRISE images from 20 Jul 2008 and 21 Dec 2017: "dust had obscured much of what was visible". Also gives 68° N, 234° E, which matches our −125.9° E |
| InSight | [PIA26515](https://images.nasa.gov/details/PIA26515) (NASA/JPL, 2024) | HiRISE images up to 23 Oct 2024: InSight "acquires the same reddish-brown hue"; the landing scorch mark fades |

### Moon vs Mars comparison (`data/worlds.json`)

| Fact | Moon | Mars | Source |
|---|---|---|---|
| Radius | 1,737.4 km | 3,389.5 km | [NSSDCA Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html), [NSSDCA Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html) |
| Surface gravity | 1.62 m/s² (0.165 × Earth) | 3.73 m/s² (0.380 × Earth) | same |
| Length of day | synodic period 29.53 days | 24.6597 h | same |
| Distance from Earth | 378,000 km | 54.6 to 401.4 million km | same |
| Air | 3 × 10⁻¹⁵ bar (night) | 6.36 mb, 95.1 % CO₂. Under 1 % of Earth's 1014 mb ([NSSDCA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)) | same |
| Temperature | 95 K to 390 K at the equator (−178 to +117 °C) | ~214 K (−59 °C) average | same |

The museum counts (objects per world, first and latest arrival, number still in use) are calculated from `data/objects.json`.

### Corrections made during the upgrade

- The old timeline intro said "From the first robot on the Moon…". Surveyor 3 was **not** the first robot on the Moon, so the line was rewritten.
- One planned journey event (the seismometer's restart on its second lunar day) was dropped. NSSDCA confirms the restart but gives no date.

### Beyond the Mission: Evidence Room, Future Explorer, heritage passports

**New primary source:** *NASA's Recommendations to Space-Faring Entities: How to Protect and Preserve the
Historic and Scientific Value of U.S. Government Lunar Artifacts* (release 20 Jul 2011, Rev A 28 Oct 2011):
https://www.nasa.gov/wp-content/uploads/2017/10/617743main_nasa-usg_lunar_historic_sites_reva-508.pdf
(text extracted and read 14 Nov 2026). Facts used, with page numbers:

| Page | Fact used | Used in |
|---|---|---|
| 5 | Sites "continue to produce material, biological, and physical scientific data associated with long-term exposure of human-created systems … to the lunar environment" | Future Explorer (option D) |
| 6 | "These recommendations are not legal requirements; rather they are technical recommendations for consideration by interested entities." | Future Explorer closing |
| 7–8 | 2.0 km no-overflight radius for heritage lander sites (e.g. Apollo, Surveyor): plume, exhaust-blown dust, failure during descent | Future Explorer (C); Surveyor 3 and Apollo 15 heritage |
| 9 | Returned Surveyor 3 parts "showed chemical contamination from Apollo 12 LM exhaust" | Future Explorer (B); Surveyor 3 heritage |
| 13 | Surveyor 3 "received significant sandblasting and pitting from the Apollo landing" | Future Explorer (B) |
| 17 | "all the Apollo sites represent significant historical/heritage value in material culture"; Apollo 11 and 17 treated as unique, no visits; Apollo 11 exclusion zone 75 m from the descent stage, Apollo 17 225 m; Apollo 11 "a watershed in human history and humanity" | Case LE-003, heritage of the Eagle, seismometer, LRV and ALSEP |
| 18 | The Apollo 11 retro-reflector "continues to be an active scientific experiment and can be easily degraded by particulate and chemical contamination" | Case LE-001, Future Explorer (A), LRRR heritage |
| 20 | Laser ranging retro-reflectors "should be carefully preserved"; they are at the Apollo 11, 14 and 15 sites and the Lunokhod 1 and 2 sites | LRRR heritage |

**Other evidence used in the case files:**
- **[NASA image AS11-40-5899](https://images.nasa.gov/details/as11-40-5899):** the plaque "was attached to the ladder on the landing gear strut on the descent stage" (case LE-003).
- **Space Apps Resources page:** descent stages "left behind as launch pads" (case LE-003 explanation).
- **NASA NSSDCA 2003-027A:** Spirit stuck in sand and its last transmission in 2010 (case LE-002, used to contrast it with Opportunity).

**Discrepancy recorded, not used:** NSSDCA says Apollo 12 landed "about 180 m" from Surveyor 3, while NASA's 2011 document (p. 13) says 155 m. The story text keeps the NSSDCA figure; the new features use neither.

**Evidence boundary:** every statement in the Evidence Room, the passports and the Future Explorer is labelled:
- **Verified:** quoted or summarised from a linked NASA source.
- **Interpretation:** our reasoning, written in `significance`, `heritage.interpretation`, `reflection` and the choice `verdict`.
- **Unknown:** not documented in our sources, e.g. close-up condition today, missing coordinates, and NASA heritage guidance for Mars.
- **Hypothetical:** the Future Explorer scenario.

Interpretations are our team's views and should be reviewed by a human.

### BEYOND THE ARCHIVE: citizen science on the Moon and Mars (`data/citizen-science.json`)

All pages were read on 14–15 Nov 2026. Real participation happens only on the official project sites. Nothing done on our site is sent anywhere.

**Moon: MoonDiff**

| Fact used | Source |
|---|---|
| MoonDiff compares NASA Lunar Orbiter (1967) and LRO (2009–present) images. Volunteers "comb" for new craters to explore what impacts are like and how often they happen. PI Aaron Curtis: rocks from space hit the Moon several times a month, spacecraft land and sometimes crash, landslides. Volunteers "might also spot historical objects, like the missing ascent stage of the Apollo 11 lunar lander". | [NASA: Join MoonDiff… (1 Aug 2023)](https://science.nasa.gov/get-involved/citizen-science/join-moondiff-and-go-moon-combing-with-nasa/) |
| Five Lunar Orbiter missions (1966–67) covered 99% of the Moon; film was developed on board, scanned, radioed to Earth and stored on analog tape; up to ~2 m resolution; digitised by LOIRP with NASA from 2008. LRO since 2009, up to ~0.5 m, "still flying" as of Feb 2023. LRO–LRO comparison found 222 new craters in 14 years. LO–LRO pairs differ in angle and lighting and do not line up, so change detection "is beyond the capabilities of today's cleverest software". Open questions: cratering rate, missing crash sites, current geologic change. | [MoonDiff background](https://trek.nasa.gov/app/background/) |
| The workflow: pairs are map-projected and coregistered (features can sit "several kilometers away" before that); volunteers compare side by side, or by blinking or fading, and draw polygons around changes; lunar experts review each change; discoveries are written up as papers, with contributors credited | [MoonDiff background](https://trek.nasa.gov/app/background/) |
| Official participation site (MoonDiff on Moon Trek; offers sign-up, tour and intro video) | https://trek.nasa.gov/app/ (same app as https://trek.nasa.gov/moondiff) |
| The Apollo 16 S-IVB impact site, the Narrow Angle Camera, deliberate impacts measured by Apollo seismometers, ~30 km from the tracking estimate | [NASA image GSFC_20171208_Archive_e000501](https://images.nasa.gov/details/GSFC_20171208_Archive_e000501) |

**No verified image pair.** No authentic, published, co-registered Lunar Orbiter / LRO pair could be obtained. Building one from raw archive data would mean doing our own coregistration. The **Compare** stage is therefore a labelled *illustration* (drawn SVG shapes) that teaches align, blink, fade and flag. Its "film scratch" false alarm is modelled on the background page's description of LO film reassembled from strips by hand.

**Mars: Cloudspotting on Mars: Shapes** (not to be confused with the original Cloudspotting on Mars project)

| Fact used | Source |
|---|---|
| Launched 2024. Clouds help regulate the climate; open questions about daily, seasonal and yearly patterns, winds and similarity to Earth. Volunteers tag clouds in MAVEN images. Tutorial takes 10–15 min. Caption of the two-view image. | [NASA: Cloudspotting on Mars: Shapes](https://science.nasa.gov/citizen-science/cloudspotting-on-mars-shapes/) |
| Twilight, vortex and disk clouds; check that a feature "isn't a volcano or patch of ice on the surface"; insights into water vapour, winds and daily weather; present-day conditions are key to past climate; MAVEN entered orbit 21 Sept 2014, studies the atmosphere's response to the Sun and solar wind and atmospheric loss, and was "still taking new data"; open to everyone, no deadline; an original Cloudspotting on Mars project also exists | [NASA: New Project Invites You To Do Martian Cloud Science with NASA (29 Oct 2024)](https://science.nasa.gov/get-involved/citizen-science/new-project-invites-you-to-do-martian-cloud-science-with-nasa/) |
| Cloud shapes (disk, vortex, streak, gravity-wave, twilight); round features that "are actually craters"; the red line marks sunrise and sunset; clouds reflect sunlight and absorb outgoing infrared | Zooniverse project 17802: field guide and introduction (public API) |
| Project status | Zooniverse API on 15 Nov 2026: `state: live`, `launch_approved: true` |
| Official participation site | https://www.zooniverse.org/projects/matteocrismani/cloudspotting-on-mars-shapes |

**Archive connections** reuse facts already sourced above: the Viking 1 meteorology boom (NSSDCA 1975-075C), Phoenix's polar climate and weather goals (NSSDCA 2007-034A), Opportunity and the dust storm, and InSight's dust-covered panels.

**Images:**
- **Moon:** "LRO Finds Apollo 16 Booster Rocket Impact Site", NASA/Goddard/Arizona State University.
- **Mars:** the MAVEN two-view image, NASA/LASP/CU Boulder, image processing by Kyle Connour.
- **Offline copies:** both are in `assets/images/`.

**Interpretations (labelled on the page):**
- The Moon Observation Lab's "best" answers and the can/cannot summaries.
- "Things that only look like changes".
- The connect-stage intros.
- The comparison summary.

**Not used:** MoonDiff's article screenshot, and PIA18613. NASA describes PIA18613 as showing an escaping atmosphere, not clouds.

**Extended learning (`data/beyond-learning.json`, added 15 Nov 2026).** Every item carries source keys that resolve to the URLs listed in that file. Additional facts:

| Fact used | Source |
|---|---|
| IUVS measures ultraviolet; clouds reflect UV strongly and appear white; IUVS has five observing modes; it has observed since 2014; images are built by scanning, so the disk looks sliced; clouds form from water ice and CO₂ ice (CO₂ ≈ 95% of the atmosphere); clouds may reveal otherwise invisible winds; Earth analogues (gravity-wave, cap clouds); goal of mapping six major cloud types into a database and library | Zooniverse project 17802: science case, FAQ and introduction (public API, read 15 Nov 2026) |
| The project's images come from IUVS. NASA's caption for our specific image does **not** name the instrument, so the "Science behind the image" panel labels it **Unknown** with that explanation. | as above + [NASA: Cloudspotting on Mars: Shapes](https://science.nasa.gov/citizen-science/cloudspotting-on-mars-shapes/) |
| No observation date is given for either demo image | NASA image record GSFC_20171208_Archive_e000501; NASA Cloudspotting page caption |
| Heritage questions: 2011 recommendations (75 m, 225 m, 2 km, non-binding; anticipated more formal and perhaps multilateral guidance; tangential low fly-by imaging "with minimal risk") | [NASA's Recommendations to Space-Faring Entities (2011)](https://www.nasa.gov/wp-content/uploads/2017/10/617743main_nasa-usg_lunar_historic_sites_reva-508.pdf), pp. 5, 7, 17, 28 |
| MoonDiff's intro video (linked, not embedded) | https://trek.nasa.gov/app/static/moondiff_intro.webm |

**Our own content:**
- **Explanations, labelled "Interpretation":** some Ask answers on scientific method, the Moon image's "Scientific purpose" row, and some lab feedback.
- **Visitor-generated content:**
  - Profile pathway suggestions: rule-based, nothing stored.
  - Charter: visitor-written, and labelled as not NASA policy.
  - Journal: session-only, and labelled as not a certificate.

No participation statistics or research outcomes are stated anywhere.

### The Last Signal (`data/last-signal.json`)

- **Events** reuse the sourced `events`, `fate` and `status` fields in `data/objects.json`.
- **Launch dates** added for objects whose events did not include one. Each comes from the NSSDCA record linked on that channel:
  - Apollo 11: 1969-07-16 ([1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C))
  - Apollo 15: 1971-07-26 ([1971-063C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C))
  - Apollo 17: 1972-12-07 ([1972-096C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-096C))
  - Spirit: 2003-06-10 ([2003-027A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A))
  - Opportunity: 2003-07-08 ([2003-032A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A))
- **Last documented event:** for each object it is the matching event already in `objects.json`.
  - Three channels are marked as "exact final communication not recorded in our sources": Surveyor 3, the Eagle descent stage and the Apollo 15 rover. The page shows their last documented event instead.
  - No final transmission, conversation or log is quoted or invented.
- **Durations** ("from arrival to the last documented event") are calculated by the page from those dates. They are not quoted figures.

### The Planetary Detective workspace (`data/cases.json` → `claims`, `unknowns`)

- Each claim is classified as Confirmed evidence, Reasonable interpretation, Unconfirmed possibility or Unknown.
- Each claim links to one of the evidence sources already listed for that case above.
- **Written by AI and labelled:**
  - the claims and their explanations;
  - the "What remains uncertain" lists, which only say what our sources do *not* document.

### The Forgotten Footprints heritage map (`data/heritage-map.json`)

- **Basemaps (equirectangular, centred on 0° longitude):**
  - **Moon:** NASA's Scientific Visualization Studio CGI Moon Kit, `lroc_color_2k.jpg` (LRO camera colour mosaic), https://svs.gsfc.nasa.gov/4720/. Saved as `assets/images/maps/moon-lroc-color-2k.jpg`.
  - **Mars:** Viking MDIM 2.1 colorized global mosaic (NASA/USGS), stitched from NASA Mars Trek's zoom-2 map tiles (`Mars_Viking_MDIM21_ClrMosaic_global_232m`), https://trek.nasa.gov/mars/. Saved as `assets/images/maps/mars-viking-mdim21-2k.jpg`.
  - Both were checked against known features: Olympus Mons at about 18° N, 134° W; Tycho and Mare Tranquillitatis on the Moon.
- **Verified positions:** `latitude`/`longitude` in `data/objects.json` (NSSDCA).
- **Approximate positions**, labelled on the map:
  - The Apollo 11 reflector is plotted at the seismometer's recorded position. NSSDCA 1969-059C: the reflector was deployed "about 5 meters NNW of the EASEP".
  - The Apollo 15 rover is plotted at the Apollo 15 landing site, 26.13239 N 3.63330 E (NSSDCA 1971-063C). Its final parking spot is not in our sources.
- **Unknown:** InSight. NSSDCA 2018-042A gives only the region (western Elysium Planitia), so it is listed, not plotted.

### Mission Footprints Lab (`data/footprints.json`)

- **Descriptions:** read from the NASA Image and Video Library API (15 Nov 2026) for:
  - AS11-37-5551, PIA12909, AS12-48-7134
  - PIA00381, PIA04318, PIA22549
  - PIA22223, PIA26515, PIA25287
- **Instrument field:** filled only where NASA names one (Viking Lander camera #2, Imager for Mars Pathfinder, HiRISE). Elsewhere it is marked Unknown.
- **Before/after slider:** only PIA22223, figures 1 and 2 (HiRISE PSP_009290_2485, 20 Jul 2008, and ESP_053451_2485, 21 Dec 2017). NASA says the two cover the same ~300 m area, "closely matched in viewing and illumination geometry". Source files: https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia22/pia22223/figures/PIA22223_fig1.jpg (and `_fig2`), resized to 900 px in `assets/images/footprints/`.
- **AS12-48-7134:** NASA's title names Alan Bean, but its description says Conrad is examining the camera. The lab shows this as an open question rather than choosing.

### Evidence or Assumption? (`data/evidence-game.json`), Ethics of Exploration (`data/ethics.json`)

- Every evidence statement and every "Verified" consequence reuses a source already listed in this document.
- The claims, explanations and "Interpretation" consequences were written by AI and are labelled as interpretation.

### Build Your Own Rover (`rover/build-data.json`)

- An educational simulation. The missions are fictional, and costs, masses and power values are illustrative.
- The "Real-world reference" notes are the only factual statements, sourced from:
  - NSSDCA 2003-027A, 2003-032A and 1975-075C;
  - NASA's InSight retirement article;
  - PIA22223.

### ROVER RESCUE: Mission to Discover (`rover/rover-data.json`)

An educational mini-game. **All instrument readings are SIMULATED**: illustrative qualitative values (e.g. "Iron: High")
chosen to match the published descriptions below. They are not real NASA measurements. The map, rover, energy
budget and sample positions are fictional, and the game says so on screen and in every printout. Sources were read on 15 Nov 2026.

| Game content | What the source supports | Source |
|---|---|---|
| Mare basalt (Moon) | Maria are dark, low-lying lava plains. High-Ti group: 3,550–3,850 million years and 9–13% TiO2. Low-Ti group: 3,150–3,450 million years and 1–5% TiO2. Orange glass 74220 could be the cause of the dark mantle at the edge of Mare Serenitatis. | [NASA JSC LPETSS: Mare Basalt Volcanism](https://astromaterials.jsc.nasa.gov/education/LPETSS/marebasalt.cfm) |
| Anorthosite (Moon) | Highland crust; lunar anorthosites are "ferroan anorthosites"; all highland samples have undergone several cratering events. | [NASA JSC LPETSS: Plutonic Rocks](https://astromaterials.jsc.nasa.gov/education/LPETSS/Plutonic.cfm) |
| Impact breccia (Moon) | Breccias are aggregates of clastic debris and melt from meteorite bombardment; most Apollo breccias formed in the highlands about 3,900–4,000 million years ago. | [NASA JSC LPETSS: Lunar Breccias](https://astromaterials.jsc.nasa.gov/education/lpetss/breccias.cfm) |
| Regolith (Moon) | Fine grey soil; about half finer than 60–80 microns; micrometeorites form agglutinates; the solar wind implants H and He. | [NASA JSC LPETSS: The Lunar Regolith](https://astromaterials.jsc.nasa.gov/education/LPETSS/Regolith.cfm) |
| Orange soil (Moon) | Schmitt's Apollo 17 discovery near Shorty Crater: small spherical glass beads with a high titanium content. | [NASA: 50 Years Ago, Apollo 17 Lands at Taurus-Littrow](https://www.nasa.gov/history/50-years-ago-apollo-17-lands-at-taurus-littrow/) |
| Olivine basalt (Mars) | Spirit's plains: olivine-bearing basalts covered by wind-blown dust; coatings and vein fillings from a minor amount of aqueous transport. | [NASA NTRS 20080026038](https://ntrs.nasa.gov/citations/20080026038) |
| Hematite spherules (Mars) | Gray crystalline hematite usually forms with liquid water on Earth; "blueberries" embedded in soft layered sandstone; formed from acidic groundwater. | [NASA Science: Meridiani Planum](https://science.nasa.gov/resource/meridiani-planum-2/), [Six Things to Know About Opportunity](https://science.nasa.gov/missions/mer/six-things-to-know-about-nasas-opportunity-rover/) |
| Layered sandstone (Mars) | First sedimentary rocks identified on another planet; formed in ancient ephemeral playas. | [Six Things to Know About Opportunity](https://science.nasa.gov/missions/mer/six-things-to-know-about-nasas-opportunity-rover/) |
| Gypsum vein (Mars) | White gypsum veins at Endeavour crater's rim: a telltale sign of water travelling through underground fractures. | Same page |
| Red dust (Mars) | Iron minerals in the Martian dirt oxidize (rust), so the surface looks red. | [NASA Science: Mars Facts](https://science.nasa.gov/mars/facts/) |
| Camera, spectrometer, microscope instruments | Modelled on Spirit and Opportunity's Pancam, APXS, Mössbauer spectrometer and Microscopic Imager. | [NSSDCA 2003-027A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A) |
| Magnetic sensor | Modelled on the sampler-arm magnet of Viking 1 (whose goals included magnetic properties), Spirit's magnet array and Apollo 16's portable surface magnetometer. | [NSSDCA 1975-075C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C), [2003-027A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A), [1972-031C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-031C) |

Written by AI and labelled in the game: the qualitative readings, the reasoning questions and their explanations, and the
"uncertainty" notes.

### Coordinates

- Stored as planetocentric degrees, **east longitude positive, −180 to 180**.
  NSSDCA values in 0–360° E or ° W were converted (e.g. 312.05° E → −47.95; 33.55° W → −33.55).
- `null` (shown as "Not available") where NSSDCA gives no position for that exact object: the Apollo 11 reflector,
  the Apollo 15 rover's final parking spot, and InSight. NSSDCA's linked table of ALSEP and reflector locations
  (`/planetary/lunar/lunar_sites.txt`) returned 404 on 14 Nov 2026.

## Image credits

Map basemaps: NASA SVS CGI Moon Kit (LRO); Viking MDIM 2.1 colorized mosaic (NASA/USGS) via NASA Mars Trek.
Phoenix comparison figures: NASA/JPL-Caltech/Univ. of Arizona, PIA22223.

All images: **NASA Image and Video Library**. Each ID was matched to its NASA description.
NASA media usage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/

| Object | NASA image ID | Credit | Shows (from NASA description) |
|---|---|---|---|
| Surveyor 3 | [AS12-48-7134](https://images.nasa.gov/details/AS12-48-7134) | NASA/JSC | Alan Bean at Surveyor 3, Apollo 12 LM behind |
| Eagle descent stage | [as11-40-5903](https://images.nasa.gov/details/as11-40-5903) | NASA/JSC | Aldrin walking near a leg of LM "Eagle" |
| Apollo 11 reflector | [as11-37-5551](https://images.nasa.gov/details/as11-37-5551) | NASA/JSC | Laser reflector (front) and seismometer (back) |
| Apollo 11 seismometer | [as11-40-5942](https://images.nasa.gov/details/as11-40-5942) | NASA/JSC | Aldrin carrying the EASEP experiments |
| Apollo 15 rover | [as15-86-11603](https://images.nasa.gov/details/as15-86-11603) | NASA/JSC | Irwin at the rover, Hadley-Apennine |
| Apollo 17 ALSEP | [as17-147-22548](https://images.nasa.gov/details/as17-147-22548) | NASA/JSC | ALSEP in the background |
| Viking 1 | [PIA00381](https://images.nasa.gov/details/PIA00381) | NASA/JPL | First photo from the surface of Mars |
| Sojourner | [PIA04318](https://images.nasa.gov/details/PIA04318) | NASA/JPL | Sojourner near the "Rock Garden" |
| Spirit | [PIA16442](https://images.nasa.gov/details/PIA16442) | NASA/JPL | Self-portrait, McMurdo panorama (2006) |
| Opportunity | [PIA17759](https://images.nasa.gov/details/PIA17759) | NASA/JPL | Self-portrait, January 2014 |
| Phoenix | [PIA10691](https://images.nasa.gov/details/PIA10691) | NASA/JPL | Phoenix footpad on Mars |
| InSight | [PIA25287](https://images.nasa.gov/details/PIA25287) | NASA/JPL | Final selfie, April 2022 |

**Offline copies:** the 16 images above (12 object photos plus 4 Then vs Now photos) were downloaded unchanged
from `images-assets.nasa.gov` on 14 Nov 2026 into `assets/images/`, keeping NASA's file names. Each was
checked to be a JPEG. The credits and links above still apply.

**Credit-line note:** the image library lists the NASA centre (JSC or JPL). Some JPL photojournal pages credit
"NASA/JPL-Caltech" plus partners (e.g. Cornell for the rover cameras). This needs a human check before final submission.

## Branding

- [x] No NASA or Space Apps logos (NASA logo, NASA wordmark, Space Apps marks) are used anywhere in the site.
- [x] Footer states the project is not affiliated with or endorsed by NASA.
- [ ] Before adding any logo, read the Space Apps brand guidelines: https://www.spaceappschallenge.org/brand/
