# יומן פרומפטים

כל פרומפט שאתם שולחים לסוכן נרשם כאן **אוטומטית** (ראו `README.md`).
אחרי כל משימה, הוסיפו בעצמכם שורה אחת: מה בדקתם, ומה שיניתם בעצמכם.

<!-- הרשומות מתווספות מתחת לשורה הזאת -->

## 2026-10-08

**15:14 · claude**

> Hi! Read AGENTS.md and tell me in one sentence what the main rules are.

**15:36 · claude**

> <ide_opened_file>The user opened the file c:\Users\TEST\FrontEnd\my-poke-card\PROMPTS.md in the IDE. This may or may not be related to the current task.</ide_opened_file>
> 
> 
> <pasted_content id="91c8">
> I'm building my final project from this template. Please fill in PRD.md only — do not write any code yet.
> Keep the existing structure of PRD.md and keep it to one page.
> 
> The app: "My Poke Card" — a React + Vite front-end app (no server, no database) that lets a user create a personal Pokémon-style card of themselves.
> 
> Flow:
> 1. The user sees a list of Pokémon from PokéAPI (https://pokeapi.co/api/v2/pokemon) with name + image, and can search by name and filter by energy type.
> 2. Clicking a Pokémon shows its details: official artwork, types, energy, 2 moves with power, weakness/resistance.
> 3. The user picks a favorite Pokémon and fills a short form: Name, Age (1–120, used as HP), Photo upload, Superpower (used as the card's Ability), One-line description (used as flavor text). English letters only.
> 4. The app generates a personal card: the user's photo next to the Pokémon's artwork, energy-themed colors, 2 attacks from the Pokémon, weakness/resistance, retreat cost, "Illus." with the user's name, and a card number.
> 5. The user can download the card as a PNG and it's saved to localStorage; a "My Cards" screen shows saved cards.
> 
> Rules:
> - Energy is taken from the Pokémon's first type and mapped to 10 energies: Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal, Dragon, Colorless (Normal/Flying → Colorless).
> - Responsive: desktop, tablet, phone.
> - All UI text in English.
> 
> Include: who it's for, why, the screens (List+Details, Create Card form, Card preview, My Cards), and 3–5 acceptance lines in the format "When I…, I see…".
> When done, show me the result and wait — don't start any task.
> </pasted_content id="91c8">

**15:45 · claude**

> <ide_opened_file>The user opened the file c:\Users\TEST\FrontEnd\my-poke-card\PRD.md in the IDE. This may or may not be related to the current task.</ide_opened_file>
> 
> 
> <pasted_content id="91c8">
> Thanks, good questions. My decisions:
> 1. Energy mapping — approved as you wrote it (modern TCG mapping, Poison → Darkness).
> 2. Retreat cost — based on the Pokémon's weight from PokéAPI (hectograms): under 100 → 1, 100–999 → 2, 1000+ → 3.
>    Card number — the card's position in My Cards, formatted "No. 001".
> 3. html-to-image — approved. My lecturer explicitly approved this library for the PNG download. Note it in the PRD as an approved exception.
> 4. Resized photo — approved.
> Please update PRD.md with these decisions, show me the changes, and wait.
> </pasted_content id="91c8">

**15:49 · claude**

> <pasted_content id="91c8">
> Good catches, thanks.
> 1. Yes — add a line to AGENTS.md: "Approved exception: html-to-image (approved by the lecturer) for the PNG download."
> 2. Card number should never change. Assign it once when the card is created and store it with the card. Keep a counter in localStorage that only goes up, so deleting a card doesn't renumber the others (e.g. delete No. 002, the next new card is still No. 004).
> Update PRD.md and AGENTS.md, show me the changes, and wait.
> </pasted_content id="91c8">

**15:53 · claude**

> Please commit and push these changes with the message "docs: write PRD".

**15:56 · claude**

> <ide_opened_file>The user opened the file c:\Users\TEST\FrontEnd\my-poke-card\AGENTS.md in the IDE. This may or may not be related to the current task.</ide_opened_file>
> 
> 
> <pasted_content id="91c8">
> Now fill in tasks.md based on PRD.md — still no code.
> Keep the existing structure. Max 8 tasks, in build order, each with a "Done when:" line I can check by eye in the browser.
> Follow this order:
> 1. Pokémon list from a local JSON file (6–8 items), built with map + unique key. No API.
> 2. Clicking a Pokémon shows its details panel. Selected state lives in App, data passed via props.
> 3. Replace the local JSON with a real fetch from PokéAPI inside useEffect, with loading and error states.
> 4. Search by name + filter by energy (type → energy mapping from the PRD).
> 5. Create Card form with validation (English only, age 1–120, photo upload + resize).
> 6. The card component: energy-themed design, user photo + Pokémon artwork, 2 attacks, weakness/resistance from the /type endpoint, retreat cost by weight, responsive.
> 7. Download card as PNG (html-to-image) + save to localStorage with a fixed card number + "My Cards" screen.
> 8. README.md, clean console, test on phone/tablet, final polish.
> Keep each task small enough to finish in one session. When done, show me the result and wait.
> </pasted_content id="91c8">

**16:03 · claude**

> <pasted_content id="91c8">
> Thanks, my answers:
> 1. Renaming to pokemon.json — approved.
> 2. Change of plan: I want ALL Pokémon, not just 151. Include every species (all evolutions are separate entries anyway), but exclude special forms (ids 10001+). Don't hardcode the total — get the species count from the API (/pokemon-species). Show the list in pages of 50 with a "Load more" button so it stays fast; search and filter should work on the full list. Build image URLs from the Pokémon id instead of fetching each Pokémon's details.
> 3. Filter via /type/{type} — approved. Some energies combine several types (e.g. Psychic = psychic + ghost + fairy), so fetch all types of the selected energy, merge the results, and keep only regular species (no forms).
> 4. Weakness/resistance — keep it in task 6, but task 6 should add it to both the card and the details panel, using one shared helper. Update task 6's "Done when" accordingly.
> Update PRD.md and tasks.md where needed, show me the changes, then commit and push with the message "docs: add tasks plan". Don't start task 1.
> </pasted_content id="91c8">
