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

5. **Live demo: the first 60 seconds**
   - **0–10 s:** Landing page. Read the last line aloud: *"One still answers when scientists shine a laser at it."*
     Point to the numbers: 12 objects, 6 Moon, 6 Mars, 1967–2018, 1 still in use.
   - **10–30 s:** Click **"Meet the one still in use"**. Show the green "Still in use" label and the "Today:" line,
     then scroll the five chapters. Stop on **Discovery**: the Moon is moving away 3.8 cm a year.
     Show the **NSSDCA record** link in the archive record ("every fact links to NASA's own catalogue").
   - **30–45 s:** Click **Next →** to the seismometer, beside it at Tranquility Base, which went silent in August 1969.
     That's the contrast: the same mission, but one object is still working and one is silent.
   - **45–60 s:** Close the story, open **InSight**, scroll to **Then and now**: its final selfie vs. the 2024 orbital
     photo, the lander now "the same reddish-brown hue" as Mars.

   **If you have another 60 seconds:**
   - **Moon vs Mars:** gravity, day length and air side by side, from NASA fact sheets.
   - **Location explorer:** click a dot on Mars and the story opens.
   - **Quiz:** answer one question wrong on purpose and show "The story behind the answer".

   **Before presenting:** check you're online (the images load from NASA), use the full-screen browser and
   zoom to 100–110 %, and scroll back to the top.

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
