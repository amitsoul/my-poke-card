// Under the "Your favorite Pokémon" search: the chosen Pokémon's image, name and Type.
// Display only: the page loads the Pokémon and passes its state in (loading, ready, or an error with "Try again").
import type { PokemonDetailsState } from '../hooks/usePokemonDetails.ts'
import { getCardType } from '../utils/cardType.ts'
import { formatPokemonName, getDetailsImage, getGameTypes } from '../utils/pokemonDetails.ts'

interface PokemonPreviewProps {
  state: PokemonDetailsState
  onRetry: () => void
}

export default function PokemonPreview({ state, onRetry }: PokemonPreviewProps) {
  if (state.status === 'loading') return <p className="loading-text">Loading your Pokémon...</p>

  // "not-found" never gets here: the page shows "Pokémon not found" instead of the form
  if (state.status !== 'ready') {
    return (
      <div className="favorite-pokemon-error">
        <p>Oops! We couldn't load this Pokémon. Please check your internet connection.</p>
        <button type="button" className="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  const name = formatPokemonName(state.details.name)
  return (
    <div className="favorite-pokemon">
      {/* crossOrigin on EVERY artwork image: the browser then caches one CORS version, which the PNG export (task 11) can read */}
      <img src={getDetailsImage(state.details)} alt={name} width="120" height="120" crossOrigin="anonymous" />
      <div className="favorite-info">
        <p className="favorite-name">{name}</p>
        <p>Type: {getCardType(getGameTypes(state.details))}</p>
      </div>
    </div>
  )
}
