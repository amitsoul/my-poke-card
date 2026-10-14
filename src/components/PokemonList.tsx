// The list of Pokémon. Renders one PokemonListItem per Pokémon.
import type { PokemonSummary } from '../types/pokemon.ts'
import PokemonListItem from './PokemonListItem.tsx'

interface PokemonListProps {
  pokemonList: PokemonSummary[]
}

export default function PokemonList({ pokemonList }: PokemonListProps) {
  return (
    <ul className="pokemon-grid">
      {pokemonList.map((pokemon) => (
        <PokemonListItem key={pokemon.id} pokemon={pokemon} />
      ))}
    </ul>
  )
}
