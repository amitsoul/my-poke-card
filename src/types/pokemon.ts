// Types for the PokéAPI data we use, and for our own app data.
// API types list ONLY the fields we read — PokéAPI sends many more, and that's fine.

// ---------- PokéAPI responses ----------

// A link to another resource, e.g. { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }
export interface NamedApiResource {
  name: string
  url: string
}

// GET /pokemon-species?limit=1 — we only need the total
export interface SpeciesCountResponse {
  count: number
}

// GET /pokemon?limit=… — names + urls, no details
export interface PokemonListResponse {
  results: NamedApiResource[]
}

// One of a Pokémon's types; slot 1 is its first type
export interface PokemonTypeSlot {
  slot: number
  type: NamedApiResource
}

// How a Pokémon learns a move in one game version, e.g. by "level-up" at level 1
export interface PokemonMoveVersionDetail {
  level_learned_at: number
  move_learn_method: NamedApiResource // "level-up", "machine", "egg", "tutor", …
}

// One move the Pokémon can learn, with how it learns it in each game version
export interface PokemonMoveSlot {
  move: NamedApiResource
  version_group_details: PokemonMoveVersionDetail[]
}

// GET /pokemon/{id}
export interface PokemonDetailsResponse {
  id: number
  name: string
  types: PokemonTypeSlot[]
  height: number // decimeters
  weight: number // hectograms
  moves: PokemonMoveSlot[]
  sprites: {
    other: {
      'official-artwork': {
        front_default: string | null // some Pokémon have no artwork
      }
    }
  }
}

// One Pokémon that has this type; slot 1 means it's their first type
export interface TypePokemonSlot {
  slot: number
  pokemon: NamedApiResource
}

// GET /pokemon-species/{id} — we only need the genus ("Mouse Pokémon"), in English
export interface SpeciesResponse {
  genera: { genus: string; language: NamedApiResource }[]
}

// GET /move/{name}
export interface MoveResponse {
  name: string // the slug, e.g. "thunder-shock"
  power: number | null // null for status moves (Growl) and variable-power moves (Seismic Toss)
  names: { name: string; language: NamedApiResource }[] // "Thunder Shock" in English, and other languages
}

// GET /type/{type}
export interface TypeResponse {
  pokemon: TypePokemonSlot[]
}

// ---------- Our app ----------

// The Pokémon data a card is drawn from — built from the API on the Create page,
// and stored as it is with every saved card, so My Cards needs no API
export interface CardPokemon {
  id: number
  name: string // the API's slug, e.g. "pikachu"
  gameTypes: string[] // in slot order, e.g. ['electric']
  height: number // decimeters
  weight: number // hectograms
  artworkUrl: string
}

// One Pokémon in the list
export interface PokemonSummary {
  id: number
  name: string
  image: string
}

// The 10 TCG card types — no other string is allowed
export type CardType =
  | 'Grass'
  | 'Fire'
  | 'Water'
  | 'Lightning'
  | 'Psychic'
  | 'Fighting'
  | 'Darkness'
  | 'Metal'
  | 'Dragon'
  | 'Colorless'
