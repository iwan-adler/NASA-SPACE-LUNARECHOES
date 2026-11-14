# Research Sources

Every fact, date, coordinate and image used in Lunar Echoes is listed here.
If it is not listed here, it does not go in the app.

Facts were taken from the pages below on 14 November 2026. Wording in `data/objects.json`
is simplified for school-age readers, but no numbers or dates were changed.

## Primary data source

**NASA Space Science Data Coordinated Archive (NSSDCA) Master Catalog**:
https://nssdc.gsfc.nasa.gov/nmc/ – NASA's official archive of spacecraft records.
Used for landing dates, landing coordinates, mission events, end-of-mission dates and distances.

## Facts by object

| Object (`id`) | Facts used | Source |
|---|---|---|
| `surveyor-3` | Purpose; triple touchdown 20 Apr 1967; worked until after sunset 3 May; 6,326 pictures; trenches to 18 cm; site 3.0162 S, 336.582 E; Apollo 12 landed ~180 m away on 19 Nov 1969 | [NSSDCA 1967-035A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A) |
| `surveyor-3` | Conrad and Bean removed parts including the TV camera, returned to Earth | [NASA: Apollo 12 pinpoint landing](https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon/), [NTRS 19710024418](https://ntrs.nasa.gov/citations/19710024418) |
| `apollo11-lrrr` | Still in use; Moon receding ~3.8 cm/year | [NASA: The Apollo Experiment That Keeps on Giving](https://www.nasa.gov/missions/apollo/apollo-11/the-apollo-experiment-that-keeps-on-giving/), [NASA Astrobiology: Apollo 11](https://astrobiology.nasa.gov/missions/apollo-11/), [NASA ILRS lunar science](https://ilrs.gsfc.nasa.gov/science/scienceContributions/lunar.html) |
| `apollo11-lrrr` | 100 corner-cube reflectors | [NASA GSFC: Measuring the Moon's Distance](https://eclipse.gsfc.nasa.gov/SEhelp/ApolloLaser.html) |
| `apollo11-lrrr` | Part of EASEP; required no power | [NSSDCA 1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C) |
| `apollo11-seismometer` | Purpose; dust detector; deployed ~17 m south of LM at 0.6735 N, 23.4730 E; switched on 21 Jul 1969; ran 30 °C above planned max; stopped accepting commands 27 Aug 1969; solar powered (daytime only) | [NSSDCA 1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C) |
| `apollo15-lrv` | Landed 30 Jul 1971 at foot of Apennines; rover used up to 5 km from LM; first use of such a vehicle; 27.9 km covered, 77.31 kg samples; ascent stage returned crew | [NSSDCA 1971-063C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C) |
| `apollo17-alsep` | Last Apollo landing; SNAP-27 RTG power; central station 20.1921 N, 30.7649 E; on 12 Dec 1972; shut down 30 Sep 1977; explosive packages; Schmitt first scientist-astronaut; orange soil | [NSSDCA 1972-096C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-096C) |
| `viking1-lander` | Purpose; separated from orbiter 20 Jul 1976 08:51 UT and touched down 11:53 UT; 22.27 N, 312.05 E; first image began 25 s after landing; seismometer failed to uncage; stuck pin 5 days; operated until 13 Nov 1982 | [NSSDCA 1975-075C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C) |
| `viking1-lander` | First photograph taken on the surface of Mars | [NASA image PIA00381](https://images.nasa.gov/details/PIA00381) |
| `sojourner` | Size 630 × 280 mm; landed 4 Jul 1997, ≥15 bounces; rover on surface 6 Jul; contact lost 27 Sep 1997; Ares Vallis 19.33 N, 33.55 W; flood volume comparison | [NSSDCA 1996-068A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A), [NSSDCA Pathfinder rover](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=MESURPR) |
| `spirit` | Goals; landed 4 Jan 2004 at 14.572 S, 175.478 E; lost a wheel; stuck 23 Apr 2009; last transmission 22 Mar 2010; 7.73 km in 6 yr 2 mo | [NSSDCA 2003-027A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A) |
| `opportunity` | Arrived 25 Jan 2004; 20 m crater at 1.946 S, 354.473 E; "Hematite Site"; final communication 10 Jun 2018 | [NSSDCA 2003-032A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A) |
| `phoenix` | Objectives; landed 25 May 2008 at 68.15 N, 125.9 W; last signal 2 Nov 2008 as power ran out; NASA press release "Spacecraft Confirms Martian Water, Mission Extended" 31 Jul 2008 (linked from NSSDCA page) | [NSSDCA 2007-034A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-034A) |
| `insight` | Objectives; landed western Elysium Planitia 26 Nov 2018; mission declared over 21 Dec 2022 | [NSSDCA 2018-042A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A) |
| `insight` | 1,319 marsquakes; magnitude ~5 on 4 May 2022; retired because of dust on solar panels | [NASA: InSight retired](https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/), [NASA Science: InSight highlights](https://science.nasa.gov/mission/insight/science-highlights/) |

### Coordinates

- Stored as planetocentric degrees, **east longitude positive, −180 to 180**.
- NSSDCA values given as 0–360° E or as ° W were converted (e.g. 312.05° E → −47.95; 33.55° W → −33.55).
- `null` (shown as "Not available") where NSSDCA did not give a position for that exact object:
  the Apollo 11 reflector, the Apollo 15 rover's final parking spot, and InSight.

## Image credits

All images come from the **NASA Image and Video Library** (https://images.nasa.gov),
fetched through its free public API (https://images-api.nasa.gov, no key needed).
Each image ID was checked against its NASA description to confirm it shows the right object.
NASA images are generally not copyrighted. See NASA's media usage guidelines:
https://www.nasa.gov/nasa-brand-center/images-and-media/

| Object | NASA image ID | Credit | Shows |
|---|---|---|---|
| Surveyor 3 | [AS12-48-7134](https://images.nasa.gov/details/AS12-48-7134) | NASA/JSC | Alan Bean at Surveyor 3, Apollo 12 LM behind |
| Apollo 11 reflector | [as11-37-5551](https://images.nasa.gov/details/as11-37-5551) | NASA/JSC | Laser reflector (front) and seismometer (back) |
| Apollo 11 seismometer | [as11-40-5942](https://images.nasa.gov/details/as11-40-5942) | NASA/JSC | Aldrin carrying EASEP |
| Apollo 15 rover | [as15-86-11603](https://images.nasa.gov/details/as15-86-11603) | NASA/JSC | Irwin at the rover |
| Apollo 17 ALSEP | [as17-147-22548](https://images.nasa.gov/details/as17-147-22548) | NASA/JSC | ALSEP in background |
| Viking 1 | [PIA00381](https://images.nasa.gov/details/PIA00381) | NASA/JPL | First photo from the surface of Mars |
| Sojourner | [PIA04318](https://images.nasa.gov/details/PIA04318) | NASA/JPL | Sojourner near the "Rock Garden" |
| Spirit | [PIA16442](https://images.nasa.gov/details/PIA16442) | NASA/JPL | Self-portrait, McMurdo panorama |
| Opportunity | [PIA17759](https://images.nasa.gov/details/PIA17759) | NASA/JPL | Self-portrait, Jan 2014 |
| Phoenix | [PIA10691](https://images.nasa.gov/details/PIA10691) | NASA/JPL | Phoenix footpad on Mars |
| InSight | [PIA25287](https://images.nasa.gov/details/PIA25287) | NASA/JPL | Final selfie, Apr 2022 |

## Branding

- [x] No NASA or Space Apps logos (meatball, worm, Space Apps marks) are used anywhere in the site.
- [x] Footer states the project is not affiliated with or endorsed by NASA.
- [ ] Before adding any logo, read the official Space Apps branding guidelines and NASA media usage guidelines.
