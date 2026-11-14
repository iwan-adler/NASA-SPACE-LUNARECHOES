# Round 1 Presentation Outline

> Fill in the [brackets] for your team. Facts below come from `docs/research-sources.md`.

1. **Hook (15 s)**
   "Right now there are rovers, landers and science stations on the Moon and Mars that people
   built and sent there. One of them, a mirror left by Apollo 11 in 1969, is still used by scientists today."

2. **The problem**
   Most people know the famous missions, but not what was left behind or what it taught us.
   Challenge: "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars"
   (https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/).

3. **Our idea: Lunar Echoes**
   A free website where school-age explorers discover the equipment NASA left on the Moon and Mars.
   Each object is an "echo" of its mission.

4. **Who it is for**
   Students aged about 9–15, teachers, and anyone curious about space.

5. **Live demo (90 s)**
   - Filter **Moon → Mars**, search "rover".
   - Open **Apollo 11 Eagle (descent stage)**: the launch pad left behind, with its plaque.
   - Open **Apollo 11 Laser Ranging Retroreflector**, the only object labelled "Still in use": Moon moving away ~3.8 cm/year.
   - Open **InSight**: 1,319 marsquakes; dust covered its solar panels.
   - Timeline: 1967 (Surveyor 3) → 2018 (InSight).
   - Quiz: answer one right, one wrong, show the feedback and score.

6. **NASA data we used**
   - **NSSDCA Master Catalog** (the dataset listed by the challenge): each object links to its NSSDCA record. Its
     landing date, resting place, coordinates and final status come from that record.
   - Challenge-listed NASA Science mission pages, to cross-check the facts.
   - NASA Image and Video Library API: real mission photos, each credited and linked.

7. **How we built it**
   HTML, CSS and vanilla JavaScript. No backend, no paid APIs, works on phones.
   The quiz is generated from the data, so it never invents facts.

8. **AI use**
   Summary of `docs/ai-disclosure.md`: AI helped write code and gather facts; every fact is linked to a NASA page.
   [Say which facts the team spot-checked.]

9. **What's next**
   More challenge-listed objects (Viking 2, more Apollo modules and experiments, the Ingenuity helicopter),
   a map of landing sites using the stored coordinates, and offline image copies for classrooms.

10. **Team**: [names and roles]
