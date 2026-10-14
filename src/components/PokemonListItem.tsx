// One Pokémon in the list: image + name. Clicking it opens its details page.
import { Link, useLocation } from 'react-router'
import type { PokemonSummary } from '../types/pokemon.ts'

interface PokemonListItemProps {
  pokemon: PokemonSummary
}

export default function PokemonListItem({ pokemon }: PokemonListItemProps) {
  // The list's current "?q=…&type=…", handed to the details page so "Back to list" can return to it
  const { search } = useLocation()

  return (
    <li>
      <Link to={`/pokemon/${pokemon.id}`} state={{ listSearch: search }} className="pokemon-card">
        <img src={pokemon.image} alt={pokemon.name} width="120" height="120" loading="lazy" />
        <p className="pokemon-name">{pokemon.name}</p>
      </Link>
    </li>
  )
}
