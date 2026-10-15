# PRD — My Poke Card

> One page. No code.

## 1. Pitch
My Poke Card lets Pokémon fans browse real Pokémon and turn themselves into a personal Pokémon-style trading card that they can download and keep.

## 2. Who it is for
Kids, teens and adult fans who love Pokémon cards. They want to find their favorite Pokémon, see what makes it special, and get a fun card of themselves "teamed up" with it to share with friends. Why: real cards can't have *you* on them, and this app makes one in under a minute with no sign-up.

## 3. Screens (pages and URLs)
A nav menu (NavLink) on every page: **Pokémon** (`/`) · **Create card** (`/create`) · **My Cards** (`/my-cards`).
- **`/` Pokémon list** — A grid of Pokémon (name + image) with a search box (by name), a Type filter and "Load more". Clicking a Pokémon opens its details page.
- **`/pokemon/:id` Details** — The id comes from the URL (`useParams`). Official artwork, number, Type, weight, attacks, Weakness/Resistance, and a "Create my card with <Pokémon>" button → `/create/:id`.
- **`/create` and `/create/:id` Create card** — First field: "Your favorite Pokémon" (image, name, Type, "Change" → back to the list after a warning). Without a Pokémon (`/create`), only "Choose your favorite Pokémon" with a button to the list. Then: Your name, Age (HP), Photo, Superpower, About you — English only, rules and errors in [CARD_SPEC.md](CARD_SPEC.md#form-fields-create-card-page). Below: the card preview, with Save and Download PNG. `/create/abc` → 404; `/create/99999` → "Pokémon not found".
- **`/my-cards` My Cards** — Saved cards from localStorage: view, download, delete. A heart on each card marks it as a favorite (bonus; only after saving), and an "All (n)" / "Favorites (n)" filter is kept in the URL (`/my-cards?show=favorites`).
- **404 page** (bonus) — Any unknown URL, with a link back to the list.

## 4. Must-have features
1. List of all Pokémon species from PokéAPI, 50 at a time with "Load more", with search by name and filter by Type over the full list.
2. Details page with its own URL, read with `useParams`.
3. Create card page: favorite Pokémon + form with validation and photo upload, and the card per [CARD_SPEC.md](CARD_SPEC.md).
4. Save cards to localStorage; My Cards page; download as PNG (`html-to-image`).
5. Vitest tests (5+) on the real logic: Type mapping, search/filter, Weakness/Resistance, units, attack damage/cost, form validation.

**Tech:** React + Vite + TypeScript (types for API data and all props, no `any`), React Router, Vitest + `@vitest/ui`, React Testing Library (bonus), own CSS. Approved libraries: `react-router`, `typescript`, `vitest`, `@vitest/ui`, `html-to-image` (re-confirmed by the lecturer, 14/10/2026), `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`. No server, DB, login, Redux, Next.js, UI libraries or API keys.
Every network call shows loading and error states. Works on phone, tablet and desktop. All UI text is in English. The footer and README carry "Fan-made · Not an official Pokémon card". Requirement status: [docs/requirements-checklist.md](docs/requirements-checklist.md).

## 5. Acceptance criteria
- When I open `/` and type "pika", I see only Pokémon whose name contains "pika"; when I pick "Fire", I see only Fire Pokémon.
- When I click Pikachu, the URL becomes `/pokemon/25` and I see its artwork, Type, attacks and Weakness/Resistance; opening `/pokemon/25` directly shows the same page.
- When I click "Create my card with Pikachu" on `/pokemon/25`, I reach `/create/25` with Pikachu chosen; age 150 or a name with digits shows an error when I leave the field, and I can't create the card; as "Amit", age 30, I see "Amit's Pikachu", "HP 30" and a yellow Lightning frame.
- When I save that card and click "My Cards" in the menu, I see it as "MPC 001", and Download gives a PNG of it.
- When I open an unknown URL like `/abc`, I see the 404 page with a link back to the list.

## 6. Not now
Editing a saved card, sharing via link, multiple languages, choosing which moves to use, evolution stages other than BASIC, card rarity/holo effects, user accounts or a server.

## 7. Data
- **API:** `/pokemon-species` (species count), `/pokemon` (list + details: types, height, weight, moves, artwork), `/pokemon-species/{id}` (genus, e.g. "Mouse Pokémon"), `/type/{type}` (filter), `/move/{move}` (power) — all under `https://pokeapi.co/api/v2`.
- **Which Pokémon:** every species (evolutions are separate entries); special forms (id 10001+) are excluded. The total comes from the `/pokemon-species` count, never hardcoded.
- **Fields in list:** name, id, image (sprite URL built from the id; no per-Pokémon fetch).
- **Type filter:** fetch `/type/{type}` for every game type of the selected Type (e.g. Psychic = psychic + ghost + fairy), keep only Pokémon with that type as their first type, merge the results and drop forms (id 10001+).
- **Type rule:** first game type → one of 10 TCG Types: Grass (grass, bug), Fire, Water (water, ice), Lightning (electric), Psychic (psychic, ghost, fairy), Fighting (fighting, rock, ground), Darkness (dark, poison), Metal (steel), Dragon, Colorless (normal, flying). Why Fairy → Psychic: see the note in [CARD_SPEC.md](CARD_SPEC.md).
- **Weakness/Resistance:** fixed TCG tables by Type (not game damage relations), in [CARD_SPEC.md](CARD_SPEC.md); one shared helper for the details page and the card.
- **Units:** height (dm) → ft/in, weight (hg) → lbs; details in [CARD_SPEC.md](CARD_SPEC.md).
- **Card number rule:** assigned once when the card is created and stored with it, formatted "MPC 001". A counter in localStorage only goes up, so deleting a card never renumbers the others (delete MPC 002 → the next new card is still MPC 004).
- **Saved card (localStorage):** user name, age/HP, ability, flavor text, resized photo, Pokémon id, card number, created date.
