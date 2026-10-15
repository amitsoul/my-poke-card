# Requirements checklist

> Every requirement from the updated final project instructions, with its real status. Linked from [PRD.md](../PRD.md).
> ✅ done · ⏳ planned (task in [tasks.md](../tasks.md)) · ❌ not planned
>
> Last updated: 15/10/2026, after task 7 (Vitest, Vitest UI, first RTL tests).

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
| At least 4 own components (not pages), one per file | ✅ | 6 in `src/components/`: `NavBar`, `PokemonList`, `PokemonListItem`, `PokemonDetails` (display only), `SearchBar`, `CardTypeFilter`. Pages are separate, in `src/pages/` |
| React Router | ✅ | `react-router` v8: `BrowserRouter` in `src/main.tsx`, `Routes`/`Route` in `src/App.tsx` |
| List page | ✅ | `/` → `src/pages/PokemonListPage.tsx` |
| Details page `/pokemon/:id` with `useParams` | ✅ | `src/pages/PokemonDetailsPage.tsx` reads `id` with `useParams` (checked by `parsePokemonId` in `src/utils/pokemonId.ts`) and fetches the details; display in `src/components/PokemonDetails.tsx` |
| At least 2 more pages where the user does something | ⏳ | Task 8 (`/create/:id`), task 11 (`/my-cards`). The 404 page doesn't count — the user doesn't do anything there |
| Nav menu with `Link`/`NavLink` | ✅ / ⏳ | `src/components/NavBar.tsx` with `NavLink`; the active link is highlighted (also on `/pokemon/:id`). Only one link today ("Pokémon"); "My Cards" is added in task 11 |
| List with `map` + unique `key` | ✅ | `src/components/PokemonList.tsx` (`key={pokemon.id}`), `CardTypeFilter.tsx` |
| Clicking an item opens its details page | ✅ | Each card in `src/components/PokemonListItem.tsx` is a `Link` to `/pokemon/{id}` |
| Data passed via props | ✅ | `PokemonListPage` → `PokemonList` → `PokemonListItem`; `PokemonListPage` → `SearchBar`, `CardTypeFilter`; `PokemonDetailsPage` → `PokemonDetails` |
| `fetch` inside `useEffect` with loading / error / data states | ✅ | `src/pages/PokemonListPage.tsx` (list, Type filter), `src/pages/PokemonDetailsPage.tsx` (details, plus "Pokémon not found" for API 404), each with Try again |
| Search or filter | ✅ | `SearchBar.tsx` (by name) + `CardTypeFilter.tsx` (by Type), logic in `PokemonListPage.tsx`; both kept in the URL (`/?q=char&type=Fire`) |
| Vitest: 5+ passing tests on real logic | ✅ | 31 logic tests in 5 files: `src/utils/cardType.test.ts` (11), `filterPokemon.test.ts` (6), `navigation.test.ts` (6), `pokemonId.test.ts` (6), `api.test.ts` (2). More come in tasks 8–9 |
| `npm test` passes | ✅ | `"test": "vitest run"` in `package.json`: 7 files, 37 tests (31 logic + 6 component), exit code 0 |
| `@vitest/ui` with a `test:ui` script | ✅ | `"test:ui": "vitest --ui"` in `package.json`; checked in the browser, all green |
| Own CSS | ✅ | `src/index.css` |
| Works on narrow screens | ✅ / ⏳ | Checked for the list (responsive grid). The details and 404 pages use flexible widths but haven't been checked on a phone yet; all pages get a final phone/tablet check in task 12 |
| README: what the app does | ⏳ | Task 12 — `README.md` is still the course template |
| README: how to run the app and the tests | ⏳ | Task 12 — the commands exist (`npm run dev`, `npm test`, `npm run test:ui`) but the README doesn't explain them yet |
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
| React Testing Library | ✅ / ⏳ | Done: 6 tests in `src/components/SearchBar.test.tsx` (2) and `CardTypeFilter.test.tsx` (4), run in jsdom with setup in `src/test/setup.ts`. Still to come: the form error test in task 8 |
| 404 page | ✅ | `src/pages/NotFoundPage.tsx`: route `*` in `src/App.tsx` for unknown URLs, and for `/pokemon/<invalid id>` |
