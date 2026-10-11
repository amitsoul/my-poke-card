// One Pokémon in the list: image + name.

export default function PokemonListItem({ pokemon }) {
  return (
    <li className="pokemon-card">
      <img src={pokemon.image} alt={pokemon.name} width="120" height="120" />
      <p className="pokemon-name">{pokemon.name}</p>
    </li>
  )
}
