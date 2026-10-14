// One Pokémon in the list: image + name. Clicking it opens its details page.
import { Link } from 'react-router'
import type { PokemonSummary } from '../types/pokemon.ts'

interface PokemonListItemProps {
  pokemon: PokemonSummary
}

export default function PokemonListItem({ pokemon }: PokemonListItemProps) {
  return (
    <li>
      <Link to={`/pokemon/${pokemon.id}`} className="pokemon-card">
        <img src={pokemon.image} alt={pokemon.name} width="120" height="120" loading="lazy" />
        <p className="pokemon-name">{pokemon.name}</p>
      </Link>
    </li>
  )
}
