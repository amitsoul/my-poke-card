// The list of Pokémon. Renders one PokemonListItem per Pokémon.
import PokemonListItem from './PokemonListItem.jsx'

export default function PokemonList({ pokemonList, selectedPokemon, onSelect }) {
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
