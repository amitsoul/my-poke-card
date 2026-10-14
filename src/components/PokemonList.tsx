// The list of Pokémon. Renders one PokemonListItem per Pokémon.
import type { PokemonSummary } from '../types/pokemon.ts'
import PokemonListItem from './PokemonListItem.tsx'

interface PokemonListProps {
  pokemonList: PokemonSummary[]
  selectedPokemon: PokemonSummary | null // null = nothing selected yet
  onSelect: (pokemon: PokemonSummary) => void
}

export default function PokemonList({ pokemonList, selectedPokemon, onSelect }: PokemonListProps) {
  return (
    <ul className="pokemon-grid">
      {pokemonList.map((pokemon) => (
        <PokemonListItem
          key={pokemon.id}
          pokemon={pokemon}
          isSelected={selectedPokemon !== null && selectedPokemon.id === pokemon.id}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
