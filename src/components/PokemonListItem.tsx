// One Pokémon in the list: image + name. Clicking it tells App which Pokémon was picked.
import type { PokemonSummary } from '../types/pokemon.ts'

interface PokemonListItemProps {
  pokemon: PokemonSummary
  isSelected: boolean
  onSelect: (pokemon: PokemonSummary) => void
}

export default function PokemonListItem({ pokemon, isSelected, onSelect }: PokemonListItemProps) {
  return (
    <li>
      <button
        type="button"
        className={isSelected ? 'pokemon-card selected' : 'pokemon-card'}
        onClick={() => onSelect(pokemon)}
      >
        <img src={pokemon.image} alt={pokemon.name} width="120" height="120" loading="lazy" />
        <p className="pokemon-name">{pokemon.name}</p>
      </button>
    </li>
  )
}
