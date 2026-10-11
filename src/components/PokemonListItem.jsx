// One Pokémon in the list: image + name. Clicking it tells App which Pokémon was picked.

export default function PokemonListItem({ pokemon, isSelected, onSelect }) {
  return (
    <li>
      <button
        type="button"
        className={isSelected ? 'pokemon-card selected' : 'pokemon-card'}
        onClick={() => onSelect(pokemon)}
      >
        <img src={pokemon.image} alt={pokemon.name} width="120" height="120" />
        <p className="pokemon-name">{pokemon.name}</p>
      </button>
    </li>
  )
}
