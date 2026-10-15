# Requirements checklist

> Every requirement from the updated final project instructions, with its real status. Linked from [PRD.md](../PRD.md).
> ✅ done · ⏳ planned (task in [tasks.md](../tasks.md)) · ❌ not planned
>
> Last updated: 15/10/2026, after task 10 (card design).

## Mandatory

| Requirement | Status | Where in the code / which task |
|---|---|---|
| React + Vite | ✅ | `vite.config.ts`, `src/main.tsx` |
| TypeScript | ✅ | Task 5 — every file in `src/` is `.ts`/`.tsx`; `tsconfig.json` + `tsconfig.app.json` (`strict: true`) + `tsconfig.node.json` |
| Types (`type`/`interface`) for API data | ✅ | `src/types/pokemon.ts` (`SpeciesCountResponse`, `PokemonListResponse`, `PokemonDetailsResponse`, `TypeResponse`, plus `PokemonSummary`, `CardType`); typed fetch `fetchJson<T>` in `src/utils/api.ts` |
| Types for every component's props | ✅ | A `…Props` interface in each component that has props: `NavBar`, `PokemonList`, `PokemonListItem`, `PokemonDetails`, `SearchBar`, `CardTypeFilter`, `FavoritePokemonField`, `FormField`, `CardForm`, `PhotoField`, `ChangeWarning`, `AttackList`, `AttacksBlock`, `PokeCard`, `TypeSymbol`, `WeaknessRow`, `CardSticker` (`NavBar` has no props). Callbacks are typed too |
| No `any` | ✅ | None in `src/`; `strict: true` blocks hidden `any`, and the lint rule `typescript/no-explicit-any` (error) in `.oxlintrc.json` blocks written ones |
| `npm run dev` with no console errors | ⏳ | Checked by hand after each task so far; final check in task 12 |
| `npm run build` passes | ✅ | `tsc -b && vite build` in `package.json` — type check, then build; passes after task 5 |
| At least 4 own components (not pages), one per file | ✅ | 17 in `src/components/`: `NavBar`, `PokemonList`, `PokemonListItem`, `PokemonDetails`, `SearchBar`, `CardTypeFilter`, `FavoritePokemonField`, `FormField`, `CardForm`, `PhotoField`, `ChangeWarning`, `AttackList`, `AttacksBlock`, `PokeCard`, `TypeSymbol`, `WeaknessRow`, `CardSticker`. Pages are separate, in `src/pages/` |
| React Router | ✅ | `react-router` v8: `BrowserRouter` in `src/main.tsx`, `Routes`/`Route` in `src/App.tsx` |
| List page | ✅ | `/` → `src/pages/PokemonListPage.tsx` |
| Details page `/pokemon/:id` with `useParams` | ✅ | `src/pages/PokemonDetailsPage.tsx` reads `id` with `useParams` (checked by `parsePokemonId` in `src/utils/pokemonId.ts`) and fetches the details; display in `src/components/PokemonDetails.tsx` |
| At least 2 more pages where the user does something | ⏳ | 1) **Create card ✅** (`/create`, `/create/:id`): choose a Pokémon, fill 5 validated fields with a photo, see a summary, Edit — `src/pages/CreateCardPage.tsx`. 2) My Cards (`/my-cards`): view, download, delete, favorites — task 11. The 404 page doesn't count — the user doesn't do anything there |
| Nav menu with `Link`/`NavLink` | ✅ / ⏳ | `src/components/NavBar.tsx` with two `NavLink`s: "Pokémon" (also active on `/pokemon/:id`) and "Create card" (also active on `/create/:id`, not on an invalid id). "My Cards" is added in task 11 |
| List with `map` + unique `key` | ✅ | `src/components/PokemonList.tsx` (`key={pokemon.id}`), `CardTypeFilter.tsx` |
| Clicking an item opens its details page | ✅ | Each card in `src/components/PokemonListItem.tsx` is a `Link` to `/pokemon/{id}` |
| Data passed via props | ✅ | `PokemonListPage` → `PokemonList` → `PokemonListItem`; `PokemonListPage` → `SearchBar`, `CardTypeFilter`; `PokemonDetailsPage` → `PokemonDetails`, `AttacksBlock` (→ `AttackList` → `TypeSymbol`), `WeaknessRow`; `CreateCardPage` → `FavoritePokemonField`, `ChangeWarning`, `CardForm` (→ `FormField`, `PhotoField`), `PokeCard` (→ `CardSticker`, `AttacksBlock`, `WeaknessRow`, `TypeSymbol`) |
| `fetch` inside `useEffect` with loading / error / data states | ✅ | `src/pages/PokemonListPage.tsx` (list, Type filter); `src/hooks/usePokemonDetails.ts` (one Pokémon, plus "Pokémon not found" for API 404); `src/hooks/usePokemonCardInfo.ts` (genus + attacks, via `src/utils/moveApi.ts`) — used by the details page and the Create card page, each with Try again |
| Search or filter | ✅ | `SearchBar.tsx` (by name) + `CardTypeFilter.tsx` (by Type), logic in `PokemonListPage.tsx`; both kept in the URL (`/?q=char&type=Fire`) |
| Vitest: 5+ passing tests on real logic | ✅ | 162 logic tests in 14 files in `src/utils/`: `cardForm.test.ts` (44), `cardRules.test.ts` (28, incl. every CARD_SPEC example), `cardType.test.ts` (11), `moves.test.ts` (11), `sticker.test.ts` (11), `cardTheme.test.ts` (10, incl. the 3:1 contrast of every symbol), `photo.test.ts` (10), `moveApi.test.ts` (8), `filterPokemon.test.ts` (6), `navigation.test.ts` (6), `pokemonId.test.ts` (6), `pokemonDetails.test.ts` (5), `text.test.ts` (4), `api.test.ts` (2) |
| `npm test` passes | ✅ | `"test": "vitest run"` in `package.json`: 28 files, 247 tests (162 logic + 4 hook + 81 component/page), exit code 0 |
| `@vitest/ui` with a `test:ui` script | ✅ | `"test:ui": "vitest --ui"` in `package.json`; checked in the browser, all green |
| Own CSS | ✅ | `src/index.css` only, no UI library. The card uses container query units (design px × card width / 380) and self-hosted fonts (`src/assets/fonts`, SIL Open Font License) |
| Works on narrow screens | ✅ / ⏳ | Checked: the list (responsive grid) and the Create card page with the card at 375px, 320px and on a real phone (the card shrinks as one piece; the sticker can be dragged with a finger). The details and 404 pages get their final phone/tablet check in task 12 |
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
| React Testing Library | ✅ | 81 tests in 13 files, run in jsdom (setup in `src/test/setup.ts`, which also resets fakes and the move cache after every test): `PokeCard.test.tsx` (18), `CardSticker.test.tsx` (11, incl. keyboard and a faked drag), `CardForm.test.tsx` (10), `PhotoField.test.tsx` (7), `TypeSymbol.test.tsx` (5), `AttackList.test.tsx` (4), `CardTypeFilter.test.tsx` (4), `WeaknessRow.test.tsx` (4), `FavoritePokemonField.test.tsx` (3), `PokemonListItem.test.tsx` (2), `SearchBar.test.tsx` (2), and whole pages: `CreateCardPage.test.tsx` (8), `PokemonDetailsPage.test.tsx` (3). Plus 4 hook tests with `renderHook` in `src/hooks/usePokemonCardInfo.test.ts` |
| 404 page | ✅ | `src/pages/NotFoundPage.tsx`: route `*` in `src/App.tsx` for unknown URLs, and for `/pokemon/<invalid id>` |
