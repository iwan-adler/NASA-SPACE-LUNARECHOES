# Lunar Echoes: Presenter Script

Written for the 17-slide deck **`Lunar Echoes Pitch789.pdf`**.
Speakers: **Lohith, Iwa, Yaswanth**. The split below is a suggestion, so swap it to suit you.

**Length:**
- **Main pitch** (slides 1–10 and 17): about **3 minutes** of talk plus a **60–90 second live demo**, so about 4–4½ minutes in total.
- **Deep-dive slides 11–16:** use them after the demo if you have time, or jump to them during questions.
- Section A below gives cuts if your limit is shorter.

How to use it:
- **Bold** = emphasise. *[Click]* = next slide.
- Pause after every bold line.
- Every fact is checked in `docs/research-sources.md`. If you change a number, check it there first.

---

## A. Main pitch

### Slide 1: Lunar Echoes (≈15 s) · *Lohith*
> Hello, we're Lohith, Iwa and Yaswanth, and this is **Lunar Echoes**,
> our project for the NASA Space Apps Challenge 2026, "Abandoned but not Forgotten".

*[Click]*

### Slide 2: We remember the missions. Not what they left behind. (≈20 s) · *Lohith*
> We remember the missions: the launches, the landings, the first steps.
> **But not what they left behind.**
> Landers, rovers and science stations are still out there on the Moon and Mars.
> Most young space fans have never met them, or heard what they taught us.

*[Pause.] [Click]*

### Slide 3: Every machine is an echo of a mission (≈20 s) · *Lohith*
> So we built a place to meet them.
> **Every machine is an echo of a mission.**
> Lunar Echoes is a free, interactive digital museum for ages 9 to 15.
> Every object tells its story in five chapters: why it was **designed**, its **mission**,
> its **discovery**, what was **left behind**, and its **legacy** today.

*[Click]*

### Slide 4: 12 objects. Two worlds. One unfinished archive. (≈20 s) · *Iwa*
> Our archive holds **twelve objects: six on the Moon and six on Mars**, from 1967 to 2018.
> Eleven of them are now silent.
> **Only one is still in use**, and it never needed power.

*[Click]*

### Slide 5: A machine that never needed power (≈25 s) · *Iwa*
> In July 1969, Neil Armstrong and Buzz Aldrin left a panel of **100 small mirrors** on the Moon.
> It has no power to run out, so it never switched off.
> Observatories on Earth still bounce laser pulses off it and time the light coming back.
> That's how we know the Moon is drifting away from Earth by **3.8 centimetres a year.**

*[Click]*

### Slide 6: InSight: then, now, and beneath (≈25 s) · *Iwa*
> On Mars, InSight landed in 2018 to listen *beneath* the surface.
> Its seismometer recorded **1,319 marsquakes**.
> Dust slowly covered its solar panels, and it last spoke to Earth on 15 December 2022.
> Today, seen from orbit, it has turned **the same reddish-brown as Mars itself.**

*[Click]*

### Slide 7: Silver world. Rust world. (≈15 s) · *Yaswanth*
> Two very different places to leave a machine.
> On the Moon, gravity is about **one-sixth** of Earth's and a day lasts **29 and a half Earth days**.
> On Mars, gravity is about **two-fifths** of Earth's, and a day is **24 hours and 40 minutes**.

*[Click]*

### Slide 8: Accuracy is part of the experience (≈25 s) · *Yaswanth*
> For a museum, **accuracy is part of the experience.**
> Our facts come from the **NASA NSSDCA Master Catalog**, the dataset this challenge lists,
> checked against **NASA Science and nasa.gov**. Every photo comes from NASA's **Image and Video Library**.
> And **no guesses**: if NASA gives no verified value, we say "Not available".

*[Click]*

### Slide 9: A museum built to be explored (≈20 s) · *Yaswanth*
> You can explore by world, read each story in five chapters, follow each mission's journey,
> compare *then and now*, see where each object rests, and take a quiz
> that **teaches you the story behind every answer.**
> It's plain HTML, CSS and JavaScript, with no backend and no paid services. It even works offline.

*[Click]*

### Slide 10: Let's visit the museum (live demo, 60–90 s) · *Iwa*
> Let's visit the museum.

*Switch to the website.* The demo names features, not screens, so it still works after the UI redesign:
1. **Home:** "Twelve objects, two worlds, one still in use."
2. **Open the laser reflector's story.** Scroll through the five chapters, stop on **Discovery** (3.8 cm a year),
   and show the **NSSDCA record link**: "every fact links to NASA's own catalogue."
