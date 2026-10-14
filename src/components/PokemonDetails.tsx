// Details of the selected Pokémon. Shows a message when nothing is selected.
// The list only has id, name and image, so the details are fetched here when the selection changes.
import { useEffect, useState } from 'react'
import type { PokemonDetailsResponse, PokemonSummary } from '../types/pokemon.ts'
import { API_URL, fetchJson } from '../utils/api.ts'
import { getCardType } from '../utils/cardType.ts'

interface PokemonDetailsProps {
  pokemon: PokemonSummary | null // null = nothing selected yet
}

export default function PokemonDetails({ pokemon }: PokemonDetailsProps) {
  const [details, setDetails] = useState<PokemonDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState<number>(0)

  const pokemonId = pokemon === null ? null : pokemon.id

  // Runs every time a different Pokémon is selected (or "Try again" is clicked)
  useEffect(() => {
    if (pokemonId === null) return

    // Becomes false if another Pokémon is selected before this answer arrives
    let isCurrent = true

    async function loadDetails() {
      setDetails(null)
      setIsLoading(true)
      setHasError(false)

      try {
        const data = await fetchJson<PokemonDetailsResponse>(`${API_URL}/pokemon/${pokemonId}`)
        if (isCurrent) setDetails(data)
      } catch {
        if (isCurrent) setHasError(true)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadDetails()

    // Cleanup: React calls this before the next run, so an old answer is ignored
    return () => {
      isCurrent = false
    }
  }, [pokemonId, retryCount])

  if (pokemon === null) {
    return (
      <section className="pokemon-details">
        <p>Pick a Pokémon to see its details</p>
      </section>
    )
  }

  // 25 → "#025"
  const number = '#' + String(pokemon.id).padStart(3, '0')
  // Some Pokémon have no official artwork; fall back to the list image
  const artwork = details ? details.sprites.other['official-artwork'].front_default : null
  const image = artwork || pokemon.image
  // Sort by slot so the first type is always first (it decides the card type)
  const gameTypes = details
    ? [...details.types].sort((a, b) => a.slot - b.slot).map((item) => item.type.name)
    : []

  return (
    <section className="pokemon-details">
      <img src={image} alt={pokemon.name} width="250" height="250" />
      <h2 className="pokemon-name">{pokemon.name}</h2>
      <p className="pokemon-number">{number}</p>

      {isLoading && <p>Loading details...</p>}

      {hasError && (
        <div>
          <p>Oops! We couldn't load the details.</p>
          <button type="button" className="button" onClick={() => setRetryCount(retryCount + 1)}>
            Try again
          </button>
        </div>
      )}

      {details && (
        <>
          <p className="pokemon-card-type">Type: {getCardType(gameTypes)}</p>
          <p className="pokemon-weight">Weight: {(details.weight / 10).toFixed(1)} kg</p>
        </>
      )}
    </section>
  )
}
