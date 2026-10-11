// One Pokémon in the list: image + name.

export default function PokemonListItem({ pokemon }) {
  return (
    <li>
      <img src={pokemon.image} alt={pokemon.name} width="120" height="120" />
      <p>{pokemon.name}</p>
    </li>
  )
}
