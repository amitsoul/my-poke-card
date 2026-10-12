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
- **Flavor text:** the user's one-line description.
- **Bottom line:** "Card design: Amit Soul" · card number "MPC 001" · "Fan-made · Not an official Pokémon card".

## Rules

**Type** — the first game type → one of the 10 TCG Types: Grass (grass, bug), Fire, Water (water, ice), Lightning (electric), Psychic (psychic, ghost, fairy), Fighting (fighting, rock, ground), Darkness (dark, poison), Metal (steel), Dragon, Colorless (normal, flying).

**Pokédex strip** — number as 4 digits ("NO. 0025"); genus in English from `/pokemon-species/{id}`; height from decimeters to feet/inches (4 dm → 1'04"); weight from hectograms to lbs, one decimal (60 hg → 13.2 lbs).

**Attacks** — the Pokémon's moves that have power (from `/move/{name}`):
- 2 or more → the first 2. Only 1 → show 1 attack.
- None (e.g. Ditto) → show its first move with no damage number, cost 1 Colorless.
- Damage = power rounded to a multiple of 10.
- Cost by damage: 10–30 → 1 symbol, 40–70 → 2, 80–120 → 3, 130+ → 4. The first symbol is the card's Type, the rest Colorless.
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

