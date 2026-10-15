// Search + card type filter for the Pokémon list. Plain functions, so they can be tested without React.
import type { PokemonSummary } from '../types/pokemon.ts'

// "  PIKA " → "pika": the form we compare names with (PokéAPI names are lowercase)
export function normalizeSearch(searchText: string): string {
  return searchText.trim().toLowerCase()
}

// Keeps the Pokémon whose name contains the search text AND (if cardTypeIds is a Set) whose id is in it.
// cardTypeIds = null means "All": no card type filter.
export function filterPokemon(
  list: PokemonSummary[],
  searchText: string,
  cardTypeIds: Set<number> | null,
): PokemonSummary[] {
  const search = normalizeSearch(searchText)
  return list.filter((pokemon) => {
    const matchesSearch = pokemon.name.includes(search)
    const matchesCardType = cardTypeIds === null || cardTypeIds.has(pokemon.id)
    return matchesSearch && matchesCardType
  })
}
