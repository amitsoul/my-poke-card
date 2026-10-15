// One Pokémon in the list: image + name. Clicking it opens its details page.
import { Link, useLocation } from 'react-router'
import type { PokemonSummary } from '../types/pokemon.ts'
import { formatPokemonName } from '../utils/pokemonDetails.ts'

interface PokemonListItemProps {
  pokemon: PokemonSummary
}

export default function PokemonListItem({ pokemon }: PokemonListItemProps) {
  // The list's current "?q=…&type=…", handed to the details page so "Back to list" can return to it
  const { search } = useLocation()
  // Same display name as the details page ("ho-oh" → "Ho-Oh")
  const name = formatPokemonName(pokemon.name)

  return (
    <li>
      <Link to={`/pokemon/${pokemon.id}`} state={{ listSearch: search }} className="pokemon-card">
        {/* crossOrigin on EVERY artwork image: the browser then caches one CORS version, which the PNG export (task 11) can read */}
        <img src={pokemon.image} alt={name} width="120" height="120" loading="lazy" crossOrigin="anonymous" />
        <p className="pokemon-name">{name}</p>
      </Link>
    </li>
  )
}
