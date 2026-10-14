# Requirements checklist

> Every requirement from the updated final project instructions, with its real status. Linked from [PRD.md](../PRD.md).
> ✅ done · ⏳ planned (task in [tasks.md](../tasks.md)) · ❌ not planned
>
> Last updated: 14/10/2026, after task 4 (code is still JavaScript).

## Mandatory

| Requirement | Status | Where in the code / which task |
|---|---|---|
| React + Vite | ✅ | `vite.config.js`, `src/main.jsx` |
| TypeScript | ⏳ | Task 5 — the code is still `.jsx`/`.js` |
| Types (`type`/`interface`) for API data | ⏳ | Task 5 |
| Types for every component's props | ⏳ | Task 5 |
| No `any` | ⏳ | Task 5 (nothing to check until the code is TypeScript) |
| `npm run dev` with no console errors | ⏳ | Checked by hand after each task so far; final check in task 12 |
| `npm run build` passes | ⏳ | Passes today (`vite build`, JavaScript); must pass with the type check from task 5 |
| At least 4 own components (not pages), one per file | ✅ | 5 today in `src/components/`: `PokemonList`, `PokemonListItem`, `PokemonDetails`, `SearchBar`, `CardTypeFilter`. `PokemonDetails` becomes a page in task 6, leaving 4; the form and card components (tasks 8–10) add more |
| React Router | ⏳ | Task 6 |
| List page | ⏳ | Task 6 — the list exists (`App.jsx`) but not as a routed page |
| Details page `/pokemon/:id` with `useParams` | ⏳ | Task 6 — today details show in a side panel (`PokemonDetails.jsx`) |
| At least 2 more pages where the user does something | ⏳ | Task 8 (`/create/:id`), task 11 (`/my-cards`) |
| Nav menu with `Link`/`NavLink` | ⏳ | Task 6 |
| List with `map` + unique `key` | ✅ | `src/components/PokemonList.jsx` (`key={pokemon.id}`), `CardTypeFilter.jsx` |
| Clicking an item opens its details page | ⏳ | Task 6 — today a click opens the side panel |
| Data passed via props | ✅ | `App.jsx` → `PokemonList` → `PokemonListItem`; `PokemonDetails`, `SearchBar`, `CardTypeFilter` |
| `fetch` inside `useEffect` with loading / error / data states | ✅ | `App.jsx` (list, Type filter), `PokemonDetails.jsx` (details), each with Try again |
| Search or filter | ✅ | `SearchBar.jsx` (by name) + `CardTypeFilter.jsx` (by Type), logic in `App.jsx` |
| Vitest: 5+ passing tests on real logic, `npm test` | ⏳ | Task 7 (Type mapping, search/filter), more in tasks 8–9 |
| `@vitest/ui` with a `test:ui` script | ⏳ | Task 7 |
| Own CSS | ✅ | `src/index.css` |
| Works on narrow screens | ✅ / ⏳ | Done for the list and details (responsive grid, details above the list on phones); new pages checked in task 12 |
| README: what the app does | ⏳ | Task 12 — `README.md` is still the course template |
| README: how to run the app and the tests | ⏳ | Task 12 |
| README: which API | ⏳ | Task 12 |
| Gradual commits | ✅ | 19 commits so far (08/10–14/10), one per step |
| `PRD.md` | ✅ | `PRD.md` (one page) |
| `tasks.md`: up to 12 tasks, each with "Done when" | ✅ | `tasks.md` (12 tasks) |
| `PROMPTS.md` | ✅ | `PROMPTS.md` (written automatically by the hook) |
| Extra docs linked from `PRD.md` | ✅ | [CARD_SPEC.md](../CARD_SPEC.md), this file |
| No server / DB / login | ✅ | Front-end only; saved cards will use localStorage |
| No Redux | ✅ | State with `useState` only |
| No Next.js | ✅ | Vite |
| No heavy UI libraries | ✅ | Own CSS only |
| No APIs with keys | ✅ | PokéAPI needs no key |

## Bonus

| Requirement | Status | Where in the code / which task |
|---|---|---|
| localStorage favorites | ❌ | Favorites are not planned. Saved cards in localStorage come in task 11 (My Cards) — to confirm with the lecturer whether that counts |
| React Testing Library | ❌ | Not planned; needs approval as an extra library |
| 404 page | ⏳ | Task 6 |
