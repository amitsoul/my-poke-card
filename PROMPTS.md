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
