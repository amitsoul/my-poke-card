# Card spec — My Poke Card

> How the personal card looks and how every value on it is calculated. Linked from [PRD.md](PRD.md).
> Rules follow real Pokémon TCG cards, not the video games.

## Layout (top to bottom)
- **Top row:** "BASIC" stage top-left · name "<User name>'s <Pokémon>" (e.g. "Amit's Pikachu", TCG "Trainer's Pokémon" style) · "HP" + the user's exact age (1–120, intentional) · Type symbol top-right.
- **Frame and panel:** the outer frame is yellow (#F2C94C) on every card; the inner panel has a light tint of the card's Type (see "Type symbols and colors").
- **Illustration:** the user's photo **fills** the window (CSS `object-fit: cover`); the Pokémon's official artwork sits on top as a **die-cut sticker** (see "The sticker").
- **Pokédex strip:** "NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs" (English card format).
- **Ability:** the user's Superpower.
- **Attacks:** see rules below.
- **Weakness · Resistance · Retreat** row: see rules below.
- **Flavor text:** the user's "About you" text.
- **Bottom line:** "Card design: Amit Soul" · card number "MPC 001" · "Fan-made · Not an official Pokémon card".

## Form fields (Create card page)
Filled on `/create/:id` after a Pokémon is chosen. All fields are required and English only. Checked by `src/utils/cardForm.ts`.

**Cleaning before the check (every text field):** spaces at the start and end are ignored, and a field with only spaces counts as empty. In Your name and Superpower, two or more spaces in a row become one ("Mary  Ann" → "Mary Ann"). The curly apostrophe `’` (iPhone "smart punctuation") counts as `'`.

| Field | Rule | Empty | Wrong | On the card |
|---|---|---|---|---|
| Your favorite Pokémon | Chosen via list → details → "Create my card with <Pokémon>"; shown with image, name, Type and a "Change" button | — | — | Artwork, name, Type, attacks… |
| Your name | 2–12 characters: English letters A–Z, with ONE space, hyphen or apostrophe between letters; starts and ends with a letter (Mary-Ann, O'Neil, Mary Ann ok; "--", "-Amit", "Mary--Ann" wrong) | Please enter your name | Use English letters only (2–12) | "<Name>'s <Pokémon>" (e.g. "Amit's Pikachu") |
| Age (HP) | Digits only, whole number 1–120; a leading zero is fine ("025" → 25); "25.5", "1e2", "-5" are wrong | Please enter your age | Age must be 1–120 | HP |
| Photo | JPG, PNG or WebP (not GIF or HEIC), at most 10 MB — checked on the ORIGINAL file before it is loaded or resized. Then resized to 400px wide (same shape, never made bigger, no height limit), white background (a transparent PNG doesn't turn black), saved as a JPEG data URL, quality 0.85 (≈ 55–80 KB). Choosing a new photo replaces the old one; a wrong new file removes the old one. Not cropped here — the card crops it with CSS `object-fit: cover` (task 10) | Please upload an image | Wrong type: Please upload a JPG, PNG or WebP image · Too big: Image must be under 10 MB · Broken file: We couldn't read this image. Please try another one. · Submit while preparing: Please wait until your photo is ready | Illustration |
| Superpower | 3–20 characters: English letters A–Z, with ONE space or hyphen between letters; starts and ends with a letter ("X-ray vision", "Fire-breathing" ok; "X--ray", "-fly" wrong) | Please enter your superpower | English letters only (3–20) | Ability |
| About you | Up to 80 characters (counted after trimming): English letters, the letter é/É (as in "Pokémon"), numbers, spaces and exactly this punctuation: `. , ! ? ' -`. The input stops at 80 characters; the counter shows the typed length, e.g. "12 / 80" | Please write something about you | English only, up to 80 characters | Flavor text |

- Errors appear when leaving a field (blur) or on submit, not while typing.
- "Create my card" is always enabled. Clicking it with problems shows ALL field errors and moves focus to the first invalid field (form order: name, age, photo, superpower, about you).
- Photo: the button "Choose a photo" (then "Choose another photo") opens the phone's camera or gallery; the hint "JPG, PNG or WebP, up to 10 MB" is always shown; while resizing: "Preparing your photo..."; a wrong file shows its error right away; "Remove photo" removes it without an error (the error comes on submit). Sideways phone photos are turned upright by the browser (EXIF).
- "Change" (favorite Pokémon) warns that the answers will be cleared only if at least one field has a value; with an empty form it changes without a warning.

## Rules

**Type** — the first game type → one of the 10 TCG Types: Grass (grass, bug), Fire, Water (water, ice), Lightning (electric), Psychic (psychic, ghost, fairy), Fighting (fighting, rock, ground), Darkness (dark, poison), Metal (steel), Dragon, Colorless (normal, flying).

**Pokédex strip** — number as 4 digits ("NO. 0025"); genus in English from `/pokemon-species/{id}` (if there is no English genus, it is left out: "NO. 0025 · HT 1'04" · WT 13.2 lbs"); height from decimeters to feet/inches — the total inches are rounded first, then split, with 2-digit inches (4 dm = 15.7 in → 1'04"; 6 dm = 23.6 in → 24 in → 2'00", not 1'12"); weight from hectograms to lbs, one decimal (60 hg → 13.2 lbs, 4600 hg → 1014.1 lbs).

**Attacks** — the Pokémon's moves that have power (from `/move/{name}`), in this order:
- **Order:** first the moves it learns by **leveling up**, lowest level first (ties keep the API's order); then all its other moves, in the API's order. *Why:* the API lists moves starting with old TM moves, so "the first 2" in API order gave Pikachu Mega Punch + Pay Day. In level-up order Pikachu gets **Thunder Shock + Quick Attack**, like its real cards.
- 2 or more with power → the first 2 in that order. Only 1 → show 1 attack. At most 20 moves are checked (in batches of 4, stopping when 2 are found).
- *Kept on purpose (task 12):* evolutions share their early level-up moves, so e.g. Charmander and Charmeleon both get Scratch + Ember. That's accepted: "the strongest move" as attack 2 was checked against PokéAPI and gave the same pair to whole lines too (Scratch + Flare Blitz), with cost-4 attacks and up to 20 move requests per Pokémon.
- None with power (e.g. Ditto) → show its first move in that order, with no damage number, cost 1 Colorless.
- No moves at all → **Struggle**, 50 damage, cost 2 Colorless (in the games, the attack a Pokémon uses when it has no moves). Its cost is **all Colorless** because Struggle has no type — an exception to "the first symbol is the card's Type".
- Moves with variable power (`power: null`, e.g. Seismic Toss) count as "no power".
- Name: the English name from the API ("Thunder Shock", "U-turn"); if there is none, the formatted slug.
- Damage = power rounded to the nearest multiple of 10, at least 10 (35 → 40, 15 → 20, 125 → 130, 4 → 10).
- Cost by damage (after rounding): 10–30 → 1 symbol, 40–70 → 2, 80–120 → 3, 130+ → 4. The first symbol is the card's Type, the rest Colorless.
- Dragon: all cost symbols are Colorless (there is no Dragon Energy).

**Weakness ×2** — a fixed table by Type (not from game damage relations):

| Type | Weakness |
|---|---|
| Grass | Fire |
| Fire | Water |
| Water | Lightning — *except first game type Ice → Metal* |
| Lightning | Fighting — *except Flying as one of its game types → Lightning (like recent Zapdos cards)* |
| Psychic | Darkness |
| Fighting | Grass |
| Darkness | Grass |
| Metal | Fire |
| Dragon | none |
| Colorless | Fighting — *except Flying as one of its game types → Lightning* |

**Resistance −30** — only these rules, otherwise none:
- Metal resists Grass.
- Psychic resists Fighting.
- Any Pokémon with Flying as one of its game types resists Fighting.

**When rules conflict**
- The Type rule wins over the Flying rule (e.g. Metal + Flying → Resistance Grass, not Fighting).
- Safety rule: if Weakness and Resistance ever end up the same Type, drop the Resistance.

**Retreat** — Colorless symbols by weight: under 100 hg → 1, 100–999 → 2, 1000+ → 3.

**Card number** — "MPC 001", assigned once when the card is created, from a counter in localStorage that only goes up.

## Card design ("Classic")
- **Size:** 380×532 design pixels (ratio 5:7). On narrower screens the whole card shrinks as one piece: every size is written in design pixels × (card width / 380), with CSS container query units.
- **Fonts** (self-hosted from Google Fonts, SIL Open Font License, `src/assets/fonts/OFL.txt`): "Barlow Condensed" 600/700 for the name, HP, attack names and damage; "Barlow" 400/600/700 for everything else. Text #1E1B14.
- **Parts** (sizes in design pixels):
  - Frame: yellow #F2C94C, 12 thick, radius 18. Panel: radius 8, padding 10 12 8, a column with 7 between the parts, background = the Type's tint.
  - Header: "BASIC" tag (10 bold italic, light background, 1px border #8C7F5A) · name (Barlow Condensed bold, 23 → 19 → 16 → 14 for longer names, at most 2 lines) · "HP" 11 + number 24, both #8B2318 · Type symbol 26. Only the name shrinks or wraps.
  - Window: 204 high, 4px gold border #C9A94A; the photo fills it, the sticker on top.
  - Pokédex strip: 10.5 italic semibold, centered, on the Type's darker strip tint.
  - Ability: the label "Ability" (11 bold italic, white on #8B2318) + the superpower (19 bold #8B2318, shown in Title Case).
  - Attacks: one row each — cost symbols 20 (the column is as wide as the attack with the most symbols on this card), name 19 bold, damage 22 bold on the right, a thin line under each row.
  - Weakness / Resistance / Retreat: 3 equal centered columns; label 9 bold uppercase with letter-spacing; value = a 16 symbol + "×2" / "−30", or "none"; Retreat = that many Colorless symbols.
  - Flavor text: a box with a 1px border #B9A66A, 11.5 italic, in quotes, exactly as typed.
  - Bottom line: 8.5, pushed to the bottom of the card (the free space goes above it): "Card design: Amit Soul · Fan-made · Not an official Pokémon card", with room on the right for "MPC 001" (task 11).
- **Names on the card:** the user's name and the superpower are shown in Title Case (a capital after a space, hyphen or apostrophe: "o'neil" → "O'Neil"); the stored values stay as typed.

## Type symbols and colors
Our own SVG icons inspired by the originals: a colored circle with a white icon — Grass leaf, Fire flame, Water droplet, Lightning bolt, Psychic eye, Fighting fist, Darkness crescent, Metal triangle, Dragon claw, Colorless star. No official logos or copyright lines. Each symbol has an accessible name ("Lightning"). Used for the Type, attack costs, Weakness, Resistance and Retreat (on the card and the details page). On a 32×32 grid the circle has radius 15 (never touching the edge, so it isn't cut at small sizes) and every icon stays inside radius 12, drawn only with straight lines and Bézier curves (checked by a test). In code: `src/components/TypeSymbol.tsx` and `src/utils/cardTheme.ts`.

| Type | Circle | Panel tint | Strip tint (a bit darker) |
|---|---|---|---|
| Grass | #3E8E3A | #D3EBBE | #BCDE9E |
| Fire | #D2461E | #FBCDC2 | #F6B2A2 |
| Water | #2A78C4 | #C4DEFB | #A5CBF3 |
| Lightning | #A67C00 | #FFF1A0 | #F9E26B |
| Psychic | #8E4BA8 | #EED2F2 | #E0B6E8 |
| Fighting | #A3521F | #E3CBA8 | #D4B488 |
| Darkness | #3B3F4A | #C3C2DA | #ADACC9 |
| Metal | #69767F | #CFD5D8 | #B9C2C7 |
| Dragon | #7D6619 | #D6D29C | #C2BD7E |
| Colorless | #8A877C | #FAF4DF | #EFE6C6 |

Every circle has at least 3:1 contrast with its white icon and with its own card's tint (WCAG 1.4.11, checked by tests). Lightning was #C99A00 in the mockup (only about 2.6:1), so it is darkened to #A67C00. With the new tints, Fire (#D9481F, 2.98:1) and Metal (#6F7C86, 2.89:1) were just below 3:1 on their tint, so they are a little darker too.

The tints were changed in task 12e2 because some Types looked alike (Darkness / Metal / Colorless gray, Fire / Fighting peach, Lightning / Dragon yellow). Tests check that every pair of tints is clearly different (ΔE76, the distance between two colors in CIELAB, at least 12), and that the dark text #1E1B14 has at least 4.5:1 on every tint and strip and the red #8B2318 (HP, Ability) at least 4.5:1 on every tint.

## The sticker
- The official artwork (transparent background) with a white outline that follows the Pokémon's shape plus a small shadow (CSS `filter: drop-shadow`, no library).
- Fixed size: 45% of the window's height, square. Starts at the bottom right, with 5 design px of free space to the right of and below its shadow (10px from the right edge, 12px from the bottom).
- After the card is created, the user can move it: drag with mouse or finger (Pointer Events), or arrow keys when it is focused (2% per press, 10% with Shift). It always stays fully inside the photo window **with its outline and shadow**: the white outline adds 2 design px on every side, and the shadow moves 2px down with a 3px blur, so the sticker keeps 5px from the left and right edges, 3px from the top and 7px from the bottom (`STICKER_MARGIN` in `src/utils/sticker.ts`, tested). Cards saved before this margin keep their saved position.
- The position is stored in percent (e.g. `{ x: 70, y: 65 }`) with the card data, so the saved card and the PNG (task 11) show it in the same place. Edit keeps it. No reset, no resizing.

## Saved cards
- Saved in the browser's localStorage under `my-poke-card/cards` as `{ "version": 1, "cards": [...] }`; the last card number given is under `my-poke-card/card-counter`. Code: `src/utils/savedCards.ts`.
- Each saved card is a full snapshot (the answers, the photo, the sticker position, the Pokémon's id/name/game types/height/weight/artwork URL, and its genus and attacks), so My Cards needs no API. Type, Weakness, Resistance and Retreat are worked out again when the card is drawn.
- **Card number:** given once, when the card is saved: (the higher of the counter and the highest saved number) + 1, shown as "MPC 001". It is also the card's id. A number is never reused, even after a delete.
- **Reading safely:** broken JSON or another format → no cards and a note; each card is checked field by field (the photo must be a `data:image/jpeg` URL and the artwork an `https://` link, because both go into an `<img src>`); broken cards are hidden and counted.
- **Hidden cards are dropped on the next write** (save, favorite or delete), because only the valid cards are written back.
- **Storage full:** the card is not saved and the counter does not change.

## Download PNG
- Code: `src/utils/downloadCardPng.ts` (with `html-to-image`, approved by the lecturer) and `src/components/DownloadPngButton.tsx`.
- **Only after saving** (on the Create page next to "Saved as MPC 00X ✓", and on every card in My Cards), so every PNG has its card number.
- **Only `.poke-card-frame` is captured:** the card itself — not the heading, the tip or the buttons. Anything focused inside it is blurred first, so no focus ring ends up in the PNG.
- **Always 760 × 1064** (2× the 380×532 design) with `pixelRatio: 1`, on every screen size and device.
- **Waits for `document.fonts.ready`**, so the PNG uses the Barlow fonts.
- **Safari and every iPhone browser (WebKit) capture twice** and keep the second image, because WebKit sometimes draws images blank in the first capture.
- **File name** from `getPngFileName`: "Amit" + Pikachu + MPC 001 → `amits-pikachu-mpc-001.png`.
- While working: "Preparing PNG..." (`aria-busy`); on failure: "Sorry, the PNG couldn't be created. Please try again."
- **Open item for task 12:** check the PNG on Safari on a real iPhone (images, fonts, the sticker's outline and shadow).

## Note on Types
We use the 10 current TCG Types. "Type" is the card's category (the symbol top-right); "Energy" means Energy cards and attack costs. Fairy was retired from the TCG in 2020, and Fairy Pokémon are printed as Psychic — still true in the 2025–26 Mega Evolution series (e.g. Mega Gardevoir ex). Poison Pokémon are printed as Darkness in the current era.

## Examples

| Pokémon | Game types | Type | Weakness | Resistance |
|---|---|---|---|---|
| Pikachu | electric | Lightning | Fighting | none |
| Charmander | fire | Fire | Water | none |
| Gardevoir | psychic / fairy | Psychic | Darkness | Fighting −30 |
| Glaceon | ice | Water | Metal | none |
| Pidgey | normal / flying | Colorless | Lightning | Fighting −30 |
| Snorlax | normal | Colorless | Fighting | none |
| Dragonite | dragon / flying | Dragon | none | Fighting −30 |
| Zapdos | electric / flying | Lightning | Lightning | Fighting −30 |
| Skarmory | steel / flying | Metal | Fire | Grass −30 |

