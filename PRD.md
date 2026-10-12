# PRD — My Poke Card

> One page. No code.

## 1. Pitch
My Poke Card lets Pokémon fans browse real Pokémon and turn themselves into a personal Pokémon-style trading card that they can download and keep.

## 2. Who it is for
Kids, teens and adult fans who love Pokémon cards. They want to find their favorite Pokémon, see what makes it special, and get a fun card of themselves "teamed up" with it to share with friends. Why: real cards can't have *you* on them, and this app makes one in under a minute with no sign-up.

## 3. Screens
- **List + Details** — A grid of Pokémon (name + image) with a search box (by name) and a type filter. Clicking a Pokémon opens its details: official artwork, number, Type, weight, 2 attacks, Weakness/Resistance, and a "Choose as my Pokémon" button.
- **Create Card form** — Name, Age (1–120, becomes HP), Photo upload, Superpower (becomes the Ability), One-line description (becomes flavor text). Text fields accept English letters only; errors are shown next to each field.
- **Card preview** — The finished card (spec below). Buttons: Download PNG, Save.
- **My Cards** — Saved cards as thumbnails; click one to view it again, or delete it.

**Card spec** (real TCG layout, top to bottom):
- **Top row:** "BASIC" stage top-left · name "<User name>'s <Pokémon>" (e.g. "Amit's Pikachu", TCG "Trainer's Pokémon" style) · "HP" + the user's exact age (1–120, intentional) · Type symbol top-right.
- **Frame color** by Type.
- **Illustration:** the user's photo + the Pokémon's official artwork.
- **Pokédex strip:** "NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs" (English card format).
- **Ability:** the user's Superpower.
- **2 attacks:** moves with power. Damage = power rounded to a multiple of 10. Cost by damage: 10–30 → 1 symbol, 40–70 → 2, 80–120 → 3, 130+ → 4. The first symbol is the card's Type, the rest Colorless. Dragon: all cost symbols Colorless (there is no Dragon Energy).
- **Weakness:** one Type ×2, from the game damage relations mapped to Types. Dragon: no Weakness. **Resistance:** one Type −30, often none.
- **Retreat:** Colorless symbols by weight: under 100 hg → 1, 100–999 → 2, 1000+ → 3.
- **Flavor text:** the user's one-line description.
- **Bottom line:** "Card design: Amit Soul" · card number "MPC 001" · "Fan-made · Not an official Pokémon card".
- **Type symbols:** our own SVG icons inspired by the originals — a colored circle with a white icon: Grass leaf, Fire flame, Water droplet, Lightning bolt, Psychic eye, Fighting fist, Darkness crescent, Metal triangle, Dragon claw, Colorless star. No official logos or copyright lines.

## 4. Must-have features
1. List of all Pokémon species from PokéAPI, shown in pages of 50 with "Load more", with search by name and filter by Type over the full list.
2. Details view with artwork, number, Type, weight, 2 attacks, Weakness/Resistance.
3. Create Card form with validation (age 1–120, English letters only, photo required).
4. Card preview built to the card spec above, downloadable as PNG (using `html-to-image`).
5. Save cards to localStorage and show them on My Cards.

Every network call shows a loading state and an error state. The layout works on desktop, tablet and phone. All UI text is in English. The site footer and the README carry the disclaimer "Fan-made · Not an official Pokémon card".

**Approved exception:** `html-to-image` is the only extra library, used just for the PNG download (approved by the lecturer).

## 5. Acceptance criteria
- When I type "pika" in the search box, I see only Pokémon whose name contains "pika".
- When I pick "Fire" in the type filter, I see only Pokémon whose first game type maps to Fire.
- When I click a Pokémon, I see its artwork, Type, 2 attacks, and Weakness/Resistance.
- When I enter age 150 or a name with digits and press Create, I see an error message and no card is made.
- When I create a card as "Amit", age 30, with Pikachu, I see "Amit's Pikachu", "HP 30", a yellow Lightning frame and "MPC 001"; Download gives a PNG of it, and My Cards shows it.

## 6. Not now
Editing a saved card, sharing via link, multiple languages, choosing which moves to use, evolution stages other than BASIC, card rarity/holo effects, user accounts or a server.

## 7. Data
- **API:** `/pokemon-species` (species count), `/pokemon` (list + details: types, height, weight, moves, artwork), `/pokemon-species/{id}` (genus, e.g. "Mouse Pokémon"), `/type/{type}` (filter + damage relations), `/move/{move}` (power) — all under `https://pokeapi.co/api/v2`.
- **Which Pokémon:** every species (evolutions are separate entries); special forms (id 10001+) are excluded. The total comes from the `/pokemon-species` count, never hardcoded.
- **Fields in list:** name, id, image (sprite URL built from the id; no per-Pokémon fetch).
- **Type filter:** fetch `/type/{type}` for every game type of the selected Type (e.g. Psychic = psychic + ghost + fairy), keep only Pokémon with that type as their first type, merge the results and drop forms (id 10001+).
- **Type rule:** first game type → one of 10 TCG Types: Grass (grass, bug), Fire, Water (water, ice), Lightning (electric), Psychic (psychic, ghost, fairy), Fighting (fighting, rock, ground), Darkness (dark, poison), Metal (steel), Dragon, Colorless (normal, flying). Weakness/Resistance use one shared helper for the details panel and the card.
  *Note:* "Type" is the card's category (the symbol top-right); "Energy" means Energy cards and attack costs. Fairy was retired from the TCG in 2020 and is printed as Psychic; Poison is Darkness in the current era.
- **Units:** height in decimeters → feet/inches (4 dm → 1'04"); weight in hectograms → lbs (60 hg → 13.2 lbs).
- **Card number rule:** assigned once when the card is created and stored with it, formatted "MPC 001". A counter in localStorage only goes up, so deleting a card never renumbers the others (delete MPC 002 → the next new card is still MPC 004).
- **Saved card (localStorage):** user name, age/HP, ability, flavor text, resized photo, Pokémon id, card number, created date.
