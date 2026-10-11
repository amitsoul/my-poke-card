// The list of Pokémon. Renders one PokemonListItem per Pokémon.
import PokemonListItem from './PokemonListItem.jsx'

export default function PokemonList({ pokemonList }) {
  return (
    <ul>
      {pokemonList.map((pokemon) => (
        <PokemonListItem key={pokemon.id} pokemon={pokemon} />
      ))}
    </ul>
  )
}
