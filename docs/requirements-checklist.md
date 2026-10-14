# Requirements checklist

> Every requirement from the updated final project instructions, with its real status. Linked from [PRD.md](../PRD.md).
> ✅ done · ⏳ planned (task in [tasks.md](../tasks.md)) · ❌ not planned
>
> Last updated: 14/10/2026, after task 5 (all of `src/` is TypeScript).

## Mandatory

| Requirement | Status | Where in the code / which task |
|---|---|---|
| React + Vite | ✅ | `vite.config.ts`, `src/main.tsx` |
| TypeScript | ✅ | Task 5 — every file in `src/` is `.ts`/`.tsx`; `tsconfig.json` + `tsconfig.app.json` (`strict: true`) + `tsconfig.node.json` |
| Types (`type`/`interface`) for API data | ✅ | `src/types/pokemon.ts` (`SpeciesCountResponse`, `PokemonListResponse`, `PokemonDetailsResponse`, `TypeResponse`, plus `PokemonSummary`, `CardType`); typed fetch `fetchJson<T>` in `src/utils/api.ts` |
| Types for every component's props | ✅ | A `…Props` interface in each component: `PokemonList`, `PokemonListItem`, `PokemonDetails`, `SearchBar`, `CardTypeFilter` (callbacks typed too) |
| No `any` | ✅ | None in `src/`; `strict: true` blocks hidden `any`, and the lint rule `typescript/no-explicit-any` (error) in `.oxlintrc.json` blocks written ones |
| `npm run dev` with no console errors | ⏳ | Checked by hand after each task so far; final check in task 12 |
| `npm run build` passes | ✅ | `tsc -b && vite build` in `package.json` — type check, then build; passes after task 5 |
| At least 4 own components (not pages), one per file | ✅ | 5 today in `src/components/`: `PokemonList`, `PokemonListItem`, `PokemonDetails`, `SearchBar`, `CardTypeFilter`. `PokemonDetails` becomes a page in task 6, leaving 4; the form and card components (tasks 8–10) add more |
| React Router | ⏳ | Task 6 |
| List page | ⏳ | Task 6 — the list exists (`App.tsx`) but not as a routed page |
| Details page `/pokemon/:id` with `useParams` | ⏳ | Task 6 — today details show in a side panel (`PokemonDetails.tsx`) |
| At least 2 more pages where the user does something | ⏳ | Task 8 (`/create/:id`), task 11 (`/my-cards`) |
| Nav menu with `Link`/`NavLink` | ⏳ | Task 6 |
| List with `map` + unique `key` | ✅ | `src/components/PokemonList.tsx` (`key={pokemon.id}`), `CardTypeFilter.tsx` |
| Clicking an item opens its details page | ⏳ | Task 6 — today a click opens the side panel |
| Data passed via props | ✅ | `App.tsx` → `PokemonList` → `PokemonListItem`; `PokemonDetails`, `SearchBar`, `CardTypeFilter` |
| `fetch` inside `useEffect` with loading / error / data states | ✅ | `App.tsx` (list, Type filter), `PokemonDetails.tsx` (details), each with Try again |
| Search or filter | ✅ | `SearchBar.tsx` (by name) + `CardTypeFilter.tsx` (by Type), logic in `App.tsx` |
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
| localStorage favorites | ⏳ | Task 11 — `favorite: boolean` on each saved card in localStorage; heart toggle in My Cards; "All (n)" / "Favorites (n)" filter in the URL (`/my-cards?show=favorites`) |
| React Testing Library | ⏳ | Task 7 (`SearchBar`, `CardTypeFilter`) and task 8 (form error messages) — 3 tests on components without fetch. Packages approved 14/10/2026 |
| 404 page | ⏳ | Task 6 |
