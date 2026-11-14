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

### Coordinates

- Stored as planetocentric degrees, **east longitude positive, −180 to 180**.
  NSSDCA values in 0–360° E or ° W were converted (e.g. 312.05° E → −47.95; 33.55° W → −33.55).
- `null` (shown as "Not available") where NSSDCA gives no position for that exact object: the Apollo 11 reflector,
  the Apollo 15 rover's final parking spot, and InSight. NSSDCA's linked table of ALSEP and reflector locations
  (`/planetary/lunar/lunar_sites.txt`) returned 404 on 14 Nov 2026.

## Image credits

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

**Credit-line note:** the image library lists the NASA centre (JSC or JPL). Some JPL photojournal pages credit
"NASA/JPL-Caltech" plus partners (e.g. Cornell for the rover cameras). This needs a human check before final submission.

## Branding

- [x] No NASA or Space Apps logos (NASA logo, NASA wordmark, Space Apps marks) are used anywhere in the site.
- [x] Footer states the project is not affiliated with or endorsed by NASA.
- [ ] Before adding any logo, read the Space Apps brand guidelines: https://www.spaceappschallenge.org/brand/
