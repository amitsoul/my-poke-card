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

// GET /pokemon/{id}
export interface PokemonDetailsResponse {
  id: number
  name: string
  types: PokemonTypeSlot[]
  height: number // decimeters
  weight: number // hectograms
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

// GET /type/{type}
export interface TypeResponse {
  pokemon: TypePokemonSlot[]
}

// ---------- Our app ----------

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
