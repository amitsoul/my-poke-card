// The first field of the Create card form: the chosen Pokémon, with a "Change" link back to the list.
// Display only: the page loads the Pokémon and passes it in.
import { Link } from 'react-router'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { getCardType } from '../utils/cardType.ts'
import { formatPokemonName, getDetailsImage, getGameTypes } from '../utils/pokemonDetails.ts'

interface FavoritePokemonFieldProps {
  details: PokemonDetailsResponse
}

export default function FavoritePokemonField({ details }: FavoritePokemonFieldProps) {
  const name = formatPokemonName(details.name)

  return (
    <fieldset className="favorite-field">
      <legend>Your favorite Pokémon</legend>
      <div className="favorite-pokemon">
        <img src={getDetailsImage(details)} alt={name} width="120" height="120" />
        <div className="favorite-info">
          <p className="favorite-name">{name}</p>
          <p>Type: {getCardType(getGameTypes(details))}</p>
          <Link to="/" className="button">
            Change
          </Link>
        </div>
      </div>
    </fieldset>
  )
}
