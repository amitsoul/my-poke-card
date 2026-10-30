# Requirements checklist

> Every requirement from the updated final project instructions, with its real status. Linked from [PRD.md](../PRD.md).
> ✅ done · ⏳ planned (task in [tasks.md](../tasks.md)) · ❌ not planned
>
> Last updated: 29/10/2026, at the end of task 12 (README, final checks, polish and the site redesign).

## Mandatory

| Requirement | Status | Where in the code / which task |
|---|---|---|
| React + Vite | ✅ | `vite.config.ts`, `src/main.tsx` |
| TypeScript | ✅ | Task 5 — every file in `src/` is `.ts`/`.tsx`; `tsconfig.json` + `tsconfig.app.json` (`strict: true`) + `tsconfig.node.json` |
| Types (`type`/`interface`) for API data | ✅ | `src/types/pokemon.ts` (`SpeciesCountResponse`, `PokemonListResponse`, `PokemonDetailsResponse`, `TypeResponse`, plus `PokemonSummary`, `CardType`); typed fetch `fetchJson<T>` in `src/utils/api.ts` |
| Types for every component's props | ✅ | A `…Props` interface in each component that has props: `NavBar`, `Logo`, `SiteFooter`, `PokemonList`, `PokemonListItem`, `PokemonDetails`, `SearchBar`, `CardTypeFilter`, `FavoritePokemonField`, `FormField`, `CardForm`, `PhotoField`, `InlineConfirm`, `AttackList`, `AttacksBlock`, `PokeCard`, `TypeSymbol`, `WeaknessRow`, `CardSticker`, `SavedNotice`, `SavedCardItem`, `FavoriteButton`, `DownloadPngButton` (`NavBar`, `Logo` and `SiteFooter` have no props). Callbacks are typed too |
| No `any` | ✅ | None in `src/`; `strict: true` blocks hidden `any`, and the lint rule `typescript/no-explicit-any` (error) in `.oxlintrc.json` blocks written ones |
| `npm run dev` with no console errors | ✅ | Checked by hand after every task, and at the end of task 12 with the Console open (Preserve log) through the whole flow: list search, Type filter and Load more; details; Create with a photo, drag the sticker, Edit, Create, Save, Download PNG; My Cards heart, Favorites, Delete ("Keep it", then "Yes"); `/abc`, `/pokemon/abc`, `/create/abc`. No errors or warnings from our code. Only `/pokemon/99999` shows the browser's own "404" network line (twice in dev, because of React StrictMode): that is the API's answer, and the page shows "Pokémon not found". The tests also fail on any `console.error` or `console.warn` (`src/test/setup.ts`) |
| `npm run build` passes | ✅ | `tsc -b && vite build` in `package.json` — type check, then build; passes after task 5 |
| At least 4 own components (not pages), one per file | ✅ | 23 in `src/components/`: `NavBar`, `Logo`, `SiteFooter`, `PokemonList`, `PokemonListItem`, `PokemonDetails`, `SearchBar`, `CardTypeFilter`, `FavoritePokemonField`, `FormField`, `CardForm`, `PhotoField`, `InlineConfirm`, `AttackList`, `AttacksBlock`, `PokeCard`, `TypeSymbol`, `WeaknessRow`, `CardSticker`, `SavedNotice`, `SavedCardItem`, `FavoriteButton`, `DownloadPngButton`. (`ChangeWarning` was replaced by the general `InlineConfirm`.) Pages are separate, in `src/pages/`: `HomePage`, `PokemonListPage`, `PokemonDetailsPage`, `CreateCardPage`, `MyCardsPage`, `NotFoundPage` |
| React Router | ✅ | `react-router` v8: `BrowserRouter` in `src/main.tsx`, `Routes`/`Route` in `src/App.tsx` |
| List page | ✅ | `/pokemon` → `src/pages/PokemonListPage.tsx` (`/` is the landing page, `src/pages/HomePage.tsx`) |
| Details page `/pokemon/:id` with `useParams` | ✅ | `src/pages/PokemonDetailsPage.tsx` reads `id` with `useParams` (checked by `parsePokemonId` in `src/utils/pokemonId.ts`) and fetches the details; display in `src/components/PokemonDetails.tsx` |
| At least 2 more pages where the user does something | ✅ | 1) **Create card** (`/create`, `/create/:id`, `src/pages/CreateCardPage.tsx`): choose a Pokémon, fill 5 validated fields with a photo, see and save the card, download it. 2) **My Cards** (`/my-cards`, `src/pages/MyCardsPage.tsx`): saved cards, favorites, All/Favorites filter, download, delete. (The 404 page doesn't count — the user doesn't do anything there.) |
| Nav menu with `Link`/`NavLink` | ✅ | `src/components/NavBar.tsx`: the page header with the logo (`Logo.tsx`, a `Link` to `/`) and three `NavLink`s: "Find a Pokémon" (`/pokemon`, also active on `/pokemon/:id`, not on an invalid id), "Create card" (also on `/create/:id`, not on an invalid id) and "My Cards"; the active link is highlighted |
| List with `map` + unique `key` | ✅ | `src/components/PokemonList.tsx` (`key={pokemon.id}`), `CardTypeFilter.tsx` |
| Clicking an item opens its details page | ✅ | Each card in `src/components/PokemonListItem.tsx` is a `Link` to `/pokemon/{id}` |
| Data passed via props | ✅ | `HomePage` → `PokeCard` (the two example cards, from `src/data/sampleCards.ts`); `PokemonListPage` → `PokemonList` → `PokemonListItem`; `PokemonListPage` → `SearchBar`, `CardTypeFilter`; `PokemonDetailsPage` → `PokemonDetails`, `AttacksBlock` (→ `AttackList` → `TypeSymbol`), `WeaknessRow`; `CreateCardPage` → `FavoritePokemonField`, `InlineConfirm`, `CardForm` (→ `FormField`, `PhotoField`), `PokeCard` (→ `CardSticker`, `AttacksBlock`, `WeaknessRow`, `TypeSymbol`), `SavedNotice`, `DownloadPngButton`; `MyCardsPage` → `SavedCardItem` (→ `PokeCard`, `FavoriteButton`, `DownloadPngButton`, `InlineConfirm`) |
| `fetch` inside `useEffect` with loading / error / data states | ✅ | `src/pages/PokemonListPage.tsx` (list, Type filter); `src/hooks/usePokemonDetails.ts` (one Pokémon, plus "Pokémon not found" for API 404); `src/hooks/usePokemonCardInfo.ts` (genus + attacks, via `src/utils/moveApi.ts`) — used by the details page and the Create card page, each with Try again |
| Search or filter | ✅ | `SearchBar.tsx` (by name) + `CardTypeFilter.tsx` (by Type), logic in `PokemonListPage.tsx`; both kept in the URL (`/pokemon?q=char&type=Fire`) |
| Vitest: 5+ passing tests on real logic | ✅ | 208 logic tests in 16 files in `src/utils/`: `cardForm.test.ts` (46), `cardRules.test.ts` (28, incl. every CARD_SPEC example), `savedCards.test.ts` (27, incl. the never-reused number and broken storage), `cardTheme.test.ts` (15, incl. color distance and contrast), `sticker.test.ts` (13), `cardType.test.ts` (11), `moves.test.ts` (11), `photo.test.ts` (10), `downloadCardPng.test.ts` (8), `moveApi.test.ts` (8), `filterPokemon.test.ts` (6), `navigation.test.ts` (6), `pokemonDetails.test.ts` (6), `pokemonId.test.ts` (6), `text.test.ts` (5), `api.test.ts` (2) |
| `npm test` passes | ✅ | `"test": "vitest run"` in `package.json`: 40 files, 358 tests (208 logic + 4 hook + 134 component/page + 12 more: `App.test.tsx` 5, `indexCss.test.ts` 4, `src/data/sampleCards.test.ts` 3), exit code 0. Any `console.error` or `console.warn` during a test makes it fail (`src/test/setup.ts`) |
| `@vitest/ui` with a `test:ui` script | ✅ | `"test:ui": "vitest --ui"` in `package.json`; checked in the browser, all green |
| Own CSS | ✅ | `src/index.css` only, no UI library. The card uses container query units (design px × card width / 380) and self-hosted fonts (`src/assets/fonts`, SIL Open Font License). The site look (task 12, after two design rounds): warm paper, the logo and a blue menu bar with a yellow chip for the current page, page and section titles in Lilita One, round red and yellow buttons, plain white panels and tiles, faint stars in the side margins, one clear focus ring (two-color on the menu). All fonts are self-hosted (no outside requests). Class selectors only, so no rule reaches the card (checked by `src/indexCss.test.ts`); the card's PNG was compared pixel by pixel after every step |
| Works on narrow screens | ✅ | At the end of task 12, at 320, 375 and 768px: no page scrolls sideways (`/`, `/pokemon`, `/pokemon/25`, `/pokemon/99999`, `/create/25`, `/abc`, `/create/abc`, `/my-cards`); at 320px the details page's Attacks box and Weakness row fit, and "Create my card with Pikachu" is 45px tall; the 404 page looks right. On a real iPhone (task 12d, before the redesign): the list, details, Create card with the card and the sticker dragged with a finger, My Cards, and the PNG in Safari. The card shrinks as one piece (design px × card width / 380) |
| README: what the app does | ✅ | [README.md](../README.md): the pitch, "What it does", the pages and routes, and screenshots (desktop and phone, plus a real downloaded card PNG) |
| README: how to run the app and the tests | ✅ | [README.md](../README.md) "Getting started" (Node.js 22.22+, `npm install`, `npm run dev`, `npm run dev -- --host` for a phone, build, preview, lint) and "Tests" (`npm test`, `npm run test:ui`, what is tested) |
| README: which API | ✅ | [README.md](../README.md) "Credits": PokéAPI (no key needed) and its sprites repository for the artwork |
| Gradual commits | ✅ | 75 commits (08/10–29/10/2026) before closing task 12, one per step |
| `PRD.md` | ✅ | `PRD.md` (one page) |
| `tasks.md`: up to 12 tasks, each with "Done when" | ✅ | `tasks.md` (12 tasks) |
| `PROMPTS.md` | ✅ | `PROMPTS.md` (written automatically by the hook) |
| Extra docs linked from `PRD.md` | ✅ | [CARD_SPEC.md](../CARD_SPEC.md), this file |
| No server / DB / login | ✅ | Front-end only; saved cards are kept in the browser's localStorage (`src/utils/savedCards.ts`) |
| No Redux | ✅ | State with `useState` only |
| No Next.js | ✅ | Vite |
| No heavy UI libraries | ✅ | Own CSS only |
| No APIs with keys | ✅ | PokéAPI needs no key |

