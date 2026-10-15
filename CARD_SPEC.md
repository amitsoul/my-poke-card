# Card spec — My Poke Card

> How the personal card looks and how every value on it is calculated. Linked from [PRD.md](PRD.md).
> Rules follow real Pokémon TCG cards, not the video games.

## Layout (top to bottom)
- **Top row:** "BASIC" stage top-left · name "<User name>'s <Pokémon>" (e.g. "Amit's Pikachu", TCG "Trainer's Pokémon" style) · "HP" + the user's exact age (1–120, intentional) · Type symbol top-right.
- **Frame color** by Type.
- **Illustration:** the user's photo + the Pokémon's official artwork.
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

## Type symbols
Our own SVG icons inspired by the originals: a colored circle with a white icon — Grass leaf, Fire flame, Water droplet, Lightning bolt, Psychic eye, Fighting fist, Darkness crescent, Metal triangle, Dragon claw, Colorless star. No official logos or copyright lines.

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

