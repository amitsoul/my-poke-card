// Shows one Pokémon's details. Display only: the page fetches the data and passes it in.
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { getArtworkUrl } from '../utils/api.ts'
import { getCardType } from '../utils/cardType.ts'

interface PokemonDetailsProps {
  details: PokemonDetailsResponse
}

export default function PokemonDetails({ details }: PokemonDetailsProps) {
  // 25 → "#025"
  const number = '#' + String(details.id).padStart(3, '0')
  // Some Pokémon have no official artwork in the response; fall back to the artwork URL built from the id
  const image = details.sprites.other['official-artwork'].front_default || getArtworkUrl(details.id)
  // Sort by slot so the first type is always first (it decides the card type)
  const gameTypes = [...details.types].sort((a, b) => a.slot - b.slot).map((item) => item.type.name)

  return (
    <section className="pokemon-details">
      <img src={image} alt={details.name} width="250" height="250" />
      <h1 className="pokemon-name">{details.name}</h1>
      <p className="pokemon-number">{number}</p>
      <p className="pokemon-card-type">Type: {getCardType(gameTypes)}</p>
      <p className="pokemon-weight">Weight: {(details.weight / 10).toFixed(1)} kg</p>
    </section>
  )
}