## Bonus

| Requirement | Status | Where in the code / which task |
|---|---|---|
| localStorage favorites | ✅ | `favorite: boolean` on each saved card in localStorage (`src/utils/savedCards.ts`); the heart (`src/components/FavoriteButton.tsx`) on every card in My Cards; "All (n)" / "Favorites (n)" kept in the URL (`/my-cards?show=favorites`). **To confirm with the lecturer that favorites inside My Cards count.** |
| React Testing Library | ✅ | 134 tests in 20 files, run in jsdom (setup in `src/test/setup.ts`, which also resets fakes, the move cache and localStorage after every test, and fails a test on any console error or warning): `PokeCard.test.tsx` (20), `CardSticker.test.tsx` (11), `CardForm.test.tsx` (10), `NavBar.test.tsx` (10), `PhotoField.test.tsx` (7), `TypeSymbol.test.tsx` (6), `AttackList.test.tsx` (4), `CardTypeFilter.test.tsx` (4), `WeaknessRow.test.tsx` (4), `DownloadPngButton.test.tsx` (3), `FavoriteButton.test.tsx` (3), `FavoritePokemonField.test.tsx` (3), `Logo.test.tsx` (3), `PokemonListItem.test.tsx` (2), `SearchBar.test.tsx` (2), `SiteFooter.test.tsx` (1), and whole pages: `CreateCardPage.test.tsx` (15), `MyCardsPage.test.tsx` (15), `PokemonDetailsPage.test.tsx` (6), `HomePage.test.tsx` (5). Plus 4 hook tests with `renderHook` in `src/hooks/usePokemonCardInfo.test.ts` |
| 404 page | ✅ | `src/pages/NotFoundPage.tsx`: route `*` in `src/App.tsx` for unknown URLs, and for `/pokemon/<invalid id>` |
