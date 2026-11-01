// Finding Pokémon by name for the Create page's Pokémon search (PokemonPicker). Plain functions, no React.
// The same rule as the list page's search (normalizeSearch, so a space counts as a hyphen, + "the name contains it").
import type { PokemonSummary } from '../types/pokemon.ts'
import { normalizeSearch } from './filterPokemon.ts'
import { formatPokemonName } from './pokemonDetails.ts'

// At most this many matches are shown under the field
export const MAX_MATCHES = 10

// "pika" → the Pokémon whose name contains it (case-insensitive): names that START with it first, then the
// others; inside each group by number. At most `limit`. An empty search finds nothing (the list stays closed).
export function findPokemonMatches(list: PokemonSummary[], text: string, limit: number = MAX_MATCHES): PokemonSummary[] {
  const search = normalizeSearch(text)
  if (search === '') return []
  const byNumber = list.filter((pokemon) => pokemon.name.includes(search)).sort((a, b) => a.id - b.id)
  const startsWith = byNumber.filter((pokemon) => pokemon.name.startsWith(search))
  const contains = byNumber.filter((pokemon) => !pokemon.name.startsWith(search))
  return [...startsWith, ...contains].slice(0, limit)
}

// The Pokémon whose name is exactly the text (case-insensitive), as the API writes it ("mr-mime") or as we show
// it ("Mr-Mime"), or with a space ("mr mime") — used when the user leaves the field without picking.
// null when there is no exact match.
export function findExactPokemon(list: PokemonSummary[], text: string): PokemonSummary | null {
  const search = normalizeSearch(text)
  if (search === '') return null
  return list.find((pokemon) => pokemon.name === search || formatPokemonName(pokemon.name).toLowerCase() === search) ?? null
}