3. **Next object:** the Apollo 11 seismometer. "Same place, same week, but silent since August 1969."
4. **InSight → Then and now:** "Its final selfie, and the same lander from orbit in 2024."
5. *If time:* **answer one quiz question wrong on purpose.** "Even a wrong answer teaches you something."

*Switch back to the slides.* Then go to slide 17, or use the deep-dive slides (11–16) if you have time.

### Slide 17: Thank you (≈10 s) · *Lohith*
> These machines aren't really abandoned. **They're echoes**, and each one still has a story to tell.
> Thank you! We'd love to take your questions.

**If you're short on time**, cut in this order:
1. Slide 7 (≈15 s): one line only: "Two very different worlds to leave a machine."
2. Demo steps 3 and 5 (≈30 s).
3. Slide 9 (≈20 s): keep only the last sentence.

---

## B. Deep-dive slides (after the demo, or during questions)

### Slide 11: Moon: objects left behind (≈20 s)
> On the Moon: **Surveyor 3** in 1967, a robot that astronauts later visited.
> Three Apollo 11 objects from 1969: the **Eagle descent stage**, the **laser reflector** and the **seismometer**.
> The **Apollo 15 rover** in 1971, and the **Apollo 17 science station** in 1972,
> set up by the last people to walk on the Moon.

### Slide 12: Mars: objects left behind (≈20 s)
> On Mars: **Viking 1** in 1976, which sent back the first pictures from the surface.
> **Sojourner** in 1997, the first rover on Mars. The twins **Spirit** and **Opportunity** in 2004.
> **Phoenix** in 2008, which confirmed water in a soil sample. And **InSight** in 2018.

### Slide 13: What the reflector still does (≈20 s)
> The reflector is a passive mirror, so it never needed power.
> Lunar laser ranging, which uses this and other reflectors on the Moon, has been collecting data continuously
> for **more than 57 years**. It measures the Earth–Moon distance to within a few millimetres,
> and helps spacecraft at the Moon know exactly where they are.

*(Careful: the "57+ years" is for lunar laser ranging as a whole, not this one mirror alone. Say it this way.)*

### Slide 14: Mars spoke. InSight listened. (≈20 s)
> From **1,319 marsquakes**, scientists worked out that the crust under InSight is **25 to 40 kilometres** thick,
> and that Mars has a **molten core about 1,800 kilometres** in radius, bigger than expected.

### Slide 15: Then vs now: InSight (≈15 s)
> On the left is InSight's **final selfie, from April 2022**. On the right is the same lander from orbit
> on **23 October 2024**. Dust has turned it the colour of Mars,
> and the dark mark its landing rockets left is fading.

### Slide 16: An archive that knows what it doesn't know (≈20 s)
> We're proud of what we *don't* show. Every fact is **linked** to NASA and **verified**.
> We're **transparent** about AI use, and **accountable**:
> where NASA gives no exact position, for example for the Apollo 15 rover's final parking spot,
> we write "Not available" instead of guessing.

---

## C. Likely judge questions

| Question | Answer |
|---|---|
| Where does your data come from? | Mainly the **NASA NSSDCA Master Catalog**, which the challenge lists. It's cross-checked with NASA Science mission pages and nasa.gov. Photos come from the NASA Image and Video Library. Every object links to its sources. |
| How do you make sure it's accurate? | Every fact is matched to a NASA page in our research document. If no verified value exists, we show "Not available". |
| Why only 12 objects? | Depth over breadth: each has a full five-chapter story. Adding more is easy, and Viking 2 and the Ingenuity helicopter are next. |
| Who is it for? | Explorers aged about 9 to 15, and their teachers. |
| Did you use AI? | Yes, for code and for gathering facts from NASA pages. It's disclosed in the project, every fact links to its NASA source, and the team checked them. *[Only say "checked" once you have.]* |
| Does it work offline? | Yes. The NASA photos are stored with the site. |
| Is the mirror really still used? | Yes. NASA describes laser ranging to the Apollo 11 reflector as ongoing. Lunar laser ranging as a whole, using several reflectors on the Moon, has more than 57 years of continuous data. |

---

## Before you present
- [ ] Agree who says which slide, then rehearse once with a timer.
- [ ] Decide whether slides 11–16 stay after the demo or move to a backup section after "Thank you".
- [ ] Open the website, scroll it back to the top, and run the demo path once.
- [ ] Have a teammate check the numbers against `docs/research-sources.md`.
