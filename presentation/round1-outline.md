# Round 1 Presentation Outline

> Fill in the [brackets] for your team. Facts below come from `docs/research-sources.md`.

1. **Hook (15 s)**
   "Right now there are rovers, landers and science stations on the Moon and Mars that people
   built and sent there. One of them, a mirror left by Apollo 11 in 1969, is still used by scientists today."

2. **The problem**
   Most people know the famous missions, but not what was left behind or what it taught us.
   [Link to the official challenge statement we are answering.]

3. **Our idea: Lunar Echoes**
   A free website where school-age explorers discover the equipment NASA left on the Moon and Mars.
   Each object is an "echo" of its mission.

4. **Who it is for**
   Students aged about 9–15, teachers, and anyone curious about space.

5. **Live demo (90 s)**
   - Filter **Moon → Mars**, search "rover".
   - Open **Apollo 11 Laser Ranging Retroreflector**: Moon moving away ~3.8 cm/year.
   - Open **InSight**: 1,319 marsquakes; dust covered its solar panels.
   - Timeline: 1967 (Surveyor 3) → 2018 (InSight).
   - Quiz: answer one right, one wrong, show the feedback and score.

6. **NASA data we used**
   - NASA NSSDCA Master Catalog: dates, landing sites, mission outcomes.
   - NASA Image and Video Library API: real mission photos, each credited and linked.
   - Every story links to its NASA source.

7. **How we built it**
   HTML, CSS and vanilla JavaScript. No backend, no paid APIs, works on phones.
   The quiz is generated from the data, so it never invents facts.

8. **AI use**
   Summary of `docs/ai-disclosure.md`: AI helped write code and gather facts; every fact is linked to a NASA page
   and checked by the team.

9. **What's next**
   More objects (Apollo 12–16 experiments, Curiosity, Perseverance, Ingenuity), a map of landing sites
   using the stored coordinates, and offline image copies for classrooms.

10. **Team**: [names and roles]
