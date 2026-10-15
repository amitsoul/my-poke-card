// The first field of the Create card form: the chosen Pokémon, with a "Change" button.
// Display only: the page loads the Pokémon and decides what "Change" does (maybe warn first).
import type { Ref } from 'react'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { getCardType } from '../utils/cardType.ts'
import { formatPokemonName, getDetailsImage, getGameTypes } from '../utils/pokemonDetails.ts'

interface FavoritePokemonFieldProps {
  details: PokemonDetailsResponse
  onChangePokemon: () => void
  changeButtonRef?: Ref<HTMLButtonElement> // lets the page move focus back to "Change"
}

export default function FavoritePokemonField({ details, onChangePokemon, changeButtonRef }: FavoritePokemonFieldProps) {
  const name = formatPokemonName(details.name)

  return (
    <fieldset className="favorite-field">
      <legend>Your favorite Pokémon</legend>
      <div className="favorite-pokemon">
        <img src={getDetailsImage(details)} alt={name} width="120" height="120" />
        <div className="favorite-info">
          <p className="favorite-name">{name}</p>
          <p>Type: {getCardType(getGameTypes(details))}</p>
          <button type="button" className="button" ref={changeButtonRef} onClick={onChangePokemon}>
            Change
          </button>
        </div>
      </div>
    </fieldset>
  )
}
