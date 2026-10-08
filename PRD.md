# PRD — My Poke Card

> One page. No code.

## 1. Pitch
My Poke Card lets Pokémon fans browse real Pokémon and turn themselves into a personal Pokémon-style trading card that they can download and keep.

## 2. Who it is for
Kids, teens and adult fans who love Pokémon cards. They want to find their favorite Pokémon, see what makes it special, and get a fun card of themselves "teamed up" with it to share with friends. Why: real cards can't have *you* on them, and this app makes one in under a minute with no sign-up.

## 3. Screens
- **List + Details** — A grid of Pokémon (name + image) with a search box (by name) and an energy-type filter. Clicking a Pokémon opens its details: official artwork, types, energy, 2 moves with power, weakness/resistance, and a "Choose as my Pokémon" button.
- **Create Card form** — Name, Age (1–120, becomes HP), Photo upload, Superpower (becomes the Ability), One-line description (becomes flavor text). Text fields accept English letters only; errors are shown next to each field.
- **Card preview** — The finished card: user photo next to the Pokémon artwork, energy-themed colors, HP, Ability, 2 attacks, weakness/resistance, retreat cost, flavor text, "Illus. <user name>" and a card number. Buttons: Download PNG, Save.
- **My Cards** — Saved cards as thumbnails; click one to view it again, or delete it.

## 4. Must-have features
1. List of all Pokémon species from PokéAPI, shown in pages of 50 with "Load more", with search by name and filter by energy over the full list.
2. Details view with artwork, types, energy, 2 moves with power, weakness/resistance.
3. Create Card form with validation (age 1–120, English letters only, photo required).
4. Card preview themed by energy, downloadable as PNG (using `html-to-image`).
5. Save cards to localStorage and show them on My Cards.

Every network call shows a loading state and an error state. The layout works on desktop, tablet and phone. All UI text is in English.

**Approved exception:** `html-to-image` is the only extra library, used just for the PNG download (approved by the lecturer).

## 5. Acceptance criteria
- When I type "pika" in the search box, I see only Pokémon whose name contains "pika".
- When I pick "Fire" in the energy filter, I see only Pokémon whose first type maps to Fire.
- When I click a Pokémon, I see its artwork, types, energy, 2 moves with power, and weakness/resistance.
- When I enter age 150 or a name with digits and press Create, I see an error message and no card is made.
- When I create a card and press Download, I get a PNG of the card, and when I open My Cards, I see it there.

## 6. Not now
Editing a saved card, sharing via link, multiple languages, choosing which moves to use, card rarity/holo effects, user accounts or a server.

## 7. Data
- **API:** `https://pokeapi.co/api/v2/pokemon-species` (species count), `https://pokeapi.co/api/v2/pokemon` (list + details), `https://pokeapi.co/api/v2/type/{type}` (filter + weakness/resistance), `https://pokeapi.co/api/v2/move/{move}` (move power).
- **Which Pokémon:** every species (evolutions are separate entries); special forms (id 10001+) are excluded. The total comes from the `/pokemon-species` count, never hardcoded.
- **Fields in list:** name, id, image (sprite URL built from the id; no per-Pokémon fetch).
- **Energy filter:** fetch `/type/{type}` for every type of the selected energy (e.g. Psychic = psychic + ghost + fairy), keep only Pokémon with that type as their first type, merge the results and drop forms (id 10001+).
- **Fields in details:** official artwork, types, weight, moves (first 2 with power > 0), weakness/resistance (from the first type's damage relations, via one shared helper used by the details panel and the card).
- **Energy rule:** first type → one of 10 energies: Grass (grass, bug), Fire, Water (water, ice), Lightning (electric), Psychic (psychic, ghost, fairy), Fighting (fighting, rock, ground), Darkness (dark, poison), Metal (steel), Dragon, Colorless (normal, flying).
- **Retreat cost rule:** from weight in hectograms: under 100 → 1, 100–999 → 2, 1000+ → 3.
- **Card number rule:** assigned once when the card is created and stored with it, formatted "No. 001". A counter in localStorage only goes up, so deleting a card never renumbers the others (delete No. 002 → the next new card is still No. 004).
- **Saved card (localStorage):** user name, age/HP, ability, flavor text, resized photo, Pokémon id, card number, created date.
