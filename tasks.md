# Tasks

> Up to 8 tasks, in build order. Each task is one commit and ends with a "Done when" line.

- [ ] **1 · List from a local file** — 6–8 sample Pokémon in `src/data/pokemon.json` (id, name, image, types, artwork, 2 moves with power). Rendered with `map` and a unique `key` (the id). No API.
      *Done when:* I see 6–8 Pokémon cards with name + image, and the console has no errors or `key` warnings.
- [ ] **2 · Click shows details** — `selectedPokemon` state lives in `App`; the list and the details panel get data and the click handler via props.
      *Done when:* Before any click I see "Pick a Pokémon to see its details"; clicking a Pokémon shows its artwork, types, energy and 2 moves; clicking another one swaps the panel.
- [ ] **3 · Real fetch from PokéAPI** — Replace the JSON with `fetch` inside `useEffect`: get the species count from `/pokemon-species`, then load all species from `/pokemon` (no forms, id 10001+). Image URLs are built from the id. Show 50 at a time with a "Load more" button. On click, fetch `/pokemon/{id}` for the details and `/move/{name}` to get the first 2 moves with power. Loading and error states for every fetch.
      *Done when:* I see "Loading..." and then the first 50 Pokémon with images; "Load more" adds 50 more each time until the last species, then the button disappears; clicking one shows real details; with the network off (DevTools → Offline) I see an error message, not a white screen.
- [ ] **4 · Search + energy filter** — A search box (by name) and an energy dropdown with the 10 energies, both working on the full list (not just the loaded page). The filter fetches `/type/{type}` for every type of the selected energy, keeps first-type Pokémon only, merges them and drops forms. Results also show 50 at a time with "Load more".
      *Done when:* Typing "pika" shows Pikachu even before "Load more" was pressed; choosing "Fire" shows only Fire Pokémon (e.g. Charmander, not Bulbasaur); choosing "Psychic" also shows Gengar (ghost) and Clefairy (fairy); search and filter work together; no results shows "No Pokémon found".
- [ ] **5 · Create Card form** — "Choose as my Pokémon" button in the details opens the form: Name, Age (1–120), Photo, Superpower, One-line description. English letters only; the photo is resized before use.
      *Done when:* Age 150, a name with digits, a Hebrew superpower or a missing photo each show an error next to the field and nothing is created; valid input shows a small preview of the uploaded photo.
- [ ] **6 · The card** — `PokeCard` component: energy colors, user photo next to the artwork, HP = age, Ability = superpower, 2 attacks, retreat cost by weight, flavor text, "Illus. <name>". Responsive. Weakness/resistance from `/type/{type}` through one shared helper, shown on both the card and the details panel.
      *Done when:* Submitting the form shows a full card in the right energy colors (Pikachu → yellow Lightning) with all fields filled; the card and the details panel show the same weakness/resistance for the same Pokémon (Charmander → weak to Water); the card fits without horizontal scrolling at phone, tablet and desktop widths.
- [ ] **7 · Download, save, My Cards** — Download PNG with `html-to-image`; Save to localStorage with a card number from a counter that only goes up ("No. 001"); a "My Cards" screen with thumbnails, view and delete.
      *Done when:* Download gives a PNG that looks like the card; after a page refresh the card is still in My Cards; deleting No. 002 keeps the other numbers, and the next new card is No. 004.
- [ ] **8 · README + final polish** — `README.md` (what it is, how to run it, screenshots), a clean console, and testing on a phone, tablet and desktop.
      *Done when:* A friend can run the app from the README alone; the console has no errors or warnings during the full flow; every screen looks right on a real phone and in DevTools tablet/desktop sizes.
