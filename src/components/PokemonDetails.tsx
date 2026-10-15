// Shows one Pokémon's details. Display only: the page fetches the data and passes it in.
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { getCardType } from '../utils/cardType.ts'
import { formatPokemonName, getDetailsImage, getGameTypes } from '../utils/pokemonDetails.ts'

interface PokemonDetailsProps {
  details: PokemonDetailsResponse
}

export default function PokemonDetails({ details }: PokemonDetailsProps) {
  // 25 → "#025"
  const number = '#' + String(details.id).padStart(3, '0')
  const name = formatPokemonName(details.name)

  return (
    <section className="pokemon-details">
      <img src={getDetailsImage(details)} alt={name} width="250" height="250" />
      <h1 className="pokemon-name">{name}</h1>
      <p className="pokemon-number">{number}</p>
      <p className="pokemon-card-type">Type: {getCardType(getGameTypes(details))}</p>
      <p className="pokemon-weight">Weight: {(details.weight / 10).toFixed(1)} kg</p>
    </section>
  )
}
